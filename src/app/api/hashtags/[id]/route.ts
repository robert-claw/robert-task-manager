import { NextRequest, NextResponse } from 'next/server'
import { getHashtagGroupById, updateHashtagGroup, deleteHashtagGroup, incrementHashtagUsage } from '@/lib/hashtags'

// GET /api/hashtags/[id] - Get single hashtag group
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const group = getHashtagGroupById(id)
    
    if (!group) {
      return NextResponse.json(
        { error: 'Hashtag group not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ hashtagGroup: group })
  } catch (error) {
    console.error('Failed to get hashtag group:', error)
    return NextResponse.json(
      { error: 'Failed to get hashtag group' },
      { status: 500 }
    )
  }
}

// PATCH /api/hashtags/[id] - Update hashtag group
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const updates = await request.json()
    
    // Handle usage increment
    if (updates.action === 'incrementUsage') {
      const group = incrementHashtagUsage(id)
      if (!group) {
        return NextResponse.json({ error: 'Hashtag group not found' }, { status: 404 })
      }
      return NextResponse.json({ hashtagGroup: group })
    }
    
    const group = updateHashtagGroup(id, updates)
    
    if (!group) {
      return NextResponse.json(
        { error: 'Hashtag group not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ hashtagGroup: group })
  } catch (error) {
    console.error('Failed to update hashtag group:', error)
    return NextResponse.json(
      { error: 'Failed to update hashtag group' },
      { status: 500 }
    )
  }
}

// DELETE /api/hashtags/[id] - Delete hashtag group
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const deleted = deleteHashtagGroup(id)
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Hashtag group not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete hashtag group:', error)
    return NextResponse.json(
      { error: 'Failed to delete hashtag group' },
      { status: 500 }
    )
  }
}
