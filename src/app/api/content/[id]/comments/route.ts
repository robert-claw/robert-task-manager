import { NextRequest, NextResponse } from 'next/server'
import { getContent, updateContent } from '@/lib/content'
import { Comment } from '@/lib/types'

interface RouteParams {
  params: Promise<{ id: string }>
}

// POST /api/content/[id]/comments - Add a comment
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()
    
    const { author, text, notifyRobert } = body
    
    if (!author || !text) {
      return NextResponse.json(
        { error: 'Author and text are required' },
        { status: 400 }
      )
    }
    
    const content = getContent(id)
    
    if (!content) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      )
    }
    
    // Create new comment
    const newComment: Comment = {
      id: Date.now().toString(),
      author,
      text,
      createdAt: new Date().toISOString(),
      notifyRobert,
    }
    
    // Add to comments array
    const comments = [...(content.comments || []), newComment]
    
    const updated = updateContent(id, { comments })
    
    return NextResponse.json({ content: updated, comment: newComment })
  } catch (error) {
    console.error('Failed to add comment:', error)
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    )
  }
}

// GET /api/content/[id]/comments - Get comments
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
    
    return NextResponse.json({ comments: content.comments || [] })
  } catch (error) {
    console.error('Failed to get comments:', error)
    return NextResponse.json(
      { error: 'Failed to get comments' },
      { status: 500 }
    )
  }
}
