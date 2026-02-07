# Hetzner Object Storage Integration

## Overview
All media uploads (images and videos) are now stored in Hetzner Object Storage (S3-compatible) instead of local disk.

## Configuration

**Location:** `.env.local`

```bash
HETZNER_ACCESS_KEY=HNMDA0N1G2C9F9DOK7K7
HETZNER_SECRET_KEY=0SLqc0Gw7CLt5InyYVHjOIBWW5puAbOh1VfY4CpS
HETZNER_ENDPOINT=https://nbg1.your-objectstorage.com
HETZNER_BUCKET=robert-claw
HETZNER_REGION=nbg1
```

## Bucket Details

- **Name:** robert-claw
- **Region:** nbg1 (Nuremberg, Germany)
- **Access:** Public read, authenticated write
- **URL Pattern:** `https://robert-claw.nbg1.your-objectstorage.com/uploads/{filename}`

## Supported Formats

### Images
- **Formats:** PNG, JPG, GIF, WebP
- **Max size:** 10MB
- **Use case:** Social media posts, blog images, profile pictures

### Videos
- **Formats:** MP4, WebM, MOV, AVI
- **Max size:** 100MB
- **Use case:** Instagram reels, cold exposure videos, testimonials

## Upload Process

1. User clicks upload button in New Content modal
2. File validation (type + size)
3. Generate unique filename: `uploads/{uuid}.{ext}`
4. Upload to Hetzner S3 with `ACL: public-read`
5. Return public URL to frontend
6. Store URL in content metadata

## API Endpoint

**POST** `/api/upload`

**Request:** multipart/form-data with `file` field

**Response:**
```json
{
  "success": true,
  "file": {
    "id": "abc123...",
    "type": "image",
    "url": "https://robert-claw.nbg1.your-objectstorage.com/uploads/abc123.jpg",
    "filename": "cold-exposure.jpg",
    "mimeType": "image/jpeg"
  }
}
```

## Benefits

✅ **Scalable** - No disk space limits on server  
✅ **Fast** - CDN-ready, global distribution  
✅ **Reliable** - Hetzner's infrastructure, not our server  
✅ **Clean** - No local file management needed  
✅ **Public** - Direct access, no auth needed for viewing  

## Security

- Write access requires valid credentials (stored server-side only)
- Read access is public (no signatures needed)
- Files are immutable once uploaded (unique IDs)
- ACL set to `public-read` on upload

## Cost

Hetzner Object Storage pricing (as of Feb 2026):
- Storage: ~€0.005/GB/month
- Traffic: Free within Hetzner network
- Requests: Minimal cost

Estimated cost for personal brand with 100-200 media files: **< €1/month**

## Testing

Upload a test image:
1. Go to http://task-manager.robert-claw.com/content
2. Click "New Content"
3. Select Leon Acosta project
4. Scroll to Media section
5. Upload an image or video
6. Check the preview shows the Hetzner URL

## Troubleshooting

**Upload fails:**
- Check PM2 logs: `pm2 logs robert-task-manager --lines 50`
- Verify env vars are loaded: `pm2 env 2 | grep HETZNER`
- Test bucket access with AWS CLI

**Files not accessible:**
- Verify ACL is `public-read`
- Check bucket CORS settings if needed
- Ensure URL format matches: `https://{bucket}.{endpoint}/{key}`

## Migration Notes

- Old local files in `/public/uploads/` can be removed once all content references Hetzner URLs
- No database migration needed - URLs are stored in `media` field
- Existing content with local URLs will continue to work (backward compatible)
