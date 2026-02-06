import fs from 'fs'
import path from 'path'

export interface Task {
  id: number
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'ready_for_review' | 'changes_requested' | 'approved' | 'done' | 'rejected'
  priority: 'low' | 'medium' | 'high'
  assignee: 'robert' | 'leon'
  createdBy: 'robert' | 'leon'
  createdAt: string
  updatedAt: string
  reviewComment?: string
}

const DATA_DIR = path.join(process.cwd(), 'data')
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json')

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

// Load tasks from file
export function loadTasks(): Task[] {
  ensureDataDir()
  
  try {
    if (fs.existsSync(TASKS_FILE)) {
      const data = fs.readFileSync(TASKS_FILE, 'utf-8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Failed to load tasks:', error)
  }
  
  return []
}

// Save tasks to file
export function saveTasks(tasks: Task[]): void {
  ensureDataDir()
  fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2))
}

// Get a single task
export function getTask(id: number): Task | undefined {
  const tasks = loadTasks()
  return tasks.find(t => t.id === id)
}

// Create a new task
export function createTask(data: {
  title: string
  description: string
  priority: Task['priority']
  assignee: Task['assignee']
  createdBy: Task['createdBy']
}): Task {
  const tasks = loadTasks()
  
  const newTask: Task = {
    id: Date.now(),
    title: data.title,
    description: data.description,
    status: 'pending',
    priority: data.priority,
    assignee: data.assignee,
    createdBy: data.createdBy,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  
  tasks.push(newTask)
  saveTasks(tasks)
  
  return newTask
}

// Update a task
export function updateTask(id: number, updates: Partial<Task>): Task | null {
  const tasks = loadTasks()
  const index = tasks.findIndex(t => t.id === id)
  
  if (index === -1) return null
  
  tasks[index] = {
    ...tasks[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  
  saveTasks(tasks)
  return tasks[index]
}

// Delete a task
export function deleteTask(id: number): boolean {
  const tasks = loadTasks()
  const index = tasks.findIndex(t => t.id === id)
  
  if (index === -1) return false
  
  tasks.splice(index, 1)
  saveTasks(tasks)
  
  return true
}
