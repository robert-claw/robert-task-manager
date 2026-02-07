# Image Upload & Personal Brand Features

## Overview
New features added to Community Manager to support personal brand content creation with images and traffic-driving links.

## Features Added

### 1. Project Types
Projects now have a `type` field:
- **`business`**: Company/brand projects (e.g., Dandelion Labs)
- **`personal`**: Personal brand projects (e.g., Leon Acosta)

This distinction allows different handling for personal vs business content.

**Current Setup:**
- Leon Acosta → `personal`
- Dandelion Labs → `business`
- Robert Claw → (not set, defaults to business)

### 2. Image Upload
Upload images directly from the New Content modal:
- Drag & drop or click to upload
- Supports: PNG, JPG, GIF, WebP
- Max size: 10MB per image
- Multiple images supported
- Preview with delete option
- Files stored in `/public/uploads/`

**API Endpoint:** `/api/upload`
- Method: POST
- Body: multipart/form-data with `file` field
- Returns: MediaAttachment object with public URL

### 3. Link Fields
Drive traffic to blog posts or landing pages:
- **Link URL**: Full URL to blog post/website
- **Link Text**: CTA text (e.g., "Read more on my blog")

**Use case:** Link Instagram/LinkedIn posts to blog articles to funnel users to newsletter signup.

### 4. Content Structure Updates
ContentItem now includes:
```typescript
{
  media?: MediaAttachment[]  // Array of uploaded images
  linkUrl?: string           // Link to blog/website
  linkText?: string          // CTA text for link
}
```

## Usage

### Creating Content with Images
1. Open New Content modal
2. Fill in title, content, etc.
3. Scroll to "Images (Optional)" section
4. Click to upload or drag & drop
5. Preview appears with delete button
6. Submit as normal

### Adding Links
1. In New Content modal, find "Link (Optional)" section
2. Enter full URL (e.g., `https://robert-claw.com/blog/cold-exposure`)
3. Enter link text (e.g., "Read full story on my blog")
4. This drives traffic to your blog/newsletter

## Personal Brand Workflow
For personal brand projects (Leon Acosta):
1. Upload photos from your activities (ice baths, diving, running, etc.)
2. Write philosophical/personal narrative content
3. Add link to related blog post
4. Drive Instagram/LinkedIn followers to blog → newsletter

## Technical Details

### Upload Directory
- Location: `/root/.openclaw/workspace/public/uploads/`
- URL pattern: `/uploads/{unique-id}.{ext}`
- Files are accessible at: `http://task-manager.robert-claw.com/uploads/{filename}`

### Security
- File type validation (images only)
- Size limit (10MB max)
- Unique filenames (crypto random hash)
- Safe file handling with Buffer

### Database
Files are not stored in database—only metadata:
- `id`: Unique identifier
- `type`: 'image' | 'video' | 'document'
- `url`: Public URL path
- `filename`: Original filename
- `mimeType`: File MIME type

## Next Steps
- [ ] Move wrong LinkedIn posts to Dandelion Labs
- [ ] Create first personal brand content with images
- [ ] Test link functionality for blog traffic
- [ ] Add video upload support (if needed)
- [ ] Consider Instagram API integration for direct posting

## Related Files
- `/src/lib/types.ts` - Type definitions
- `/src/app/api/upload/route.ts` - Upload API
- `/src/components/features/content/NewContentModal.tsx` - UI component
