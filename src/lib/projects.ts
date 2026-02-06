import fs from 'fs'
import path from 'path'
import { Project } from './types'

const DATA_DIR = path.join(process.cwd(), 'data')
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json')

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

// Load all projects
export function loadProjects(): Project[] {
  ensureDataDir()
  
  if (!fs.existsSync(PROJECTS_FILE)) {
    return []
  }
  
  try {
    const data = fs.readFileSync(PROJECTS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error loading projects:', error)
    return []
  }
}

// Get a single project by ID
export function getProject(id: string): Project | null {
  const projects = loadProjects()
  return projects.find(p => p.id === id) || null
}

// Get a single project by slug
export function getProjectBySlug(slug: string): Project | null {
  const projects = loadProjects()
  return projects.find(p => p.slug === slug) || null
}

// Save all projects
export function saveProjects(projects: Project[]): void {
  ensureDataDir()
  fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2))
}

// Create a new project
export function createProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Project {
  const projects = loadProjects()
  
  const newProject: Project = {
    ...projectData,
    id: projectData.slug,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  
  projects.push(newProject)
  saveProjects(projects)
  
  return newProject
}

// Update a project
export function updateProject(id: string, updates: Partial<Project>): Project | null {
  const projects = loadProjects()
  const index = projects.findIndex(p => p.id === id)
  
  if (index === -1) {
    return null
  }
  
  projects[index] = {
    ...projects[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  
  saveProjects(projects)
  return projects[index]
}

// Delete a project
export function deleteProject(id: string): boolean {
  const projects = loadProjects()
  const index = projects.findIndex(p => p.id === id)
  
  if (index === -1) {
    return false
  }
  
  projects.splice(index, 1)
  saveProjects(projects)
  return true
}
