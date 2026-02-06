import fs from 'fs'
import path from 'path'
import { Analytics, ContentItem, ContentStatus, Platform, ContentType } from './types'
import { loadContent } from './content'

const DATA_PATH = path.join(process.cwd(), 'data', 'analytics.json')

export function loadAnalytics(): Analytics {
  try {
    if (!fs.existsSync(DATA_PATH)) {
      return getDefaultAnalytics()
    }
    const data = fs.readFileSync(DATA_PATH, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Failed to load analytics:', error)
    return getDefaultAnalytics()
  }
}

export function saveAnalytics(analytics: Analytics): void {
  try {
    const dir = path.dirname(DATA_PATH)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(DATA_PATH, JSON.stringify(analytics, null, 2))
  } catch (error) {
    console.error('Failed to save analytics:', error)
    throw error
  }
}

function getDefaultAnalytics(): Analytics {
  return {
    lastUpdated: new Date().toISOString(),
    projectMetrics: {},
    globalMetrics: {
      totalContent: 0,
      totalPublished: 0,
      totalDrafts: 0,
      avgContentPerWeek: 0,
      contentByType: {} as Record<ContentType, number>,
    },
  }
}

export function calculateAnalytics(): Analytics {
  const content = loadContent()
  const now = new Date()
  
  // Group content by project
  const projectGroups: Record<string, ContentItem[]> = {}
  content.forEach(item => {
    if (!projectGroups[item.projectId]) {
      projectGroups[item.projectId] = []
    }
    projectGroups[item.projectId].push(item)
  })
  
  // Calculate project metrics
  const projectMetrics: Analytics['projectMetrics'] = {}
  
  Object.entries(projectGroups).forEach(([projectId, items]) => {
    // Status breakdown
    const statusBreakdown: Record<string, number> = {}
    const platformBreakdown: Record<string, number> = {}
    
    items.forEach(item => {
      statusBreakdown[item.status] = (statusBreakdown[item.status] || 0) + 1
      platformBreakdown[item.platform] = (platformBreakdown[item.platform] || 0) + 1
    })
    
    // Weekly stats (last 4 weeks)
    const weeklyStats: Analytics['projectMetrics'][string]['weeklyStats'] = []
    for (let i = 0; i < 4; i++) {
      const weekStart = new Date(now)
      weekStart.setDate(weekStart.getDate() - (weekStart.getDay() + 7 * i))
      weekStart.setHours(0, 0, 0, 0)
      
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 7)
      
      const weekItems = items.filter(item => {
        const created = new Date(item.createdAt)
        return created >= weekStart && created < weekEnd
      })
      
      const publishedItems = items.filter(item => {
        if (item.publishedAt) {
          const published = new Date(item.publishedAt)
          return published >= weekStart && published < weekEnd
        }
        return false
      })
      
      const weekNum = getWeekNumber(weekStart)
      weeklyStats.unshift({
        week: `${weekStart.getFullYear()}-W${weekNum.toString().padStart(2, '0')}`,
        drafted: weekItems.length,
        published: publishedItems.length,
        engagement: 0, // Would come from external analytics
      })
    }
    
    // Calculate content velocity
    const publishedItems = items.filter(i => i.publishedAt)
    let avgDaysToPublish = 0
    if (publishedItems.length > 0) {
      const totalDays = publishedItems.reduce((sum, item) => {
        const created = new Date(item.createdAt)
        const published = new Date(item.publishedAt!)
        return sum + Math.floor((published.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
      }, 0)
      avgDaysToPublish = Math.round(totalDays / publishedItems.length)
    }
    
    projectMetrics[projectId] = {
      postingCadence: {} as Record<Platform, { target: number; actual: number; period: 'day' | 'week' | 'month' }>,
      contentMix: {},
      statusBreakdown: statusBreakdown as Record<ContentStatus, number>,
      platformBreakdown: platformBreakdown as Record<Platform, number>,
      weeklyStats,
      topPerformingContent: [],
      contentVelocity: {
        avgDaysToPublish,
        avgDaysInReview: 0,
      },
    }
  })
  
  // Calculate global metrics
  const contentByType: Record<string, number> = {}
  content.forEach(item => {
    contentByType[item.type] = (contentByType[item.type] || 0) + 1
  })
  
  const analytics: Analytics = {
    lastUpdated: now.toISOString(),
    projectMetrics,
    globalMetrics: {
      totalContent: content.length,
      totalPublished: content.filter(c => c.status === 'published').length,
      totalDrafts: content.filter(c => c.status === 'draft').length,
      avgContentPerWeek: Math.round(content.length / 4 * 10) / 10,
      contentByType: contentByType as Record<ContentType, number>,
    },
  }
  
  saveAnalytics(analytics)
  return analytics
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

export function getProjectAnalytics(projectId: string): Analytics['projectMetrics'][string] | null {
  const analytics = calculateAnalytics()
  return analytics.projectMetrics[projectId] || null
}
