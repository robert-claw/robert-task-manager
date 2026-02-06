import { NextRequest, NextResponse } from 'next/server'
import { validateSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ valid: false }, { status: 401 })
    }

    const result = validateSession(token)
    
    if (!result.valid) {
      return NextResponse.json({ valid: false }, { status: 401 })
    }

    return NextResponse.json({
      valid: true,
      user: result.user,
    })
  } catch (error) {
    return NextResponse.json({ valid: false }, { status: 500 })
  }
}
