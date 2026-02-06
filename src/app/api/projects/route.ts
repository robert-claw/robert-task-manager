import { NextRequest, NextResponse } from 'next/server'
import { loadProjects, createProject } from '@/lib/projects'

// GET /api/projects - List all projects
export async function GET() {
  try {
    const projects = loadProjects()
    return NextResponse.json({ projects })
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

    const project = createProject({
      name: data.name,
      slug: data.slug,
      description: data.description || '',
      icon: data.icon || '📁',
      color: data.color || '#6b7280',
      platforms: data.platforms || [],
      marketingPlan: data.marketingPlan || {
        goals: [],
        targetAudience: '',
        contentPillars: [],
      },
      settings: data.settings || {
        timezone: 'UTC',
        defaultAssignee: 'leon',
        autoSchedule: false,
      },
    })

    return NextResponse.json({ project }, { status: 201 })
  } catch (error) {
    console.error('Failed to create project:', error)
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}
