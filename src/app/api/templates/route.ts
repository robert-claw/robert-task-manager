import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-server'

export async function GET(request: NextRequest) {
  try {
    await requireAuth()
    
    const searchParams = request.nextUrl.searchParams
    const projectId = searchParams.get('projectId')
    const platform = searchParams.get('platform')
    
    const where: any = {}
    if (projectId) where.projectId = projectId
    if (platform) where.platform = platform
    
    const templates = await prisma.template.findMany({
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
    
    const templatesWithParsedFields = templates.map(template => ({
      ...template,
      placeholders: JSON.parse(template.placeholders),
    }))
    
    return NextResponse.json({ templates: templatesWithParsedFields })
  } catch (error) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Failed to get templates:', error)
    return NextResponse.json({ error: 'Failed to load templates' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth()
    
    const data = await request.json()
    
    const template = await prisma.template.create({
      data: {
        id: Date.now().toString(),
        projectId: data.projectId,
        name: data.name,
        description: data.description || null,
        platform: data.platform,
        funnelStage: data.funnelStage || null,
        structure: data.structure,
        placeholders: JSON.stringify(data.placeholders || []),
        useCount: 0,
        createdBy: data.createdBy || 'robert',
      },
    })

    return NextResponse.json({
      template: {
        ...template,
        placeholders: JSON.parse(template.placeholders),
      }
    }, { status: 201 })
  } catch (error) {
    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Failed to create template:', error)
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 })
  }
}
