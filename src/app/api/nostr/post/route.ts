import { NextRequest, NextResponse } from 'next/server'
import { postNote, checkEventExists } from '@/lib/nostr'

// POST - Create and publish a note
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }
    
    const hashtags = body.hashtags || []
    const { event, results } = await postNote(body.content, hashtags)
    
    const successCount = results.filter(r => r.success).length
    const failCount = results.filter(r => !r.success).length
    
    return NextResponse.json({
      message: `Published to ${successCount}/${results.length} relays`,
      eventId: event.id,
      noteId: `note1${event.id}`, // Simplified, actual nevent encoding would be better
      pubkey: event.pubkey,
      createdAt: new Date(event.created_at * 1000).toISOString(),
      content: event.content,
      results,
      summary: {
        success: successCount,
        failed: failCount,
        total: results.length,
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to post' },
      { status: 500 }
    )
  }
}

// GET - Check if an event exists on relays
export async function GET(request: NextRequest) {
  try {
    const eventId = request.nextUrl.searchParams.get('eventId')
    
    if (!eventId) {
      return NextResponse.json(
        { error: 'eventId query param required' },
        { status: 400 }
      )
    }
    
    const results = await checkEventExists(eventId)
    const existsCount = results.filter(r => r.exists).length
    
    return NextResponse.json({
      eventId,
      existsOnRelays: existsCount,
      totalRelays: results.length,
      results,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to check event' },
      { status: 500 }
    )
  }
}
