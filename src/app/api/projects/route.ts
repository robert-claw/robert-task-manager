import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-server'

// GET /api/projects - List all projects
export async function GET() {
  try {
    await requireAuth()
    
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
    })
    
    // Parse JSON fields for response
    const projectsWithParsedFields = projects.map(project => ({
      ...project,
      platforms: JSON.parse(project.platforms),
      marketingPlan: JSON.parse(project.marketingPlan),
      settings: JSON.parse(project.settings),
    }))
    
    return NextResponse.json({ projects: projectsWithParsedFields })
  } catch (error) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Failed to get projects:', error)
    return NextResponse.json(
      { error: 'Failed to load projects' },
      { status: 500 }
    )
  }
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
    await requireAuth()
    
    const data = await request.json()
    
    if (!data.name || !data.slug) {
      return NextResponse.json(
        { error: 'Missing required fields: name and slug' },
        { status: 400 }
      )
    }

    const project = await prisma.project.create({
      data: {
        id: data.id || `${data.slug}`,
        name: data.name,
        slug: data.slug,
        description: data.description || '',
        icon: data.icon || '📁',
        color: data.color || '#6b7280',
        type: data.type || 'business',
        platforms: JSON.stringify(data.platforms || []),
        marketingPlan: JSON.stringify(data.marketingPlan || {
          goals: [],
          targetAudience: '',
          contentPillars: [],
        }),
        settings: JSON.stringify(data.settings || {
          timezone: 'UTC',
          defaultAssignee: 'leon',
          autoSchedule: false,
        }),
      },
    })

    return NextResponse.json({
      project: {
        ...project,
        platforms: JSON.parse(project.platforms),
        marketingPlan: JSON.parse(project.marketingPlan),
        settings: JSON.parse(project.settings),
      }
    }, { status: 201 })
  } catch (error) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Failed to create project:', error)
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}
