import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import crypto from 'crypto'

const s3Client = new S3Client({
  region: process.env.HETZNER_REGION || 'nbg1',
  endpoint: process.env.HETZNER_ENDPOINT || 'https://nbg1.your-objectstorage.com',
  credentials: {
    accessKeyId: process.env.HETZNER_ACCESS_KEY!,
    secretAccessKey: process.env.HETZNER_SECRET_KEY!,
  },
  forcePathStyle: false, // Use virtual-hosted-style URLs
})

const BUCKET_NAME = process.env.HETZNER_BUCKET || 'robert-claw'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type (images and videos)
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'
    ]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images and videos are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (max 100MB for videos, 10MB for images)
    const maxSize = file.type.startsWith('video/') ? 100 * 1024 * 1024 : 10 * 1024 * 1024
    if (file.size > maxSize) {
      const limit = file.type.startsWith('video/') ? '100MB' : '10MB'
      return NextResponse.json(
        { error: `File too large. Maximum size is ${limit}.` },
        { status: 400 }
      )
    }

    // Generate unique filename
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    const fileExt = file.name.split('.').pop()
    const uniqueId = crypto.randomBytes(16).toString('hex')
    const filename = `uploads/${uniqueId}.${fileExt}`

    // Upload to Hetzner Object Storage
    const uploadCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: filename,
      Body: buffer,
      ContentType: file.type,
      ACL: 'public-read', // Make publicly accessible
    })

    await s3Client.send(uploadCommand)

    // Construct public URL
    const publicUrl = `https://${BUCKET_NAME}.${process.env.HETZNER_ENDPOINT?.replace('https://', '') || 'nbg1.your-objectstorage.com'}/${filename}`

    return NextResponse.json({
      success: true,
      file: {
        id: uniqueId,
        type: file.type.startsWith('video/') ? 'video' : 'image',
        url: publicUrl,
        filename: file.name,
        mimeType: file.type,
      }
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
