// Platform types
export type Platform = 'linkedin' | 'twitter' | 'blog' | 'instagram' | 'facebook'

// Content status workflow
export type ContentStatus = 
  | 'draft'
  | 'ready_for_review'
  | 'changes_requested'
  | 'approved'
  | 'scheduled'
  | 'published'

// Content types
export type ContentType = 'post' | 'article' | 'tweet' | 'thread' | 'story' | 'reel'

// Priority levels
export type Priority = 'low' | 'medium' | 'high' | 'urgent'

// Project interface
export interface Project {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  color: string
  platforms: PlatformConfig[]
  marketingPlan: MarketingPlan
  settings: ProjectSettings
  createdAt: string
  updatedAt: string
}

export interface PlatformConfig {
  platform: Platform
  enabled: boolean
  accountId?: string
  accountName?: string
  connectionStatus: 'connected' | 'pending' | 'disconnected'
  cadence?: string // e.g., "4x/week", "daily"
}

export interface MarketingPlan {
  goals: string[]
  targetAudience: string
  contentPillars: string[]
  notes?: string
}

export interface ProjectSettings {
  timezone: string
  defaultAssignee: string
  autoSchedule: boolean
}

// Content item (replaces Task for content)
export interface ContentItem {
  id: string
  projectId: string
  type: ContentType
  platform: Platform
  title: string
  content: string
  media?: MediaAttachment[]
  status: ContentStatus
  priority: Priority
  scheduledFor?: string
  publishedAt?: string
  publishedUrl?: string
  createdBy: string
  assignee: string
  comments: Comment[]
  createdAt: string
  updatedAt: string
}

export interface MediaAttachment {
  id: string
  type: 'image' | 'video' | 'document'
  url: string
  filename: string
  mimeType: string
}

export interface Comment {
  id: string
  author: string
  text: string
  createdAt: string
  notifyRobert?: boolean
}

// Activity tracking
export interface Activity {
  id: string
  projectId: string
  type: string
  name: string
  description: string
  schedule: string
  lastRun?: string
  nextRun?: string
  enabled: boolean
  config: Record<string, unknown>
}

// Calendar event (derived from ContentItem)
export interface CalendarEvent {
  id: string
  contentId: string
  projectId: string
  title: string
  platform: Platform
  status: ContentStatus
  date: string
  time?: string
}

// Notification
export interface Notification {
  id: string
  type: 'comment' | 'status_change' | 'reminder' | 'system'
  contentId?: string
  projectId?: string
  message: string
  read: boolean
  createdAt: string
}

// API response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  status: 'success' | 'error'
}

// Legacy task type (for migration)
export interface LegacyTask {
  id: string
  title: string
  description: string
  status: string
  priority: string
  type: string
  assignee: string
  createdBy: string
  createdAt: string
  updatedAt: string
  comments: Comment[]
  content?: {
    platform?: string
    tweetText?: string
    scheduledFor?: string
    [key: string]: unknown
  }
}
