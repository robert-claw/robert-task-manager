import { NextRequest, NextResponse } from 'next/server'
import { loadNotifications, addNotification, markNotificationsRead, getUnreadNotifications } from '@/lib/tasks'

// GET /api/notifications - Get all notifications (or unread only)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unread') === 'true'
    
    const notifications = unreadOnly ? getUnreadNotifications() : loadNotifications()
    return NextResponse.json({ notifications })
  } catch (error) {
    console.error('Failed to get notifications:', error)
    return NextResponse.json(
      { error: 'Failed to load notifications' },
      { status: 500 }
    )
  }
}

// POST /api/notifications - Create a notification
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    if (!data.taskId || !data.taskTitle || !data.message || !data.from) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const notification = addNotification({
      taskId: data.taskId,
      taskTitle: data.taskTitle,
      message: data.message,
      from: data.from,
    })

    return NextResponse.json({ notification }, { status: 201 })
  } catch (error) {
    console.error('Failed to create notification:', error)
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    )
  }
}

// PATCH /api/notifications - Mark notifications as read
export async function PATCH(request: NextRequest) {
  try {
    const data = await request.json()
    
    markNotificationsRead(data.ids)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update notifications:', error)
    return NextResponse.json(
      { error: 'Failed to update notifications' },
      { status: 500 }
    )
  }
}
