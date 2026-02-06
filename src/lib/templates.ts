import fs from 'fs'
import path from 'path'
import { ContentTemplate, Platform } from './types'

const DATA_PATH = path.join(process.cwd(), 'data', 'templates.json')

export function loadTemplates(): ContentTemplate[] {
  try {
    if (!fs.existsSync(DATA_PATH)) {
      return []
    }
    const data = fs.readFileSync(DATA_PATH, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Failed to load templates:', error)
    return []
  }
}

export function saveTemplates(templates: ContentTemplate[]): void {
  try {
    const dir = path.dirname(DATA_PATH)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(DATA_PATH, JSON.stringify(templates, null, 2))
  } catch (error) {
    console.error('Failed to save templates:', error)
    throw error
  }
}

export function getTemplateById(id: string): ContentTemplate | undefined {
  const templates = loadTemplates()
  return templates.find(t => t.id === id)
}

export function getTemplatesByProject(projectId: string): ContentTemplate[] {
  const templates = loadTemplates()
  return templates.filter(t => t.projectId === projectId)
}

export function getTemplatesByPlatform(platform: Platform): ContentTemplate[] {
  const templates = loadTemplates()
  return templates.filter(t => t.platform === platform)
}

export function createTemplate(data: Omit<ContentTemplate, 'id' | 'usageCount' | 'createdAt' | 'updatedAt'>): ContentTemplate {
  const templates = loadTemplates()
  const now = new Date().toISOString()
  
  const template: ContentTemplate = {
    ...data,
    id: `tpl-${Date.now()}`,
    usageCount: 0,
    createdAt: now,
    updatedAt: now,
  }
  
  templates.push(template)
  saveTemplates(templates)
  return template
}

export function updateTemplate(id: string, updates: Partial<ContentTemplate>): ContentTemplate | null {
  const templates = loadTemplates()
  const index = templates.findIndex(t => t.id === id)
  
  if (index === -1) return null
  
  templates[index] = {
    ...templates[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  
  saveTemplates(templates)
  return templates[index]
}

export function deleteTemplate(id: string): boolean {
  const templates = loadTemplates()
  const filtered = templates.filter(t => t.id !== id)
  
  if (filtered.length === templates.length) return false
  
  saveTemplates(filtered)
  return true
}

export function incrementTemplateUsage(id: string): ContentTemplate | null {
  const templates = loadTemplates()
  const index = templates.findIndex(t => t.id === id)
  
  if (index === -1) return null
  
  templates[index].usageCount += 1
  templates[index].updatedAt = new Date().toISOString()
  saveTemplates(templates)
  
  return templates[index]
}
