import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const projectId = searchParams.get('projectId')
    
    const where: any = {}
    if (projectId) where.projectId = projectId
    
    const campaigns = await prisma.campaign.findMany({
      where,
      orderBy: { createdAt: 'desc' },
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
    
    const campaignsWithParsedFields = campaigns.map(campaign => ({
      ...campaign,
      goals: JSON.parse(campaign.goals),
      metrics: campaign.metrics ? JSON.parse(campaign.metrics) : null,
      contentIds: JSON.parse(campaign.contentIds),
    }))
    
    return NextResponse.json({ campaigns: campaignsWithParsedFields })
  } catch (error) {
    console.error('Failed to get campaigns:', error)
    return NextResponse.json({ error: 'Failed to load campaigns' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const campaign = await prisma.campaign.create({
      data: {
        id: Date.now().toString(),
        projectId: data.projectId,
        name: data.name,
        description: data.description || null,
        status: data.status || 'planning',
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        goals: JSON.stringify(data.goals || []),
        metrics: data.metrics ? JSON.stringify(data.metrics) : null,
        contentIds: JSON.stringify(data.contentIds || []),
      },
    })

    return NextResponse.json({
      campaign: {
        ...campaign,
        goals: JSON.parse(campaign.goals),
        metrics: campaign.metrics ? JSON.parse(campaign.metrics) : null,
        contentIds: JSON.parse(campaign.contentIds),
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to create campaign:', error)
    return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 })
  }
}
