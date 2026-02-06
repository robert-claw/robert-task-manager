import { NextRequest, NextResponse } from 'next/server'
import { loadAnalytics, calculateAnalytics, getProjectAnalytics } from '@/lib/analytics'

// GET /api/analytics - Get analytics data
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const projectId = searchParams.get('projectId')
    const refresh = searchParams.get('refresh') === 'true'
    
    // If refresh is requested, recalculate analytics
    if (refresh) {
      const analytics = calculateAnalytics()
      
      if (projectId) {
        return NextResponse.json({ 
          projectMetrics: analytics.projectMetrics[projectId] || null,
          lastUpdated: analytics.lastUpdated
        })
      }
      
      return NextResponse.json({ analytics })
    }
    
    // Otherwise, return cached analytics
    const analytics = loadAnalytics()
    
    if (projectId) {
      return NextResponse.json({ 
        projectMetrics: analytics.projectMetrics[projectId] || null,
        lastUpdated: analytics.lastUpdated
      })
    }
    
    return NextResponse.json({ analytics })
  } catch (error) {
    console.error('Failed to get analytics:', error)
    return NextResponse.json(
      { error: 'Failed to load analytics' },
      { status: 500 }
    )
  }
}

// POST /api/analytics - Trigger analytics recalculation
export async function POST() {
  try {
    const analytics = calculateAnalytics()
    return NextResponse.json({ analytics, message: 'Analytics recalculated successfully' })
  } catch (error) {
    console.error('Failed to calculate analytics:', error)
    return NextResponse.json(
      { error: 'Failed to calculate analytics' },
      { status: 500 }
    )
  }
}
