import { NextRequest, NextResponse } from 'next/server'
import { getTask, addComment, addNotification } from '@/lib/tasks'

interface RouteContext {
  params: Promise<{ id: string }>
}

// POST /api/tasks/:id/comments - Add a comment to a task
export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const data = await request.json()
    
    if (!data.text || !data.author) {
      return NextResponse.json(
        { error: 'Missing required fields (text, author)' },
        { status: 400 }
      )
    }

    const task = getTask(id)
    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    const comment = addComment(id, data.author, data.text)
    
    if (!comment) {
      return NextResponse.json(
        { error: 'Failed to add comment' },
        { status: 500 }
      )
    }

    // Create notification if notify flag is set
    if (data.notify) {
      addNotification({
        taskId: task.id,
        taskTitle: task.title,
        message: data.text,
        from: data.author,
      })
    }

    return NextResponse.json({ comment }, { status: 201 })
  } catch (error) {
    console.error('Failed to add comment:', error)
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    )
  }
}
