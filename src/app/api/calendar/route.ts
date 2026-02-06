import { NextRequest, NextResponse } from 'next/server'
import { getCalendarEvents, loadContent } from '@/lib/content'

// GET /api/calendar - Get calendar events
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('start')
    const endDate = searchParams.get('end')
    const projectIds = searchParams.get('projects')?.split(',').filter(Boolean)
    
    // Default to current month if no dates provided
    const now = new Date()
    const defaultStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const defaultEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()
    
    const events = getCalendarEvents(
      startDate || defaultStart,
      endDate || defaultEnd,
      projectIds
    )
    
    // Also get pending/draft content without dates for sidebar
    const content = loadContent()
    const unscheduled = content.filter(c => {
      const matchesProject = !projectIds || projectIds.length === 0 || projectIds.includes(c.projectId)
      const hasPendingStatus = ['draft', 'ready_for_review', 'changes_requested', 'approved'].includes(c.status)
      const notScheduled = !c.scheduledFor
      return matchesProject && hasPendingStatus && notScheduled
    })
    
    return NextResponse.json({ 
      events,
      unscheduled: unscheduled.map(c => ({
        id: c.id,
        title: c.title,
        platform: c.platform,
        status: c.status,
        projectId: c.projectId,
      }))
    })
  } catch (error) {
    console.error('Failed to get calendar events:', error)
    return NextResponse.json(
      { error: 'Failed to load calendar events' },
      { status: 500 }
    )
  }
}
