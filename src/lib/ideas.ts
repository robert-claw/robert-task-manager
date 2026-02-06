import fs from 'fs'
import path from 'path'
import { Idea, IdeaStatus } from './types'

const DATA_PATH = path.join(process.cwd(), 'data', 'ideas.json')

export function loadIdeas(): Idea[] {
  try {
    if (!fs.existsSync(DATA_PATH)) {
      return []
    }
    const data = fs.readFileSync(DATA_PATH, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Failed to load ideas:', error)
    return []
  }
}

export function saveIdeas(ideas: Idea[]): void {
  try {
    const dir = path.dirname(DATA_PATH)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(DATA_PATH, JSON.stringify(ideas, null, 2))
  } catch (error) {
    console.error('Failed to save ideas:', error)
    throw error
  }
}

export function getIdeaById(id: string): Idea | undefined {
  const ideas = loadIdeas()
  return ideas.find(i => i.id === id)
}

export function getIdeasByProject(projectId: string): Idea[] {
  const ideas = loadIdeas()
  return ideas.filter(i => i.projectId === projectId)
}

export function getIdeasByStatus(status: IdeaStatus): Idea[] {
  const ideas = loadIdeas()
  return ideas.filter(i => i.status === status)
}

export function createIdea(data: Omit<Idea, 'id' | 'createdAt' | 'updatedAt'>): Idea {
  const ideas = loadIdeas()
  const now = new Date().toISOString()
  
  const idea: Idea = {
    ...data,
    id: `idea-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  }
  
  ideas.push(idea)
  saveIdeas(ideas)
  return idea
}

export function updateIdea(id: string, updates: Partial<Idea>): Idea | null {
  const ideas = loadIdeas()
  const index = ideas.findIndex(i => i.id === id)
  
  if (index === -1) return null
  
  ideas[index] = {
    ...ideas[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  
  saveIdeas(ideas)
  return ideas[index]
}

export function deleteIdea(id: string): boolean {
  const ideas = loadIdeas()
  const filtered = ideas.filter(i => i.id !== id)
  
  if (filtered.length === ideas.length) return false
  
  saveIdeas(filtered)
  return true
}

export function convertIdeaToContent(ideaId: string, contentId: string): Idea | null {
  const ideas = loadIdeas()
  const index = ideas.findIndex(i => i.id === ideaId)
  
  if (index === -1) return null
  
  ideas[index].status = 'converted'
  ideas[index].linkedContentId = contentId
  ideas[index].updatedAt = new Date().toISOString()
  
  saveIdeas(ideas)
  return ideas[index]
}
