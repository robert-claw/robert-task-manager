import { NextRequest, NextResponse } from 'next/server'
import { getCampaignById, updateCampaign, deleteCampaign, addContentToCampaign, removeContentFromCampaign } from '@/lib/campaigns'

// GET /api/campaigns/[id] - Get single campaign
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const campaign = getCampaignById(id)
    
    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ campaign })
  } catch (error) {
    console.error('Failed to get campaign:', error)
    return NextResponse.json(
      { error: 'Failed to get campaign' },
      { status: 500 }
    )
  }
}

// PATCH /api/campaigns/[id] - Update campaign
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const updates = await request.json()
    
    // Handle special actions
    if (updates.action === 'addContent' && updates.contentId) {
      const campaign = addContentToCampaign(id, updates.contentId)
      if (!campaign) {
        return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
      }
      return NextResponse.json({ campaign })
    }
    
    if (updates.action === 'removeContent' && updates.contentId) {
      const campaign = removeContentFromCampaign(id, updates.contentId)
      if (!campaign) {
        return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
      }
      return NextResponse.json({ campaign })
    }
    
    const campaign = updateCampaign(id, updates)
    
    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ campaign })
  } catch (error) {
    console.error('Failed to update campaign:', error)
    return NextResponse.json(
      { error: 'Failed to update campaign' },
      { status: 500 }
    )
  }
}

// DELETE /api/campaigns/[id] - Delete campaign
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const deleted = deleteCampaign(id)
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete campaign:', error)
    return NextResponse.json(
      { error: 'Failed to delete campaign' },
      { status: 500 }
    )
  }
}
