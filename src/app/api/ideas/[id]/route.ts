import { NextRequest, NextResponse } from 'next/server'
import { getIdeaById, updateIdea, deleteIdea, convertIdeaToContent } from '@/lib/ideas'

// GET /api/ideas/[id] - Get single idea
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const idea = getIdeaById(id)
    
    if (!idea) {
      return NextResponse.json(
        { error: 'Idea not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ idea })
  } catch (error) {
    console.error('Failed to get idea:', error)
    return NextResponse.json(
      { error: 'Failed to get idea' },
      { status: 500 }
    )
  }
}

// PATCH /api/ideas/[id] - Update idea
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const updates = await request.json()
    
    // Handle conversion to content
    if (updates.action === 'convert' && updates.contentId) {
      const idea = convertIdeaToContent(id, updates.contentId)
      if (!idea) {
        return NextResponse.json({ error: 'Idea not found' }, { status: 404 })
      }
      return NextResponse.json({ idea })
    }
    
    const idea = updateIdea(id, updates)
    
    if (!idea) {
      return NextResponse.json(
        { error: 'Idea not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ idea })
  } catch (error) {
    console.error('Failed to update idea:', error)
    return NextResponse.json(
      { error: 'Failed to update idea' },
      { status: 500 }
    )
  }
}

// DELETE /api/ideas/[id] - Delete idea
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const deleted = deleteIdea(id)
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Idea not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete idea:', error)
    return NextResponse.json(
      { error: 'Failed to delete idea' },
      { status: 500 }
    )
  }
}
