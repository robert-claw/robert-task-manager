import { NextRequest, NextResponse } from 'next/server'
import { Platform } from '@/lib/types'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const OAUTH_STATES_FILE = path.join(DATA_DIR, 'oauth-states.json')

// OAuth configuration per platform
const OAUTH_CONFIG: Record<string, {
  authUrl: string
  scopes: string[]
  clientIdEnv: string
  responseType?: string
}> = {
  linkedin: {
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    scopes: ['openid', 'profile', 'w_member_social'],
    clientIdEnv: 'LINKEDIN_CLIENT_ID',
  },
  twitter: {
    authUrl: 'https://twitter.com/i/oauth2/authorize',
    scopes: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
    clientIdEnv: 'TWITTER_CLIENT_ID',
    responseType: 'code',
  },
  instagram: {
    authUrl: 'https://api.instagram.com/oauth/authorize',
    scopes: ['user_profile', 'user_media'],
    clientIdEnv: 'INSTAGRAM_CLIENT_ID',
  },
  facebook: {
    authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    scopes: ['pages_manage_posts', 'pages_read_engagement'],
    clientIdEnv: 'FACEBOOK_CLIENT_ID',
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
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
  fs.writeFileSync(OAUTH_STATES_FILE, JSON.stringify(states, null, 2))
}

// GET /api/oauth/connect?platform=linkedin&projectId=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform') as Platform
    const projectId = searchParams.get('projectId')
    const returnUrl = searchParams.get('returnUrl') || '/projects'

    if (!platform || !projectId) {
      return NextResponse.json(
        { error: 'Missing platform or projectId' },
        { status: 400 }
      )
    }

    const config = OAUTH_CONFIG[platform]
    if (!config) {
      return NextResponse.json(
        { error: `OAuth not supported for platform: ${platform}` },
        { status: 400 }
      )
    }

    const clientId = process.env[config.clientIdEnv]
    if (!clientId) {
      return NextResponse.json(
        { error: `OAuth not configured for ${platform}. Missing ${config.clientIdEnv} environment variable.` },
        { status: 500 }
      )
    }

    // Generate state token for CSRF protection
    const state = crypto.randomBytes(32).toString('hex')
    
    // Store state for callback verification
    const states = loadOAuthStates()
    states[state] = {
      projectId,
      platform,
      returnUrl,
      createdAt: new Date().toISOString(),
    }
    // Clean up old states (older than 10 minutes)
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000
    for (const [key, value] of Object.entries(states)) {
      if (new Date(value.createdAt).getTime() < tenMinutesAgo) {
        delete states[key]
      }
    }
    saveOAuthStates(states)

    // Build callback URL
    const baseUrl = process.env.NEXTAUTH_URL || process.env.APP_URL || 'http://localhost:3030'
    const redirectUri = `${baseUrl}/api/oauth/callback`

    // Build authorization URL
    const authUrl = new URL(config.authUrl)
    authUrl.searchParams.set('client_id', clientId)
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('state', state)
    authUrl.searchParams.set('scope', config.scopes.join(' '))
    
    if (config.responseType) {
      authUrl.searchParams.set('response_type', config.responseType)
    } else {
      authUrl.searchParams.set('response_type', 'code')
    }

    // Platform-specific parameters
    if (platform === 'twitter') {
      authUrl.searchParams.set('code_challenge', 'challenge')
      authUrl.searchParams.set('code_challenge_method', 'plain')
    }

    return NextResponse.redirect(authUrl.toString())
  } catch (error) {
    console.error('OAuth connect error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate OAuth flow' },
      { status: 500 }
    )
  }
}
