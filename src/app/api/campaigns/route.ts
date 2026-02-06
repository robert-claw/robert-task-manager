import { NextRequest, NextResponse } from 'next/server'
import { loadCampaigns, createCampaign, getCampaignsByProject, getCampaignsByStatus } from '@/lib/campaigns'
import { CampaignStatus } from '@/lib/types'

// GET /api/campaigns - List campaigns with optional filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const projectId = searchParams.get('projectId')
    const status = searchParams.get('status')
    
    let campaigns = loadCampaigns()
    
    if (projectId) {
      campaigns = campaigns.filter(c => c.projectId === projectId)
    }
    if (status) {
      campaigns = campaigns.filter(c => c.status === status)
    }
    
    // Sort by startDate descending
    campaigns.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
    
    return NextResponse.json({ campaigns })
  } catch (error) {
    console.error('Failed to get campaigns:', error)
    return NextResponse.json(
      { error: 'Failed to load campaigns' },
      { status: 500 }
    )
  }
}

// POST /api/campaigns - Create new campaign
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    if (!data.projectId || !data.name) {
      return NextResponse.json(
        { error: 'Missing required fields: projectId, name' },
        { status: 400 }
      )
    }

    const campaign = createCampaign({
      projectId: data.projectId,
      name: data.name,
      description: data.description || '',
      status: (data.status as CampaignStatus) || 'planned',
      color: data.color || '#6366f1',
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      endDate: data.endDate || null,
      goals: data.goals || [],
      contentIds: data.contentIds || [],
      tags: data.tags || [],
    })

    return NextResponse.json({ campaign }, { status: 201 })
  } catch (error) {
    console.error('Failed to create campaign:', error)
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    )
  }
}
