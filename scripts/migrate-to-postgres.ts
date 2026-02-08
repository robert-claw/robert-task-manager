#!/usr/bin/env npx tsx
// Migration script: JSON files → PostgreSQL
import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { join } from 'path'

const prisma = new PrismaClient()

interface JSONProject {
  id: string
  name: string
  slug: string
  description: string
  icon?: string
  color?: string
  type?: string
  platforms: any[]
  marketingPlan: any
  settings: any
  createdAt: string
  updatedAt: string
}

interface JSONContent {
  id: string
  projectId: string
  type: string
  platform: string
  title: string
  content: string
  status: string
  priority?: string
  scheduledFor?: string
  publishedAt?: string
  funnelStage?: string
  mediaUrls?: string[]
  linkedContent?: string[]
  engagement?: any
  createdBy: string
  assignee?: string
  comments: any[]
  createdAt: string
  updatedAt: string
}

async function loadJSON<T>(filename: string): Promise<T[]> {
  try {
    const path = join(__dirname, '../data', filename)
    const data = readFileSync(path, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.warn(`⚠️  Could not load ${filename}:`, (error as Error).message)
    return []
  }
}

async function migrateProjects() {
  console.log('📦 Migrating projects...')
  const projects = await loadJSON<JSONProject>('projects.json')
  
  for (const project of projects) {
    await prisma.project.create({
      data: {
        id: project.id,
        name: project.name,
        slug: project.slug,
        description: project.description,
        icon: project.icon || null,
        color: project.color || null,
        type: project.type || 'business',
        platforms: JSON.stringify(project.platforms),
        marketingPlan: JSON.stringify(project.marketingPlan),
        settings: JSON.stringify(project.settings),
        createdAt: new Date(project.createdAt),
        updatedAt: new Date(project.updatedAt),
      }
    })
    console.log(`  ✓ ${project.name}`)
  }
  
  console.log(`✅ Migrated ${projects.length} projects\n`)
}

async function migrateContent() {
  console.log('📝 Migrating content...')
  const content = await loadJSON<JSONContent>('content.json')
  
  for (const item of content) {
    await prisma.content.create({
      data: {
        id: item.id,
        projectId: item.projectId,
        type: item.type,
        platform: item.platform,
        title: item.title,
        content: item.content,
        status: item.status,
        priority: item.priority || 'medium',
        scheduledFor: item.scheduledFor ? new Date(item.scheduledFor) : null,
        publishedAt: item.publishedAt ? new Date(item.publishedAt) : null,
        funnelStage: item.funnelStage || null,
        mediaUrls: item.mediaUrls ? JSON.stringify(item.mediaUrls) : null,
        linkedContent: item.linkedContent ? JSON.stringify(item.linkedContent) : null,
        engagement: item.engagement ? JSON.stringify(item.engagement) : null,
        createdBy: item.createdBy,
        assignee: item.assignee || null,
        comments: JSON.stringify(item.comments || []),
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      }
    })
    console.log(`  ✓ ${item.title.substring(0, 50)}...`)
  }
  
  console.log(`✅ Migrated ${content.length} content items\n`)
}

async function migrateCampaigns() {
  console.log('📢 Migrating campaigns...')
  const campaigns = await loadJSON<any>('campaigns.json')
  
  for (const campaign of campaigns) {
    await prisma.campaign.create({
      data: {
        id: campaign.id,
        projectId: campaign.projectId,
        name: campaign.name,
        description: campaign.description || null,
        status: campaign.status || 'planning',
        startDate: campaign.startDate ? new Date(campaign.startDate) : null,
        endDate: campaign.endDate ? new Date(campaign.endDate) : null,
        goals: JSON.stringify(campaign.goals || []),
        metrics: campaign.metrics ? JSON.stringify(campaign.metrics) : null,
        contentIds: JSON.stringify(campaign.contentIds || []),
        createdAt: new Date(campaign.createdAt),
        updatedAt: new Date(campaign.updatedAt),
      }
    })
    console.log(`  ✓ ${campaign.name}`)
  }
  
  console.log(`✅ Migrated ${campaigns.length} campaigns\n`)
}

async function migrateIdeas() {
  console.log('💡 Migrating ideas...')
  const ideas = await loadJSON<any>('ideas.json')
  
  for (const idea of ideas) {
    await prisma.idea.create({
      data: {
        id: idea.id,
        projectId: idea.projectId,
        title: idea.title,
        description: idea.description,
        platform: idea.platform || null,
        status: idea.status || 'backlog',
        priority: idea.priority || 'medium',
        tags: JSON.stringify(idea.tags || []),
        votes: idea.votes || 0,
        convertedToContentId: idea.convertedToContentId || null,
        createdBy: idea.createdBy || 'robert',
        createdAt: new Date(idea.createdAt),
        updatedAt: new Date(idea.updatedAt),
      }
    })
    console.log(`  ✓ ${idea.title.substring(0, 50)}...`)
  }
  
  console.log(`✅ Migrated ${ideas.length} ideas\n`)
}

async function migrateTemplates() {
  console.log('📋 Migrating templates...')
  const templates = await loadJSON<any>('templates.json')
  
  for (const template of templates) {
    await prisma.template.create({
      data: {
        id: template.id,
        projectId: template.projectId,
        name: template.name,
        description: template.description || null,
        platform: template.platform,
        funnelStage: template.funnelStage || null,
        structure: template.structure,
        placeholders: JSON.stringify(template.placeholders || template.variables || []),
        useCount: template.useCount || 0,
        createdBy: template.createdBy || 'robert',
        createdAt: new Date(template.createdAt || new Date()),
        updatedAt: new Date(template.updatedAt || new Date()),
      }
    })
    console.log(`  ✓ ${template.name}`)
  }
  
  console.log(`✅ Migrated ${templates.length} templates\n`)
}

async function migrateHashtags() {
  console.log('# Migrating hashtags...')
  const hashtags = await loadJSON<any>('hashtags.json')
  
  for (const hashtag of hashtags) {
    await prisma.hashtag.create({
      data: {
        id: hashtag.id,
        projectId: hashtag.projectId,
        tag: hashtag.tag || hashtag.name || '#unknown',
        category: hashtag.category || null,
        platform: hashtag.platform || 'linkedin',
        useCount: hashtag.useCount || 0,
        performance: hashtag.performance ? JSON.stringify(hashtag.performance) : null,
        createdAt: new Date(hashtag.createdAt || new Date()),
        updatedAt: new Date(hashtag.updatedAt || hashtag.createdAt || new Date()),
      }
    })
    console.log(`  ✓ ${hashtag.tag || hashtag.name}`)
  }
  
  console.log(`✅ Migrated ${hashtags.length} hashtags\n`)
}

async function migrateActivities() {
  console.log('📊 Migrating activities...')
  const activities = await loadJSON<any>('activities.json')
  
  for (const activity of activities) {
    // Skip activities with missing required fields
    if (!activity.type || !activity.userId || !activity.createdAt) {
      console.log(`  ⚠️  Skipping activity ${activity.id} (missing required fields)`)
      continue
    }
    
    await prisma.activity.create({
      data: {
        id: activity.id,
        type: activity.type,
        description: activity.description,
        userId: activity.userId,
        metadata: activity.metadata ? JSON.stringify(activity.metadata) : null,
        createdAt: new Date(activity.createdAt),
      }
    })
  }
  
  console.log(`✅ Migrated ${activities.length} activities\n`)
}

async function migrateNotifications() {
  console.log('🔔 Migrating notifications...')
  const notifications = await loadJSON<any>('notifications.json')
  
  for (const notification of notifications) {
    // Skip notifications with missing required fields
    if (!notification.userId || !notification.title || !notification.createdAt) {
      console.log(`  ⚠️  Skipping notification ${notification.id} (missing required fields)`)
      continue
    }
    
    await prisma.notification.create({
      data: {
        id: notification.id,
        userId: notification.userId,
        title: notification.title,
        message: notification.message,
        type: notification.type || 'info',
        read: notification.read || false,
        actionUrl: notification.actionUrl || null,
        createdAt: new Date(notification.createdAt),
      }
    })
  }
  
  console.log(`✅ Migrated ${notifications.length} notifications\n`)
}

async function migrateAnalytics() {
  console.log('📈 Migrating analytics...')
  console.log(`  ⚠️  Analytics data is aggregate/computed - skipping (will be regenerated from content)\n`)
}

async function main() {
  console.log('🚀 Starting migration from JSON to PostgreSQL...\n')
  
  try {
    await migrateProjects()
    await migrateContent()
    await migrateCampaigns()
    await migrateIdeas()
    await migrateTemplates()
    await migrateHashtags()
    await migrateActivities()
    await migrateNotifications()
    await migrateAnalytics()
    
    console.log('✅ Migration complete!\n')
    console.log('📊 Summary:')
    console.log(`  Projects: ${await prisma.project.count()}`)
    console.log(`  Content: ${await prisma.content.count()}`)
    console.log(`  Campaigns: ${await prisma.campaign.count()}`)
    console.log(`  Ideas: ${await prisma.idea.count()}`)
    console.log(`  Templates: ${await prisma.template.count()}`)
    console.log(`  Hashtags: ${await prisma.hashtag.count()}`)
    console.log(`  Activities: ${await prisma.activity.count()}`)
    console.log(`  Notifications: ${await prisma.notification.count()}`)
    console.log(`  Analytics: ${await prisma.analytics.count()}`)
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
