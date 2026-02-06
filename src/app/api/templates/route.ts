import { NextRequest, NextResponse } from 'next/server'
import { loadTemplates, createTemplate, getTemplatesByProject, getTemplatesByPlatform } from '@/lib/templates'
import { Platform, ContentType } from '@/lib/types'

// GET /api/templates - List templates with optional filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const projectId = searchParams.get('projectId')
    const platform = searchParams.get('platform')
    
    let templates = loadTemplates()
    
    if (projectId) {
      templates = templates.filter(t => t.projectId === projectId)
    }
    if (platform) {
      templates = templates.filter(t => t.platform === platform)
    }
    
    // Sort by usageCount descending (most used first)
    templates.sort((a, b) => b.usageCount - a.usageCount)
    
    return NextResponse.json({ templates })
  } catch (error) {
    console.error('Failed to get templates:', error)
    return NextResponse.json(
      { error: 'Failed to load templates' },
      { status: 500 }
    )
  }
}

// POST /api/templates - Create new template
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    if (!data.projectId || !data.name || !data.platform || !data.structure) {
      return NextResponse.json(
        { error: 'Missing required fields: projectId, name, platform, structure' },
        { status: 400 }
      )
    }

    const template = createTemplate({
      projectId: data.projectId,
      name: data.name,
      description: data.description || '',
      platform: data.platform as Platform,
      type: (data.type as ContentType) || 'post',
      structure: data.structure,
      variables: data.variables || [],
      hashtags: data.hashtags || [],
      bestPractices: data.bestPractices || [],
    })

    return NextResponse.json({ template }, { status: 201 })
  } catch (error) {
    console.error('Failed to create template:', error)
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    )
  }
}
