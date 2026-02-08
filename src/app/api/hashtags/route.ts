import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const projectId = searchParams.get('projectId')
    const platform = searchParams.get('platform')
    
    const where: any = {}
    if (projectId) where.projectId = projectId
    if (platform) where.platform = platform
    
    const hashtags = await prisma.hashtag.findMany({
      where,
      orderBy: { useCount: 'desc' },
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
    
    const hashtagsWithParsedFields = hashtags.map(hashtag => ({
      ...hashtag,
      performance: hashtag.performance ? JSON.parse(hashtag.performance) : null,
    }))
    
    return NextResponse.json({ hashtags: hashtagsWithParsedFields })
  } catch (error) {
    console.error('Failed to get hashtags:', error)
    return NextResponse.json({ error: 'Failed to load hashtags' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const hashtag = await prisma.hashtag.create({
      data: {
        id: Date.now().toString(),
        projectId: data.projectId,
        tag: data.tag,
        category: data.category || null,
        platform: data.platform,
        useCount: data.useCount || 0,
        performance: data.performance ? JSON.stringify(data.performance) : null,
      },
    })

    return NextResponse.json({
      hashtag: {
        ...hashtag,
        performance: hashtag.performance ? JSON.parse(hashtag.performance) : null,
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to create hashtag:', error)
    return NextResponse.json({ error: 'Failed to create hashtag' }, { status: 500 })
  }
}
