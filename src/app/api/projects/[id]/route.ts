import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/projects/[id] - Get a single project
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const project = await prisma.project.findUnique({
      where: { id },
    })
    
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      project: {
        ...project,
        platforms: JSON.parse(project.platforms),
        marketingPlan: JSON.parse(project.marketingPlan),
        settings: JSON.parse(project.settings),
      }
    })
  } catch (error) {
    console.error('Failed to get project:', error)
    return NextResponse.json(
      { error: 'Failed to get project' },
      { status: 500 }
    )
  }
}

// PATCH /api/projects/[id] - Update a project
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const updates = await request.json()
    
    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(updates.name && { name: updates.name }),
        ...(updates.description && { description: updates.description }),
        ...(updates.icon && { icon: updates.icon }),
        ...(updates.color && { color: updates.color }),
        ...(updates.type && { type: updates.type }),
        ...(updates.platforms && { platforms: JSON.stringify(updates.platforms) }),
        ...(updates.marketingPlan && { marketingPlan: JSON.stringify(updates.marketingPlan) }),
        ...(updates.settings && { settings: JSON.stringify(updates.settings) }),
      },
    })
    
    return NextResponse.json({
      project: {
        ...project,
        platforms: JSON.parse(project.platforms),
        marketingPlan: JSON.parse(project.marketingPlan),
        settings: JSON.parse(project.settings),
      }
    })
  } catch (error) {
    console.error('Failed to update project:', error)
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    )
  }
}

// DELETE /api/projects/[id] - Delete a project
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    await prisma.project.delete({
      where: { id },
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete project:', error)
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    )
  }
}
