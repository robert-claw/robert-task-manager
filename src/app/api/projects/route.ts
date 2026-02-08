import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/projects - List all projects
export async function GET() {
  try {
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
    console.error('Failed to create project:', error)
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}
