import fs from 'fs'
import path from 'path'
import { 
  generateSecretKey, 
  getPublicKey, 
  finalizeEvent,
  verifyEvent,
} from 'nostr-tools/pure'
import { bytesToHex, hexToBytes } from '@noble/hashes/utils.js'
import { SimplePool } from 'nostr-tools/pool'
import { nip19 } from 'nostr-tools'
import type { Event, UnsignedEvent } from 'nostr-tools/pure'

const SECRETS_PATH = path.join(process.cwd(), 'data', '.secrets', 'nostr.json')
const DEFAULT_RELAYS = [
  'wss://relay.damus.io',
  'wss://relay.nostr.band',
  'wss://nos.lol',
  'wss://relay.snort.social',
  'wss://nostr.wine',
]

interface NostrSecrets {
  privateKeyHex: string
  relays: string[]
  createdAt: string
}

interface NostrConfig {
  publicKeyHex: string
  publicKeyNpub: string
  relays: string[]
  configured: boolean
}

// Ensure secrets directory exists
function ensureSecretsDir(): void {
  const dir = path.dirname(SECRETS_PATH)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true, mode: 0o700 })
  }
}

// Load secrets from file
function loadSecrets(): NostrSecrets | null {
  try {
    if (!fs.existsSync(SECRETS_PATH)) {
      return null
    }
    const data = fs.readFileSync(SECRETS_PATH, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Failed to load Nostr secrets:', error)
    return null
  }
}

// Save secrets to file
function saveSecrets(secrets: NostrSecrets): void {
  ensureSecretsDir()
  fs.writeFileSync(SECRETS_PATH, JSON.stringify(secrets, null, 2), { mode: 0o600 })
}

// Generate a new keypair
export function generateKeyPair(): { privateKeyHex: string; publicKeyHex: string; nsec: string; npub: string } {
  const secretKey = generateSecretKey()
  const privateKeyHex = bytesToHex(secretKey)
  const publicKeyHex = getPublicKey(secretKey)
  
  return {
    privateKeyHex,
    publicKeyHex,
    nsec: nip19.nsecEncode(secretKey),
    npub: nip19.npubEncode(publicKeyHex),
  }
}

// Configure Nostr with a private key (hex or nsec format)
export function configureNostr(privateKey: string, relays?: string[]): NostrConfig {
  let privateKeyHex: string
  
  // Handle nsec format
  if (privateKey.startsWith('nsec')) {
    const decoded = nip19.decode(privateKey)
    if (decoded.type !== 'nsec') {
      throw new Error('Invalid nsec format')
    }
    privateKeyHex = bytesToHex(decoded.data)
  } else {
    // Assume hex format
    privateKeyHex = privateKey.toLowerCase()
    if (!/^[0-9a-f]{64}$/.test(privateKeyHex)) {
      throw new Error('Invalid private key format (expected 64 hex chars or nsec)')
    }
  }
  
  const secretKey = hexToBytes(privateKeyHex)
  const publicKeyHex = getPublicKey(secretKey)
  
  const secrets: NostrSecrets = {
    privateKeyHex,
    relays: relays || DEFAULT_RELAYS,
    createdAt: new Date().toISOString(),
  }
  
  saveSecrets(secrets)
  
  return {
    publicKeyHex,
    publicKeyNpub: nip19.npubEncode(publicKeyHex),
    relays: secrets.relays,
    configured: true,
  }
}

// Get current config (public info only - never expose private key)
export function getNostrConfig(): NostrConfig | null {
  const secrets = loadSecrets()
  if (!secrets) {
    return null
  }
  
  const secretKey = hexToBytes(secrets.privateKeyHex)
  const publicKeyHex = getPublicKey(secretKey)
  
  return {
    publicKeyHex,
    publicKeyNpub: nip19.npubEncode(publicKeyHex),
    relays: secrets.relays,
    configured: true,
  }
}

// Update relay list
export function updateRelays(relays: string[]): void {
  const secrets = loadSecrets()
  if (!secrets) {
    throw new Error('Nostr not configured')
  }
  
  secrets.relays = relays
  saveSecrets(secrets)
}

// Create and sign a text note (kind 1)
export async function createNote(content: string, tags: string[][] = []): Promise<Event> {
  const secrets = loadSecrets()
  if (!secrets) {
    throw new Error('Nostr not configured')
  }
  
  const secretKey = hexToBytes(secrets.privateKeyHex)
  const publicKeyHex = getPublicKey(secretKey)
  
  const unsignedEvent: UnsignedEvent = {
    kind: 1,
    pubkey: publicKeyHex,
    created_at: Math.floor(Date.now() / 1000),
    tags,
    content,
  }
  
  return finalizeEvent(unsignedEvent, secretKey)
}

// Publish event to relays
export async function publishEvent(event: Event): Promise<{ relay: string; success: boolean; message?: string }[]> {
  const secrets = loadSecrets()
  if (!secrets) {
    throw new Error('Nostr not configured')
  }
  
  if (!verifyEvent(event)) {
    throw new Error('Invalid event signature')
  }
  
  const pool = new SimplePool()
  const results: { relay: string; success: boolean; message?: string }[] = []
  
  try {
    const promises = secrets.relays.map(async (relay) => {
      try {
        await Promise.race([
          pool.publish([relay], event),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))
        ])
        results.push({ relay, success: true })
      } catch (error) {
        results.push({ 
          relay, 
          success: false, 
          message: error instanceof Error ? error.message : 'Unknown error' 
        })
      }
    })
    
    await Promise.all(promises)
  } finally {
    pool.close(secrets.relays)
  }
  
  return results
}

// Post a note and publish to relays
export async function postNote(content: string, hashtags: string[] = []): Promise<{ 
  event: Event; 
  results: { relay: string; success: boolean; message?: string }[] 
}> {
  // Convert hashtags to tags
  const tags: string[][] = hashtags.map(tag => ['t', tag.replace(/^#/, '').toLowerCase()])
  
  const event = await createNote(content, tags)
  const results = await publishEvent(event)
  
  return { event, results }
}

// Create a delete event (kind 5) for an existing event
export async function deleteNote(eventId: string): Promise<{ 
  event: Event; 
  results: { relay: string; success: boolean; message?: string }[] 
}> {
  const secrets = loadSecrets()
  if (!secrets) {
    throw new Error('Nostr not configured')
  }
  
  const secretKey = hexToBytes(secrets.privateKeyHex)
  const publicKeyHex = getPublicKey(secretKey)
  
  const unsignedEvent: UnsignedEvent = {
    kind: 5, // Deletion event
    pubkey: publicKeyHex,
    created_at: Math.floor(Date.now() / 1000),
    tags: [['e', eventId]],
    content: 'deleted',
  }
  
  const event = finalizeEvent(unsignedEvent, secretKey)
  const results = await publishEvent(event)
  
  return { event, results }
}

// Check if an event exists on relays
export async function checkEventExists(eventId: string): Promise<{ relay: string; exists: boolean }[]> {
  const secrets = loadSecrets()
  if (!secrets) {
    throw new Error('Nostr not configured')
  }
  
  const pool = new SimplePool()
  const results: { relay: string; exists: boolean }[] = []
  
  try {
    const promises = secrets.relays.map(async (relay) => {
      try {
        const events = await pool.querySync([relay], { ids: [eventId] })
        results.push({ relay, exists: events.length > 0 })
      } catch {
        results.push({ relay, exists: false })
      }
    })
    
    await Promise.allSettled(promises)
  } finally {
    pool.close(secrets.relays)
  }
  
  return results
}

// Clear Nostr configuration
export function clearNostrConfig(): void {
  if (fs.existsSync(SECRETS_PATH)) {
    fs.unlinkSync(SECRETS_PATH)
  }
}
