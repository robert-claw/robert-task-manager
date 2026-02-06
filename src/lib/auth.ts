import crypto from 'crypto'

// Hardcoded user (no registration)
export const USERS: Record<string, string> = {
  leon: 'clawsome2026',
}

// Session storage (in production, use Redis or a database)
// Using globalThis to persist across hot reloads
const globalSessions = globalThis as unknown as {
  __sessions: Map<string, { user: string; expires: number }>
}

if (!globalSessions.__sessions) {
  globalSessions.__sessions = new Map()
}

export const sessions = globalSessions.__sessions

// Generate a secure token
export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

// Validate session
export function validateSession(token: string): { valid: boolean; user?: string } {
  const session = sessions.get(token)
  
  if (!session) {
    return { valid: false }
  }

  if (session.expires < Date.now()) {
    sessions.delete(token)
    return { valid: false }
  }

  return { valid: true, user: session.user }
}

// Create session
export function createSession(user: string): { token: string; expires: number } {
  const token = generateToken()
  const expires = Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
  
  sessions.set(token, { user, expires })
  
  // Clean up expired sessions
  for (const [key, session] of sessions.entries()) {
    if (session.expires < Date.now()) {
      sessions.delete(key)
    }
  }

  return { token, expires }
}

// Delete session
export function deleteSession(token: string): void {
  sessions.delete(token)
}
