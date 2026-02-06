import { NextRequest, NextResponse } from 'next/server'
import { getTemplateById, updateTemplate, deleteTemplate, incrementTemplateUsage } from '@/lib/templates'

// GET /api/templates/[id] - Get single template
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const template = getTemplateById(id)
    
    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ template })
  } catch (error) {
    console.error('Failed to get template:', error)
    return NextResponse.json(
      { error: 'Failed to get template' },
      { status: 500 }
    )
  }
}

// PATCH /api/templates/[id] - Update template
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const updates = await request.json()
    
    // Handle usage increment
    if (updates.action === 'incrementUsage') {
      const template = incrementTemplateUsage(id)
      if (!template) {
        return NextResponse.json({ error: 'Template not found' }, { status: 404 })
      }
      return NextResponse.json({ template })
    }
    
    const template = updateTemplate(id, updates)
    
    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ template })
  } catch (error) {
    console.error('Failed to update template:', error)
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    )
  }
}

// DELETE /api/templates/[id] - Delete template
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const deleted = deleteTemplate(id)
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete template:', error)
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    )
  }
}
