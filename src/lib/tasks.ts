import fs from 'fs'
import path from 'path'

export type TaskType = 'general' | 'blog' | 'code' | 'review' | 'research'

export interface Comment {
  id: number
  author: 'robert' | 'leon'
  text: string
  createdAt: string
}

export interface Task {
  id: number | string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'ready_for_review' | 'changes_requested' | 'approved' | 'done' | 'rejected'
  priority: 'low' | 'medium' | 'high'
  type: TaskType
  assignee: 'robert' | 'leon'
  createdBy: 'robert' | 'leon'
  createdAt: string
  updatedAt: string
  reviewComment?: string
  feedback?: string
  comments?: Comment[]
  
  // Type-specific content
  content?: {
    // For blog posts
    article?: string
    languages?: string[]
    prUrl?: string
    
    // For code tasks
    repo?: string
    branch?: string
    files?: string[]
    
    // For research tasks
    sources?: string[]
    findings?: string
  }
}

export interface Notification {
  id: number
  taskId: string | number
  taskTitle: string
  message: string
  from: 'leon' | 'robert'
  createdAt: string
  read: boolean
}

const DATA_DIR = path.join(process.cwd(), 'data')
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json')
const NOTIFICATIONS_FILE = path.join(DATA_DIR, 'notifications.json')

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
      const tasks = JSON.parse(data)
      return tasks.map((t: Task) => ({
        ...t,
        type: t.type || 'general',
        comments: t.comments || []
      }))
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
export function getTask(id: number | string): Task | undefined {
  const tasks = loadTasks()
  return tasks.find(t => String(t.id) === String(id))
}

// Create a new task
export function createTask(data: {
  title: string
  description: string
  priority: Task['priority']
  type?: TaskType
  assignee: Task['assignee']
  createdBy: Task['createdBy']
  content?: Task['content']
}): Task {
  const tasks = loadTasks()
  
  const newTask: Task = {
    id: Date.now(),
    title: data.title,
    description: data.description,
    status: 'pending',
    priority: data.priority,
    type: data.type || 'general',
    assignee: data.assignee,
    createdBy: data.createdBy,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    content: data.content,
    comments: [],
  }
  
  tasks.push(newTask)
  saveTasks(tasks)
  
  return newTask
}

// Update a task
export function updateTask(id: number | string, updates: Partial<Task>): Task | null {
  const tasks = loadTasks()
  const index = tasks.findIndex(t => String(t.id) === String(id))
  
  if (index === -1) return null
  
  tasks[index] = {
    ...tasks[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  
  saveTasks(tasks)
  return tasks[index]
}

// Add comment to a task
export function addComment(taskId: number | string, author: 'robert' | 'leon', text: string): Comment | null {
  const tasks = loadTasks()
  const index = tasks.findIndex(t => String(t.id) === String(taskId))
  
  if (index === -1) return null
  
  const comment: Comment = {
    id: Date.now(),
    author,
    text,
    createdAt: new Date().toISOString(),
  }
  
  if (!tasks[index].comments) {
    tasks[index].comments = []
  }
  tasks[index].comments.push(comment)
  tasks[index].updatedAt = new Date().toISOString()
  
  saveTasks(tasks)
  return comment
}

// Delete a task
export function deleteTask(id: number | string): boolean {
  const tasks = loadTasks()
  const index = tasks.findIndex(t => String(t.id) === String(id))
  
  if (index === -1) return false
  
  tasks.splice(index, 1)
  saveTasks(tasks)
  
  return true
}

// Notifications
export function loadNotifications(): Notification[] {
  ensureDataDir()
  
  try {
    if (fs.existsSync(NOTIFICATIONS_FILE)) {
      const data = fs.readFileSync(NOTIFICATIONS_FILE, 'utf-8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Failed to load notifications:', error)
  }
  
  return []
}

export function saveNotifications(notifications: Notification[]): void {
  ensureDataDir()
  fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(notifications, null, 2))
}

export function addNotification(data: {
  taskId: string | number
  taskTitle: string
  message: string
  from: 'leon' | 'robert'
}): Notification {
  const notifications = loadNotifications()
  
  const notification: Notification = {
    id: Date.now(),
    taskId: data.taskId,
    taskTitle: data.taskTitle,
    message: data.message,
    from: data.from,
    createdAt: new Date().toISOString(),
    read: false,
  }
  
  notifications.push(notification)
  saveNotifications(notifications)
  
  return notification
}

export function markNotificationsRead(ids?: number[]): void {
  const notifications = loadNotifications()
  
  notifications.forEach(n => {
    if (!ids || ids.includes(n.id)) {
      n.read = true
    }
  })
  
  saveNotifications(notifications)
}

export function getUnreadNotifications(): Notification[] {
  return loadNotifications().filter(n => !n.read)
}
