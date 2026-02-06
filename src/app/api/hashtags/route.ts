import { NextRequest, NextResponse } from 'next/server'
import { loadHashtagGroups, createHashtagGroup, getHashtagGroupsByProject, getHashtagGroupsByPlatform } from '@/lib/hashtags'
import { Platform } from '@/lib/types'

// GET /api/hashtags - List hashtag groups with optional filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const projectId = searchParams.get('projectId')
    const platform = searchParams.get('platform')
    
    let groups = loadHashtagGroups()
    
    if (projectId) {
      groups = groups.filter(g => g.projectId === projectId)
    }
    if (platform) {
      groups = groups.filter(g => g.platform === platform)
    }
    
    // Sort by usageCount descending
    groups.sort((a, b) => b.usageCount - a.usageCount)
    
    return NextResponse.json({ hashtagGroups: groups })
  } catch (error) {
    console.error('Failed to get hashtag groups:', error)
    return NextResponse.json(
      { error: 'Failed to load hashtag groups' },
      { status: 500 }
    )
  }
}

// POST /api/hashtags - Create new hashtag group
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    if (!data.projectId || !data.name || !data.platform || !data.hashtags) {
      return NextResponse.json(
        { error: 'Missing required fields: projectId, name, platform, hashtags' },
        { status: 400 }
      )
    }

    const group = createHashtagGroup({
      projectId: data.projectId,
      name: data.name,
      description: data.description || '',
      platform: data.platform as Platform,
      hashtags: data.hashtags,
    })

    return NextResponse.json({ hashtagGroup: group }, { status: 201 })
  } catch (error) {
    console.error('Failed to create hashtag group:', error)
    return NextResponse.json(
      { error: 'Failed to create hashtag group' },
      { status: 500 }
    )
  }
}
