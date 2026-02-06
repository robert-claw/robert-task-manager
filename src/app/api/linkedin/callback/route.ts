import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  if (error) {
    return NextResponse.json({ error, errorDescription }, { status: 400 })
  }

  if (!code) {
    return NextResponse.json({ error: 'No authorization code received' }, { status: 400 })
  }

  // Exchange code for access token
  const clientId = process.env.LINKEDIN_CLIENT_ID
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET
  const redirectUri = 'https://task-manager.robert-claw.com/api/linkedin/callback'

  try {
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: clientId!,
        client_secret: clientSecret!,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (tokenData.error) {
      return NextResponse.json({ error: tokenData.error, description: tokenData.error_description }, { status: 400 })
    }

    // Return the token info (in production, store this securely)
    return new NextResponse(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>LinkedIn Connected!</title>
          <style>
            body { font-family: system-ui; background: #0f172a; color: #e2e8f0; padding: 40px; }
            .container { max-width: 600px; margin: 0 auto; }
            h1 { color: #22d3ee; }
            pre { background: #1e293b; padding: 20px; border-radius: 8px; overflow-x: auto; }
            .success { color: #4ade80; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>✅ LinkedIn Connected!</h1>
            <p class="success">Authorization successful. Copy the access token below:</p>
            <pre>${JSON.stringify(tokenData, null, 2)}</pre>
            <p>Send this access token to Robert to complete setup.</p>
          </div>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' },
    })
  } catch (err) {
    return NextResponse.json({ error: 'Token exchange failed', details: String(err) }, { status: 500 })
  }
}
