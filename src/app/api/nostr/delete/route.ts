import { NextRequest, NextResponse } from 'next/server'
import { deleteNote } from '@/lib/nostr'

// POST - Delete a note (creates kind 5 deletion event)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.eventId) {
      return NextResponse.json(
        { error: 'eventId is required' },
        { status: 400 }
      )
    }
    
    const { event, results } = await deleteNote(body.eventId)
    
    const successCount = results.filter(r => r.success).length
    
    return NextResponse.json({
      message: `Deletion request sent to ${successCount}/${results.length} relays`,
      deletionEventId: event.id,
      targetEventId: body.eventId,
      results,
      note: 'Relays may take time to process deletion. Some relays may not honor delete requests.',
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete' },
      { status: 500 }
    )
  }
}
