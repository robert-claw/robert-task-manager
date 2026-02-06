import fs from 'fs'
import path from 'path'
import { HashtagGroup, Platform } from './types'

const DATA_PATH = path.join(process.cwd(), 'data', 'hashtags.json')

export function loadHashtagGroups(): HashtagGroup[] {
  try {
    if (!fs.existsSync(DATA_PATH)) {
      return []
    }
    const data = fs.readFileSync(DATA_PATH, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Failed to load hashtag groups:', error)
    return []
  }
}

export function saveHashtagGroups(groups: HashtagGroup[]): void {
  try {
    const dir = path.dirname(DATA_PATH)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(DATA_PATH, JSON.stringify(groups, null, 2))
  } catch (error) {
    console.error('Failed to save hashtag groups:', error)
    throw error
  }
}

export function getHashtagGroupById(id: string): HashtagGroup | undefined {
  const groups = loadHashtagGroups()
  return groups.find(g => g.id === id)
}

export function getHashtagGroupsByProject(projectId: string): HashtagGroup[] {
  const groups = loadHashtagGroups()
  return groups.filter(g => g.projectId === projectId)
}

export function getHashtagGroupsByPlatform(platform: Platform): HashtagGroup[] {
  const groups = loadHashtagGroups()
  return groups.filter(g => g.platform === platform)
}

export function createHashtagGroup(data: Omit<HashtagGroup, 'id' | 'usageCount' | 'createdAt'>): HashtagGroup {
  const groups = loadHashtagGroups()
  
  const group: HashtagGroup = {
    ...data,
    id: `hg-${Date.now()}`,
    usageCount: 0,
    createdAt: new Date().toISOString(),
  }
  
  groups.push(group)
  saveHashtagGroups(groups)
  return group
}

export function updateHashtagGroup(id: string, updates: Partial<HashtagGroup>): HashtagGroup | null {
  const groups = loadHashtagGroups()
  const index = groups.findIndex(g => g.id === id)
  
  if (index === -1) return null
  
  groups[index] = {
    ...groups[index],
    ...updates,
  }
  
  saveHashtagGroups(groups)
  return groups[index]
}

export function deleteHashtagGroup(id: string): boolean {
  const groups = loadHashtagGroups()
  const filtered = groups.filter(g => g.id !== id)
  
  if (filtered.length === groups.length) return false
  
  saveHashtagGroups(filtered)
  return true
}

export function incrementHashtagUsage(id: string): HashtagGroup | null {
  const groups = loadHashtagGroups()
  const index = groups.findIndex(g => g.id === id)
  
  if (index === -1) return null
  
  groups[index].usageCount += 1
  saveHashtagGroups(groups)
  
  return groups[index]
}
