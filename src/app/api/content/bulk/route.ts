import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/content/bulk - Bulk operations on content
export async function POST(request: NextRequest) {
  try {
    const { action, contentIds, updates } = await request.json()
    
    if (!action || !contentIds || !Array.isArray(contentIds)) {
      return NextResponse.json(
        { error: 'Missing required fields: action, contentIds (array)' },
        { status: 400 }
      )
    }

    let result
    
    switch (action) {
      case 'approve':
        result = await prisma.content.updateMany({
          where: { id: { in: contentIds } },
          data: { status: 'approved' },
        })
        break
        
      case 'publish':
        result = await prisma.content.updateMany({
          where: { id: { in: contentIds } },
          data: { 
            status: 'published',
            publishedAt: new Date(),
          },
        })
        break
        
      case 'schedule':
        if (!updates?.scheduledFor) {
          return NextResponse.json(
            { error: 'scheduledFor is required for schedule action' },
            { status: 400 }
          )
        }
        result = await prisma.content.updateMany({
          where: { id: { in: contentIds } },
          data: { 
            status: 'scheduled',
            scheduledFor: new Date(updates.scheduledFor),
          },
        })
        break
        
      case 'draft':
        result = await prisma.content.updateMany({
          where: { id: { in: contentIds } },
          data: { status: 'draft' },
        })
        break
        
      case 'delete':
        result = await prisma.content.deleteMany({
          where: { id: { in: contentIds } },
        })
        break
        
      case 'update':
        if (!updates) {
          return NextResponse.json(
            { error: 'updates object is required for update action' },
            { status: 400 }
          )
        }
        
        const updateData: any = {}
        if (updates.status !== undefined) updateData.status = updates.status
        if (updates.priority !== undefined) updateData.priority = updates.priority
        if (updates.assignee !== undefined) updateData.assignee = updates.assignee
        if (updates.platform !== undefined) updateData.platform = updates.platform
        if (updates.funnelStage !== undefined) updateData.funnelStage = updates.funnelStage
        
        result = await prisma.content.updateMany({
          where: { id: { in: contentIds } },
          data: updateData,
        })
        break
        
      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}. Valid actions: approve, publish, schedule, draft, delete, update` },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      action,
      affected: result.count,
      contentIds,
    })
  } catch (error) {
    console.error('Bulk action failed:', error)
    return NextResponse.json(
      { error: 'Bulk action failed' },
      { status: 500 }
    )
  }
}
