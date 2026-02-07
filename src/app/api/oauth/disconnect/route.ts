import { NextRequest, NextResponse } from 'next/server'
import { Platform } from '@/lib/types'
import { getProject, updateProject } from '@/lib/projects'

// POST /api/oauth/disconnect
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectId, platform } = body as { projectId: string; platform: Platform }

    if (!projectId || !platform) {
      return NextResponse.json(
        { error: 'Missing projectId or platform' },
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

    // Find platform config
    const platformConfig = project.platforms.find(p => p.platform === platform)
    if (!platformConfig) {
      return NextResponse.json(
        { error: 'Platform not configured for this project' },
        { status: 404 }
      )
    }

    // Clear credentials and update status
    platformConfig.connectionStatus = 'disconnected'
    platformConfig.credentials = undefined
    platformConfig.connectedAt = undefined
    platformConfig.expiresAt = undefined
    platformConfig.accountId = undefined
    platformConfig.accountName = undefined
    platformConfig.connectionError = undefined

    // Save updated project
    updateProject(projectId, { platforms: project.platforms })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('OAuth disconnect error:', error)
    return NextResponse.json(
      { error: 'Failed to disconnect platform' },
      { status: 500 }
    )
  }
}
