import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/content/[id] - Get a single content item
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const content = await prisma.content.findUnique({
      where: { id },
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
    
    if (!content) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      content: {
        ...content,
        comments: JSON.parse(content.comments),
        mediaUrls: content.mediaUrls ? JSON.parse(content.mediaUrls) : null,
        linkedContent: content.linkedContent ? JSON.parse(content.linkedContent) : null,
        engagement: content.engagement ? JSON.parse(content.engagement) : null,
      }
    })
  } catch (error) {
    console.error('Failed to get content:', error)
    return NextResponse.json(
      { error: 'Failed to get content' },
      { status: 500 }
    )
  }
}

// PATCH /api/content/[id] - Update content
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const updates = await request.json()
    
    const updateData: any = {}
    if (updates.title !== undefined) updateData.title = updates.title
    if (updates.content !== undefined) updateData.content = updates.content
    if (updates.status !== undefined) updateData.status = updates.status
    if (updates.priority !== undefined) updateData.priority = updates.priority
    if (updates.scheduledFor !== undefined) updateData.scheduledFor = updates.scheduledFor ? new Date(updates.scheduledFor) : null
    if (updates.publishedAt !== undefined) updateData.publishedAt = updates.publishedAt ? new Date(updates.publishedAt) : null
    if (updates.funnelStage !== undefined) updateData.funnelStage = updates.funnelStage
    if (updates.assignee !== undefined) updateData.assignee = updates.assignee
    if (updates.mediaUrls !== undefined) updateData.mediaUrls = JSON.stringify(updates.mediaUrls)
    if (updates.linkedContent !== undefined) updateData.linkedContent = JSON.stringify(updates.linkedContent)
    if (updates.engagement !== undefined) updateData.engagement = JSON.stringify(updates.engagement)
    if (updates.comments !== undefined) updateData.comments = JSON.stringify(updates.comments)
    
    const content = await prisma.content.update({
      where: { id },
      data: updateData,
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
    })
  } catch (error) {
    console.error('Failed to update content:', error)
    return NextResponse.json(
      { error: 'Failed to update content' },
      { status: 500 }
    )
  }
}

// DELETE /api/content/[id] - Delete content
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    await prisma.content.delete({
      where: { id },
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete content:', error)
    return NextResponse.json(
      { error: 'Failed to delete content' },
      { status: 500 }
    )
  }
}
