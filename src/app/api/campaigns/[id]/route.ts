import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-server'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAuth()
    
    const { id } = await params
    const campaign = await prisma.campaign.findUnique({
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
    
    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }
    
    return NextResponse.json({
      campaign: {
        ...campaign,
        goals: JSON.parse(campaign.goals),
        metrics: campaign.metrics ? JSON.parse(campaign.metrics) : null,
        contentIds: JSON.parse(campaign.contentIds),
      }
    })
  } catch (error) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Failed to get campaign:', error)
    return NextResponse.json({ error: 'Failed to get campaign' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAuth()
    
    const { id } = await params
    const updates = await request.json()
    
    const updateData: any = {}
    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.status !== undefined) updateData.status = updates.status
    if (updates.startDate !== undefined) updateData.startDate = updates.startDate ? new Date(updates.startDate) : null
    if (updates.endDate !== undefined) updateData.endDate = updates.endDate ? new Date(updates.endDate) : null
    if (updates.goals !== undefined) updateData.goals = JSON.stringify(updates.goals)
    if (updates.metrics !== undefined) updateData.metrics = JSON.stringify(updates.metrics)
    if (updates.contentIds !== undefined) updateData.contentIds = JSON.stringify(updates.contentIds)
    
    const campaign = await prisma.campaign.update({
      where: { id },
      data: updateData,
    })
    
    return NextResponse.json({
      campaign: {
        ...campaign,
        goals: JSON.parse(campaign.goals),
        metrics: campaign.metrics ? JSON.parse(campaign.metrics) : null,
        contentIds: JSON.parse(campaign.contentIds),
      }
    })
  } catch (error) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Failed to update campaign:', error)
    return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAuth()
    
    const { id } = await params
    await prisma.campaign.delete({
      where: { id },
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Failed to delete campaign:', error)
    return NextResponse.json({ error: 'Failed to delete campaign' }, { status: 500 })
  }
}
