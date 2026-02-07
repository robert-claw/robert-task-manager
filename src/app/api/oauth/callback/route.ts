import { NextRequest, NextResponse } from 'next/server'
import { Platform, PlatformCredentials } from '@/lib/types'
import { getProject, updateProject } from '@/lib/projects'
import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const OAUTH_STATES_FILE = path.join(DATA_DIR, 'oauth-states.json')

// Token endpoints per platform
const TOKEN_CONFIG: Record<string, {
  tokenUrl: string
  clientIdEnv: string
  clientSecretEnv: string
  profileUrl?: string
}> = {
  linkedin: {
    tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
    clientIdEnv: 'LINKEDIN_CLIENT_ID',
    clientSecretEnv: 'LINKEDIN_CLIENT_SECRET',
    profileUrl: 'https://api.linkedin.com/v2/userinfo',
  },
  twitter: {
    tokenUrl: 'https://api.twitter.com/2/oauth2/token',
    clientIdEnv: 'TWITTER_CLIENT_ID',
    clientSecretEnv: 'TWITTER_CLIENT_SECRET',
    profileUrl: 'https://api.twitter.com/2/users/me',
  },
  instagram: {
    tokenUrl: 'https://api.instagram.com/oauth/access_token',
    clientIdEnv: 'INSTAGRAM_CLIENT_ID',
    clientSecretEnv: 'INSTAGRAM_CLIENT_SECRET',
    profileUrl: 'https://graph.instagram.com/me',
  },
  facebook: {
    tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
    clientIdEnv: 'FACEBOOK_CLIENT_ID',
    clientSecretEnv: 'FACEBOOK_CLIENT_SECRET',
    profileUrl: 'https://graph.facebook.com/me',
  },
}

function loadOAuthStates(): Record<string, { projectId: string; platform: string; returnUrl: string; createdAt: string }> {
  try {
    if (fs.existsSync(OAUTH_STATES_FILE)) {
      return JSON.parse(fs.readFileSync(OAUTH_STATES_FILE, 'utf-8'))
    }
  } catch (e) {
    console.error('Error loading OAuth states:', e)
  }
  return {}
}

function saveOAuthStates(states: Record<string, { projectId: string; platform: string; returnUrl: string; createdAt: string }>): void {
  fs.writeFileSync(OAUTH_STATES_FILE, JSON.stringify(states, null, 2))
}

async function exchangeCodeForToken(
  platform: string,
  code: string,
  redirectUri: string
): Promise<{ credentials: PlatformCredentials; profile?: { id: string; name: string } }> {
  const config = TOKEN_CONFIG[platform]
  if (!config) {
    throw new Error(`Token exchange not configured for ${platform}`)
  }

  const clientId = process.env[config.clientIdEnv]
  const clientSecret = process.env[config.clientSecretEnv]

  if (!clientId || !clientSecret) {
    throw new Error(`Missing OAuth credentials for ${platform}`)
  }

  // Exchange code for token
  const tokenParams = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret,
  })

  // Twitter requires different auth method
  let tokenResponse: Response
  if (platform === 'twitter') {
    tokenParams.set('code_verifier', 'challenge')
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
    tokenResponse = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${basicAuth}`,
      },
      body: tokenParams.toString(),
    })
  } else {
    tokenResponse = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenParams.toString(),
    })
  }

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text()
    console.error(`Token exchange failed for ${platform}:`, errorText)
    throw new Error(`Failed to exchange code for token: ${tokenResponse.status}`)
  }

  const tokenData = await tokenResponse.json()

  const credentials: PlatformCredentials = {
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token,
    tokenType: tokenData.token_type,
    scope: tokenData.scope,
    expiresIn: tokenData.expires_in,
  }

  // Fetch user profile if available
  let profile: { id: string; name: string } | undefined
  if (config.profileUrl && credentials.accessToken) {
    try {
      const profileResponse = await fetch(config.profileUrl, {
        headers: {
          'Authorization': `Bearer ${credentials.accessToken}`,
        },
      })
      
      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        
        // Parse profile based on platform
        if (platform === 'linkedin') {
          profile = { id: profileData.sub, name: profileData.name }
        } else if (platform === 'twitter') {
          profile = { id: profileData.data?.id, name: profileData.data?.username }
        } else if (platform === 'instagram' || platform === 'facebook') {
          profile = { id: profileData.id, name: profileData.username || profileData.name }
        }
      }
    } catch (e) {
      console.error(`Failed to fetch profile for ${platform}:`, e)
    }
  }

  return { credentials, profile }
}

// GET /api/oauth/callback?code=xxx&state=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')

    // Handle OAuth errors
    if (error) {
      console.error('OAuth error:', error, errorDescription)
      const returnUrl = new URL('/projects', request.url)
      returnUrl.searchParams.set('oauth_error', errorDescription || error)
      return NextResponse.redirect(returnUrl.toString())
    }

    if (!code || !state) {
      return NextResponse.redirect(new URL('/projects?oauth_error=Missing+code+or+state', request.url))
    }

    // Verify state
    const states = loadOAuthStates()
    const storedState = states[state]
    
    if (!storedState) {
      return NextResponse.redirect(new URL('/projects?oauth_error=Invalid+or+expired+state', request.url))
    }

    // Clean up used state
    delete states[state]
    saveOAuthStates(states)

    const { projectId, platform, returnUrl } = storedState

    // Exchange code for token
    const baseUrl = process.env.NEXTAUTH_URL || process.env.APP_URL || 'http://localhost:3030'
    const redirectUri = `${baseUrl}/api/oauth/callback`
    
    try {
      const { credentials, profile } = await exchangeCodeForToken(platform, code, redirectUri)

      // Update project with new credentials
      const project = getProject(projectId)
      if (!project) {
        return NextResponse.redirect(new URL(`${returnUrl}?oauth_error=Project+not+found`, request.url))
      }

      // Find or create platform config
      let platformConfig = project.platforms.find(p => p.platform === platform)
      if (!platformConfig) {
        platformConfig = {
          platform: platform as Platform,
          enabled: true,
          connectionStatus: 'disconnected',
        }
        project.platforms.push(platformConfig)
      }

      // Update platform config
      platformConfig.connectionStatus = 'connected'
      platformConfig.credentials = credentials
      platformConfig.connectedAt = new Date().toISOString()
      platformConfig.accountId = profile?.id
      platformConfig.accountName = profile?.name
      platformConfig.connectionError = undefined
      
      if (credentials.expiresIn) {
        platformConfig.expiresAt = new Date(Date.now() + credentials.expiresIn * 1000).toISOString()
      }

      // Save updated project
      updateProject(projectId, { platforms: project.platforms })

      // Redirect back with success
      const successUrl = new URL(returnUrl, request.url)
      successUrl.searchParams.set('oauth_success', platform)
      return NextResponse.redirect(successUrl.toString())
    } catch (tokenError) {
      console.error('Token exchange error:', tokenError)
      
      // Update project with error status
      const project = getProject(projectId)
      if (project) {
        const platformConfig = project.platforms.find(p => p.platform === platform)
        if (platformConfig) {
          platformConfig.connectionStatus = 'error'
          platformConfig.connectionError = tokenError instanceof Error ? tokenError.message : 'Unknown error'
          updateProject(projectId, { platforms: project.platforms })
        }
      }

      const errorUrl = new URL(returnUrl, request.url)
      errorUrl.searchParams.set('oauth_error', 'Failed+to+connect')
      return NextResponse.redirect(errorUrl.toString())
    }
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect(new URL('/projects?oauth_error=Callback+failed', request.url))
  }
}
