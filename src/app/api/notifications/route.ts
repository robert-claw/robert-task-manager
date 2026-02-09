import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-server'
import { buildNotificationFilters } from '@/lib/filters'

export async function GET(request: NextRequest) {
  try {
    await requireAuth()
    
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId') || 'leon' // Default user
    const unread = searchParams.get('unread') === 'true'
    
    const where = buildNotificationFilters({
      userId,
      read: unread ? false : undefined,
    })
    
    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    
    return NextResponse.json({ notifications })
  } catch (error) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Failed to get notifications:', error)
    return NextResponse.json({ error: 'Failed to load notifications' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth()
    
    const data = await request.json()
    
    const notification = await prisma.notification.create({
      data: {
        id: Date.now().toString(),
        userId: data.userId || 'leon',
        title: data.title,
        message: data.message,
        type: data.type || 'info',
        read: false,
        actionUrl: data.actionUrl || null,
      },
    })

    return NextResponse.json({ notification }, { status: 201 })
  } catch (error) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Failed to create notification:', error)
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAuth()
    
    const data = await request.json()
    const { id, read } = data
    
    const notification = await prisma.notification.update({
      where: { id },
      data: { read },
    })

    return NextResponse.json({ notification })
  } catch (error) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Failed to update notification:', error)
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 })
  }
}
