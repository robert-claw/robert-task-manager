import { NextRequest, NextResponse } from 'next/server'
import { getContent, updateContent, deleteContent } from '@/lib/content'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/content/[id] - Get a single content item
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const content = getContent(id)
    
    if (!content) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ content })
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
    
    const content = updateContent(id, updates)
    
    if (!content) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ content })
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
    const deleted = deleteContent(id)
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete content:', error)
    return NextResponse.json(
      { error: 'Failed to delete content' },
      { status: 500 }
    )
  }
}
