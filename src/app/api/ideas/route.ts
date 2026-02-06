import { NextRequest, NextResponse } from 'next/server'
import { loadIdeas, createIdea, getIdeasByProject, getIdeasByStatus } from '@/lib/ideas'
import { IdeaStatus, IdeaSource, Platform, Priority } from '@/lib/types'

// GET /api/ideas - List ideas with optional filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const projectId = searchParams.get('projectId')
    const status = searchParams.get('status')
    
    let ideas = loadIdeas()
    
    if (projectId) {
      ideas = ideas.filter(i => i.projectId === projectId)
    }
    if (status) {
      ideas = ideas.filter(i => i.status === status)
    }
    
    // Sort by priority (high first) then createdAt
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
    ideas.sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
      if (priorityDiff !== 0) return priorityDiff
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
    
    return NextResponse.json({ ideas })
  } catch (error) {
    console.error('Failed to get ideas:', error)
    return NextResponse.json(
      { error: 'Failed to load ideas' },
      { status: 500 }
    )
  }
}

// POST /api/ideas - Create new idea
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    if (!data.projectId || !data.title) {
      return NextResponse.json(
        { error: 'Missing required fields: projectId, title' },
        { status: 400 }
      )
    }

    const idea = createIdea({
      projectId: data.projectId,
      title: data.title,
      description: data.description || '',
      source: (data.source as IdeaSource) || 'internal',
      sourceUrl: data.sourceUrl || null,
      status: (data.status as IdeaStatus) || 'backlog',
      priority: (data.priority as Priority) || 'medium',
      platforms: (data.platforms as Platform[]) || [],
      tags: data.tags || [],
      notes: data.notes || null,
    })

    return NextResponse.json({ idea }, { status: 201 })
  } catch (error) {
    console.error('Failed to create idea:', error)
    return NextResponse.json(
      { error: 'Failed to create idea' },
      { status: 500 }
    )
  }
}
