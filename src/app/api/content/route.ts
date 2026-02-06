import { NextRequest, NextResponse } from 'next/server'
import { loadContent, createContent, getContentByProject, getContentByStatus, getContentByPlatform } from '@/lib/content'
import { ContentType, Platform, ContentStatus } from '@/lib/types'

// GET /api/content - List content with optional filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const projectId = searchParams.get('projectId')
    const status = searchParams.get('status')
    const platform = searchParams.get('platform')
    
    let content = loadContent()
    
    // Apply filters
    if (projectId) {
      content = content.filter(c => c.projectId === projectId)
    }
    if (status) {
      content = content.filter(c => c.status === status)
    }
    if (platform) {
      content = content.filter(c => c.platform === platform)
    }
    
    // Sort by createdAt descending (newest first)
    content.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    
    return NextResponse.json({ content })
  } catch (error) {
    console.error('Failed to get content:', error)
    return NextResponse.json(
      { error: 'Failed to load content' },
      { status: 500 }
    )
  }
}

// POST /api/content - Create new content
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    if (!data.projectId || !data.title || !data.platform) {
      return NextResponse.json(
        { error: 'Missing required fields: projectId, title, platform' },
        { status: 400 }
      )
    }

    const content = createContent({
      projectId: data.projectId,
      type: (data.type as ContentType) || 'post',
      platform: data.platform as Platform,
      title: data.title,
      content: data.content || '',
      priority: data.priority,
      scheduledFor: data.scheduledFor,
      createdBy: data.createdBy || 'robert',
      assignee: data.assignee || 'leon',
    })

    return NextResponse.json({ content }, { status: 201 })
  } catch (error) {
    console.error('Failed to create content:', error)
    return NextResponse.json(
      { error: 'Failed to create content' },
      { status: 500 }
    )
  }
}
