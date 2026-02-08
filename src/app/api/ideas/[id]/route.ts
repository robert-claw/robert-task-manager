import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const idea = await prisma.idea.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        }
      }
    })
    
    if (!idea) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 })
    }
    
    return NextResponse.json({
      idea: {
        ...idea,
        tags: JSON.parse(idea.tags),
      }
    })
  } catch (error) {
    console.error('Failed to get idea:', error)
    return NextResponse.json({ error: 'Failed to get idea' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const updates = await request.json()
    
    const updateData: any = {}
    if (updates.title !== undefined) updateData.title = updates.title
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.platform !== undefined) updateData.platform = updates.platform
    if (updates.status !== undefined) updateData.status = updates.status
    if (updates.priority !== undefined) updateData.priority = updates.priority
    if (updates.tags !== undefined) updateData.tags = JSON.stringify(updates.tags)
    if (updates.votes !== undefined) updateData.votes = updates.votes
    if (updates.convertedToContentId !== undefined) updateData.convertedToContentId = updates.convertedToContentId
    
    const idea = await prisma.idea.update({
      where: { id },
      data: updateData,
    })
    
    return NextResponse.json({
      idea: {
        ...idea,
        tags: JSON.parse(idea.tags),
      }
    })
  } catch (error) {
    console.error('Failed to update idea:', error)
    return NextResponse.json({ error: 'Failed to update idea' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    await prisma.idea.delete({
      where: { id },
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete idea:', error)
    return NextResponse.json({ error: 'Failed to delete idea' }, { status: 500 })
  }
}
