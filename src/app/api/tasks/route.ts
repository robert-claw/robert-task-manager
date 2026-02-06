import { NextRequest, NextResponse } from 'next/server'
import { loadTasks, createTask } from '@/lib/tasks'

// GET /api/tasks - List all tasks
export async function GET() {
  try {
    const tasks = loadTasks()
    return NextResponse.json({ tasks })
  } catch (error) {
    console.error('Failed to get tasks:', error)
    return NextResponse.json(
      { error: 'Failed to load tasks' },
      { status: 500 }
    )
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Validate required fields
    if (!data.title || !data.assignee || !data.createdBy) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const task = createTask({
      title: data.title,
      description: data.description || '',
      priority: data.priority || 'medium',
      assignee: data.assignee,
      createdBy: data.createdBy,
    })

    return NextResponse.json({ task }, { status: 201 })
  } catch (error) {
    console.error('Failed to create task:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}
