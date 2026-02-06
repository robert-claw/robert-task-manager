import { NextRequest, NextResponse } from 'next/server'
import { USERS, createSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Check credentials
    const normalizedUsername = username.toLowerCase().trim()
    if (!USERS[normalizedUsername] || USERS[normalizedUsername] !== password) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
    }

    // Create session
    const { token } = createSession(normalizedUsername)

    return NextResponse.json({
      success: true,
      token,
      user: normalizedUsername,
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}
