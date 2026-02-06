import fs from 'fs'
import path from 'path'
import { ContentItem, ContentStatus, ContentType, Platform, Priority, Comment, LegacyTask } from './types'

const DATA_DIR = path.join(process.cwd(), 'data')
const CONTENT_FILE = path.join(DATA_DIR, 'content.json')
const LEGACY_TASKS_FILE = path.join(DATA_DIR, 'tasks.json')

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

// Load all content items
export function loadContent(): ContentItem[] {
  ensureDataDir()
  
  if (!fs.existsSync(CONTENT_FILE)) {
    // Try to migrate from legacy tasks
    return migrateFromLegacyTasks()
  }
  
  try {
    const data = fs.readFileSync(CONTENT_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error loading content:', error)
    return []
  }
}

// Save all content items
export function saveContent(content: ContentItem[]): void {
  ensureDataDir()
  fs.writeFileSync(CONTENT_FILE, JSON.stringify(content, null, 2))
}

// Get content by ID
export function getContent(id: string): ContentItem | null {
  const content = loadContent()
  return content.find(c => c.id === id) || null
}

// Get content by project
export function getContentByProject(projectId: string): ContentItem[] {
  const content = loadContent()
  return content.filter(c => c.projectId === projectId)
}

// Get content by status
export function getContentByStatus(status: ContentStatus): ContentItem[] {
  const content = loadContent()
  return content.filter(c => c.status === status)
}

// Get content by platform
export function getContentByPlatform(platform: Platform): ContentItem[] {
  const content = loadContent()
  return content.filter(c => c.platform === platform)
}

// Get scheduled content for date range
export function getScheduledContent(startDate: string, endDate: string): ContentItem[] {
  const content = loadContent()
  return content.filter(c => {
    if (!c.scheduledFor) return false
    const scheduled = new Date(c.scheduledFor)
    return scheduled >= new Date(startDate) && scheduled <= new Date(endDate)
  })
}

// Create new content item
export function createContent(data: {
  projectId: string
  type: ContentType
  platform: Platform
  title: string
  content: string
  priority?: Priority
  scheduledFor?: string
  createdBy: string
  assignee: string
}): ContentItem {
  const content = loadContent()
  
  const newContent: ContentItem = {
    id: Date.now().toString(),
    projectId: data.projectId,
    type: data.type,
    platform: data.platform,
    title: data.title,
    content: data.content,
    status: 'draft',
    priority: data.priority || 'medium',
    scheduledFor: data.scheduledFor,
    createdBy: data.createdBy,
    assignee: data.assignee,
    comments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  
  content.push(newContent)
  saveContent(content)
  
  return newContent
}

// Update content item
export function updateContent(id: string, updates: Partial<ContentItem>): ContentItem | null {
  const content = loadContent()
  const index = content.findIndex(c => c.id === id)
  
  if (index === -1) {
    return null
  }
  
  content[index] = {
    ...content[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  
  saveContent(content)
  return content[index]
}

// Delete content item
export function deleteContent(id: string): boolean {
  const content = loadContent()
  const index = content.findIndex(c => c.id === id)
  
  if (index === -1) {
    return false
  }
  
  content.splice(index, 1)
  saveContent(content)
  return true
}

// Add comment to content item
export function addComment(contentId: string, comment: Omit<Comment, 'id' | 'createdAt'>): ContentItem | null {
  const content = loadContent()
  const index = content.findIndex(c => c.id === contentId)
  
  if (index === -1) {
    return null
  }
  
  const newComment: Comment = {
    ...comment,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  }
  
  content[index].comments.push(newComment)
  content[index].updatedAt = new Date().toISOString()
  
  saveContent(content)
  return content[index]
}

// Migrate from legacy tasks.json
function migrateFromLegacyTasks(): ContentItem[] {
  if (!fs.existsSync(LEGACY_TASKS_FILE)) {
    return []
  }
  
  try {
    const data = fs.readFileSync(LEGACY_TASKS_FILE, 'utf-8')
    const legacyTasks: LegacyTask[] = JSON.parse(data)
    
    const content: ContentItem[] = legacyTasks.map(task => {
      // Determine platform from task content or type
      let platform: Platform = 'blog'
      let contentType: ContentType = 'post'
      let contentText = task.description || ''
      
      if (task.content?.platform === 'linkedin') {
        platform = 'linkedin'
        contentType = 'post'
        contentText = task.content.tweetText || task.description || ''
      } else if (task.type === 'tweet' || task.content?.tweetText) {
        platform = task.content?.platform === 'linkedin' ? 'linkedin' : 'twitter'
        contentType = 'tweet'
        contentText = task.content?.tweetText || task.description || ''
      } else if (task.type === 'blog') {
        platform = 'blog'
        contentType = 'article'
      }
      
      // Map status
      let status: ContentStatus = 'draft'
      switch (task.status) {
        case 'ready_for_review':
          status = 'ready_for_review'
          break
        case 'approved':
          status = 'approved'
          break
        case 'published':
        case 'done':
          status = 'published'
          break
        case 'changes_requested':
          status = 'changes_requested'
          break
        default:
          status = 'draft'
      }
      
      // Determine project (default to dandelion-labs for now)
      const projectId = task.content?.platform === 'linkedin' || task.type === 'tweet' 
        ? 'dandelion-labs' 
        : 'dandelion-labs'
      
      return {
        id: task.id,
        projectId,
        type: contentType,
        platform,
        title: task.title,
        content: contentText,
        status,
        priority: (task.priority as Priority) || 'medium',
        scheduledFor: task.content?.scheduledFor,
        createdBy: task.createdBy,
        assignee: task.assignee,
        comments: task.comments || [],
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      }
    })
    
    // Save migrated content
    saveContent(content)
    
    return content
  } catch (error) {
    console.error('Error migrating legacy tasks:', error)
    return []
  }
}

// Get calendar events for a date range
export function getCalendarEvents(startDate: string, endDate: string, projectIds?: string[]) {
  const content = loadContent()
  
  return content
    .filter(c => {
      // Filter by project if specified
      if (projectIds && projectIds.length > 0 && !projectIds.includes(c.projectId)) {
        return false
      }
      
      // Include if scheduled
      if (c.scheduledFor) {
        const scheduled = new Date(c.scheduledFor)
        return scheduled >= new Date(startDate) && scheduled <= new Date(endDate)
      }
      
      // Include if published in range
      if (c.publishedAt) {
        const published = new Date(c.publishedAt)
        return published >= new Date(startDate) && published <= new Date(endDate)
      }
      
      return false
    })
    .map(c => ({
      id: `event-${c.id}`,
      contentId: c.id,
      projectId: c.projectId,
      title: c.title,
      platform: c.platform,
      status: c.status,
      date: c.scheduledFor || c.publishedAt || c.createdAt,
    }))
}
