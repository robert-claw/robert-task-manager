import { NextRequest, NextResponse } from 'next/server'
import { 
  getNostrConfig, 
  configureNostr, 
  generateKeyPair, 
  updateRelays,
  clearNostrConfig,
} from '@/lib/nostr'

// GET - Get current Nostr config (public info only)
export async function GET() {
  try {
    const config = getNostrConfig()
    
    if (!config) {
      return NextResponse.json({ 
        configured: false,
        message: 'Nostr not configured. POST a private key to set up.' 
      })
    }
    
    return NextResponse.json({
      configured: true,
      publicKey: config.publicKeyHex,
      npub: config.publicKeyNpub,
      relays: config.relays,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get config' },
      { status: 500 }
    )
  }
}

// POST - Configure Nostr with a private key or generate new keypair
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Generate new keypair
    if (body.action === 'generate') {
      const keypair = generateKeyPair()
      const config = configureNostr(keypair.privateKeyHex, body.relays)
      
      return NextResponse.json({
        message: 'New keypair generated and configured',
        publicKey: config.publicKeyHex,
        npub: config.publicKeyNpub,
        relays: config.relays,
        // Return nsec only once during generation - user must save it!
        nsec: keypair.nsec,
        warning: 'Save your nsec now! It will not be shown again.',
      })
    }
    
    // Configure with existing private key
    if (body.privateKey) {
      const config = configureNostr(body.privateKey, body.relays)
      
      return NextResponse.json({
        message: 'Nostr configured successfully',
        publicKey: config.publicKeyHex,
        npub: config.publicKeyNpub,
        relays: config.relays,
      })
    }
    
    return NextResponse.json(
      { error: 'Provide privateKey (hex or nsec) or action: "generate"' },
      { status: 400 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to configure' },
      { status: 500 }
    )
  }
}

// PATCH - Update relays
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.relays || !Array.isArray(body.relays)) {
      return NextResponse.json(
        { error: 'Provide relays array' },
        { status: 400 }
      )
    }
    
    updateRelays(body.relays)
    const config = getNostrConfig()
    
    return NextResponse.json({
      message: 'Relays updated',
      relays: config?.relays,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update relays' },
      { status: 500 }
    )
  }
}

// DELETE - Clear Nostr configuration
export async function DELETE() {
  try {
    clearNostrConfig()
    
    return NextResponse.json({
      message: 'Nostr configuration cleared',
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to clear config' },
      { status: 500 }
    )
  }
}
