import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const template = await prisma.template.findUnique({
      where: { id },
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
    
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }
    
    return NextResponse.json({
      template: {
        ...template,
        placeholders: JSON.parse(template.placeholders),
      }
    })
  } catch (error) {
    console.error('Failed to get template:', error)
    return NextResponse.json({ error: 'Failed to get template' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const updates = await request.json()
    
    const updateData: any = {}
    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.platform !== undefined) updateData.platform = updates.platform
    if (updates.funnelStage !== undefined) updateData.funnelStage = updates.funnelStage
    if (updates.structure !== undefined) updateData.structure = updates.structure
    if (updates.placeholders !== undefined) updateData.placeholders = JSON.stringify(updates.placeholders)
    if (updates.useCount !== undefined) updateData.useCount = updates.useCount
    
    const template = await prisma.template.update({
      where: { id },
      data: updateData,
    })
    
    return NextResponse.json({
      template: {
        ...template,
        placeholders: JSON.parse(template.placeholders),
      }
    })
  } catch (error) {
    console.error('Failed to update template:', error)
    return NextResponse.json({ error: 'Failed to update template' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    await prisma.template.delete({
      where: { id },
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete template:', error)
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 })
  }
}
