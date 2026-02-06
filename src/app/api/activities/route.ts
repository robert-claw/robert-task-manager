import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const ACTIVITIES_FILE = path.join(DATA_DIR, 'activities.json')

interface Activity {
  id: string
  name: string
  description: string
  interval: string
  status: 'active' | 'pending' | 'paused'
  lastRun: string | null
  nextRun: string | null
  category: string
}

function loadActivities(): Activity[] {
  try {
    if (fs.existsSync(ACTIVITIES_FILE)) {
      const data = fs.readFileSync(ACTIVITIES_FILE, 'utf-8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Failed to load activities:', error)
  }
  return []
}

function saveActivities(activities: Activity[]): void {
  fs.writeFileSync(ACTIVITIES_FILE, JSON.stringify(activities, null, 2))
}

// GET /api/activities
export async function GET() {
  try {
    const activities = loadActivities()
    return NextResponse.json({ activities })
  } catch (error) {
    console.error('Failed to get activities:', error)
    return NextResponse.json(
      { error: 'Failed to load activities' },
      { status: 500 }
    )
  }
}

// PATCH /api/activities - Update activity (e.g., lastRun, status)
export async function PATCH(request: NextRequest) {
  try {
    const { id, ...updates } = await request.json()
    
    if (!id) {
      return NextResponse.json(
        { error: 'Activity ID required' },
        { status: 400 }
      )
    }

    const activities = loadActivities()
    const index = activities.findIndex(a => a.id === id)
    
    if (index === -1) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      )
    }

    activities[index] = { ...activities[index], ...updates }
    saveActivities(activities)

    return NextResponse.json({ activity: activities[index] })
  } catch (error) {
    console.error('Failed to update activity:', error)
    return NextResponse.json(
      { error: 'Failed to update activity' },
      { status: 500 }
    )
  }
}
