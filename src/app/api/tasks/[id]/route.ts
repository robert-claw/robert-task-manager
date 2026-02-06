import { NextRequest, NextResponse } from 'next/server'
import { getTask, updateTask, deleteTask } from '@/lib/tasks'

interface RouteContext {
  params: Promise<{ id: string }>
}

// GET /api/tasks/:id - Get a single task
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const taskId = parseInt(id, 10)
    
    const task = getTask(taskId)
    
    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ task })
  } catch (error) {
    console.error('Failed to get task:', error)
    return NextResponse.json(
      { error: 'Failed to get task' },
      { status: 500 }
    )
  }
}

// PATCH /api/tasks/:id - Update a task
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const taskId = parseInt(id, 10)
    const updates = await request.json()
    
    const task = updateTask(taskId, updates)
    
    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ task })
  } catch (error) {
    console.error('Failed to update task:', error)
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    )
  }
}

// DELETE /api/tasks/:id - Delete a task
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const taskId = parseInt(id, 10)
    
    const deleted = deleteTask(taskId)
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete task:', error)
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    )
  }
}
