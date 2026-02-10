/**
 * Type-safe filter builders for API routes
 * Eliminates `any` types and provides autocomplete for filter parameters
 */

import { Prisma } from '@prisma/client'

// Content filters
export interface ContentFilterParams {
  projectId?: string
  status?: string
  platform?: string
  type?: string
  priority?: string
  funnelStage?: string
  createdBy?: string
  assignee?: string
}

export function buildContentFilters(params: ContentFilterParams): Prisma.ContentWhereInput {
  const where: Prisma.ContentWhereInput = {}
  
  if (params.projectId) where.projectId = params.projectId
  if (params.status) where.status = params.status
  if (params.platform) where.platform = params.platform
  if (params.type) where.type = params.type
  if (params.priority) where.priority = params.priority
  if (params.funnelStage) where.funnelStage = params.funnelStage
  if (params.createdBy) where.createdBy = params.createdBy
  if (params.assignee) where.assignee = params.assignee
  
  return where
}

// Campaign filters
export interface CampaignFilterParams {
  projectId?: string
  status?: string
  createdBy?: string
}

export function buildCampaignFilters(params: CampaignFilterParams): Prisma.CampaignWhereInput {
  const where: Prisma.CampaignWhereInput = {}
  
  if (params.projectId) where.projectId = params.projectId
  if (params.status) where.status = params.status
  
  return where
}

// Idea filters
export interface IdeaFilterParams {
  projectId?: string
  status?: string
  createdBy?: string
}

export function buildIdeaFilters(params: IdeaFilterParams): Prisma.IdeaWhereInput {
  const where: Prisma.IdeaWhereInput = {}
  
  if (params.projectId) where.projectId = params.projectId
  if (params.status) where.status = params.status
  if (params.createdBy) where.createdBy = params.createdBy
  
  return where
}

// Template filters
export interface TemplateFilterParams {
  projectId?: string
  platform?: string
  funnelStage?: string
}

export function buildTemplateFilters(params: TemplateFilterParams): Prisma.TemplateWhereInput {
  const where: Prisma.TemplateWhereInput = {}
  
  if (params.projectId) where.projectId = params.projectId
  if (params.platform) where.platform = params.platform
  if (params.funnelStage) where.funnelStage = params.funnelStage
  
  return where
}

// Hashtag filters
export interface HashtagFilterParams {
  projectId?: string
  platform?: string
  tag?: string
}

export function buildHashtagFilters(params: HashtagFilterParams): Prisma.HashtagWhereInput {
  const where: Prisma.HashtagWhereInput = {}
  
  if (params.projectId) where.projectId = params.projectId
  if (params.platform) where.platform = params.platform
  if (params.tag) where.tag = { contains: params.tag, mode: 'insensitive' }
  
  return where
}

// Analytics filters
export interface AnalyticsFilterParams {
  projectId?: string
  platform?: string
  metric?: string
  period?: string
}

export function buildAnalyticsFilters(params: AnalyticsFilterParams): Prisma.AnalyticsWhereInput {
  const where: Prisma.AnalyticsWhereInput = {}
  
  if (params.projectId) where.projectId = params.projectId
  if (params.platform) where.platform = params.platform
  if (params.metric) where.metric = params.metric
  if (params.period) where.period = params.period
  
  return where
}

// Notification filters
export interface NotificationFilterParams {
  userId?: string
  type?: string
  read?: boolean
}

export function buildNotificationFilters(params: NotificationFilterParams): Prisma.NotificationWhereInput {
  const where: Prisma.NotificationWhereInput = {}
  
  if (params.userId) where.userId = params.userId
  if (params.type) where.type = params.type
  if (params.read !== undefined) where.read = params.read
  
  return where
}

// Activity filters
export interface ActivityFilterParams {
  userId?: string
  type?: string
}

export function buildActivityFilters(params: ActivityFilterParams): Prisma.ActivityWhereInput {
  const where: Prisma.ActivityWhereInput = {}
  
  if (params.userId) where.userId = params.userId
  if (params.type) where.type = params.type
  
  return where
}
