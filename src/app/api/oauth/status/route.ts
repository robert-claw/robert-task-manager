import { NextRequest, NextResponse } from 'next/server'
import { getProject } from '@/lib/projects'

// Platform OAuth availability
const PLATFORM_OAUTH_SUPPORT: Record<string, {
  supported: boolean
  configuredEnvVars: string[]
  displayName: string
  description: string
}> = {
  linkedin: {
    supported: true,
    configuredEnvVars: ['LINKEDIN_CLIENT_ID', 'LINKEDIN_CLIENT_SECRET'],
    displayName: 'LinkedIn',
    description: 'Post to your LinkedIn profile or company page',
  },
  twitter: {
    supported: true,
    configuredEnvVars: ['TWITTER_CLIENT_ID', 'TWITTER_CLIENT_SECRET'],
    displayName: 'Twitter/X',
    description: 'Post tweets and threads to your Twitter account',
  },
  instagram: {
    supported: true,
    configuredEnvVars: ['INSTAGRAM_CLIENT_ID', 'INSTAGRAM_CLIENT_SECRET'],
    displayName: 'Instagram',
    description: 'Post to Instagram (requires Facebook Business account)',
  },
  facebook: {
    supported: true,
    configuredEnvVars: ['FACEBOOK_CLIENT_ID', 'FACEBOOK_CLIENT_SECRET'],
    displayName: 'Facebook',
    description: 'Post to Facebook pages you manage',
  },
  blog: {
    supported: false,
    configuredEnvVars: [],
    displayName: 'Blog',
    description: 'Internal blog management (no OAuth required)',
  },
}

interface PlatformStatus {
  platform: string
  displayName: string
  description: string
  oauthSupported: boolean
  oauthConfigured: boolean
  connectionStatus: 'connected' | 'pending' | 'disconnected' | 'error' | 'not_configured'
  accountName?: string
  accountId?: string
  connectedAt?: string
  expiresAt?: string
  connectionError?: string
  enabled: boolean
}

// GET /api/oauth/status?projectId=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json(
        { error: 'Missing projectId' },
        { status: 400 }
      )
    }

    const project = getProject(projectId)
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Build status for all platforms
    const platforms: PlatformStatus[] = Object.entries(PLATFORM_OAUTH_SUPPORT).map(([platform, config]) => {
      const projectPlatform = project.platforms.find(p => p.platform === platform)
      
      // Check if OAuth is configured (env vars present)
      const oauthConfigured = config.configuredEnvVars.every(envVar => !!process.env[envVar])

      const status: PlatformStatus = {
        platform,
        displayName: config.displayName,
        description: config.description,
        oauthSupported: config.supported,
        oauthConfigured,
        connectionStatus: 'not_configured',
        enabled: projectPlatform?.enabled ?? false,
      }

      if (projectPlatform) {
        status.connectionStatus = projectPlatform.connectionStatus
        status.accountName = projectPlatform.accountName
        status.accountId = projectPlatform.accountId
        status.connectedAt = projectPlatform.connectedAt
        status.expiresAt = projectPlatform.expiresAt
        status.connectionError = projectPlatform.connectionError
        
        // Check if token is expired
        if (projectPlatform.expiresAt && new Date(projectPlatform.expiresAt) < new Date()) {
          status.connectionStatus = 'error'
          status.connectionError = 'Token expired - please reconnect'
        }
      } else if (!config.supported) {
        // Blog doesn't need OAuth
        status.connectionStatus = 'connected'
      }

      return status
    })

    return NextResponse.json({
      projectId,
      projectName: project.name,
      platforms,
    })
  } catch (error) {
    console.error('OAuth status error:', error)
    return NextResponse.json(
      { error: 'Failed to get OAuth status' },
      { status: 500 }
    )
  }
}
