import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-server'

export async function GET(request: NextRequest) {
  try {
    await requireAuth()
    
    const searchParams = request.nextUrl.searchParams
    const projectId = searchParams.get('projectId')
    const status = searchParams.get('status')
    
    const where: any = {}
    if (projectId) where.projectId = projectId
    if (status) where.status = status
    
    const ideas = await prisma.idea.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        }
      }
    })
    
    const ideasWithParsedFields = ideas.map(idea => ({
      ...idea,
      tags: JSON.parse(idea.tags),
    }))
    
    return NextResponse.json({ ideas: ideasWithParsedFields })
  } catch (error) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Failed to get ideas:', error)
    return NextResponse.json({ error: 'Failed to load ideas' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth()
    
    const data = await request.json()
    
    const idea = await prisma.idea.create({
      data: {
        id: Date.now().toString(),
        projectId: data.projectId,
        title: data.title,
        description: data.description,
        platform: data.platform || null,
        status: data.status || 'backlog',
        priority: data.priority || 'medium',
        tags: JSON.stringify(data.tags || []),
        votes: data.votes || 0,
        convertedToContentId: data.convertedToContentId || null,
        createdBy: data.createdBy || 'robert',
      },
    })

    return NextResponse.json({
      idea: {
        ...idea,
        tags: JSON.parse(idea.tags),
      }
    }, { status: 201 })
  } catch (error) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Failed to create idea:', error)
    return NextResponse.json({ error: 'Failed to create idea' }, { status: 500 })
  }
}
