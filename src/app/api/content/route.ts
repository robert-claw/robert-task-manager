import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-server'
import { buildContentFilters } from '@/lib/filters'

// GET /api/content - List content with optional filters
export async function GET(request: NextRequest) {
  try {
    await requireAuth()
    
    const searchParams = request.nextUrl.searchParams
    
    const where = buildContentFilters({
      projectId: searchParams.get('projectId') || undefined,
      status: searchParams.get('status') || undefined,
      platform: searchParams.get('platform') || undefined,
    })
    
    const content = await prisma.content.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
            color: true,
          }
        }
      }
    })
    
    // Parse JSON fields
    const contentWithParsedFields = content.map(item => ({
      ...item,
      comments: JSON.parse(item.comments),
      mediaUrls: item.mediaUrls ? JSON.parse(item.mediaUrls) : null,
      linkedContent: item.linkedContent ? JSON.parse(item.linkedContent) : null,
      engagement: item.engagement ? JSON.parse(item.engagement) : null,
    }))
    
    return NextResponse.json({ content: contentWithParsedFields })
  } catch (error) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
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
    await requireAuth()
    
    const data = await request.json()
    
    if (!data.projectId || !data.title || !data.platform) {
      return NextResponse.json(
        { error: 'Missing required fields: projectId, title, platform' },
        { status: 400 }
      )
    }

    const content = await prisma.content.create({
      data: {
        id: Date.now().toString(),
        projectId: data.projectId,
        type: data.type || 'post',
        platform: data.platform,
        title: data.title,
        content: data.content || '',
        status: data.status || 'draft',
        priority: data.priority || 'medium',
        scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : null,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
        funnelStage: data.funnelStage || null,
        mediaUrls: data.mediaUrls ? JSON.stringify(data.mediaUrls) : null,
        linkedContent: data.linkedContent ? JSON.stringify(data.linkedContent) : null,
        engagement: data.engagement ? JSON.stringify(data.engagement) : null,
        createdBy: data.createdBy || 'robert',
        assignee: data.assignee || 'leon',
        comments: JSON.stringify(data.comments || []),
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
            color: true,
          }
        }
      }
    })

    return NextResponse.json({
      content: {
        ...content,
        comments: JSON.parse(content.comments),
        mediaUrls: content.mediaUrls ? JSON.parse(content.mediaUrls) : null,
        linkedContent: content.linkedContent ? JSON.parse(content.linkedContent) : null,
        engagement: content.engagement ? JSON.parse(content.engagement) : null,
      }
    }, { status: 201 })
  } catch (error) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Failed to create content:', error)
    return NextResponse.json(
      { error: 'Failed to create content' },
      { status: 500 }
    )
  }
}
