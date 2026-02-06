import fs from 'fs/promises';
import path from 'path';

export type TaskStatus = 
  | 'pending'           // Not started
  | 'in_progress'       // Being worked on
  | 'ready_for_review'  // Awaiting approval
  | 'changes_requested' // Needs revision
  | 'approved'          // Approved, ready to execute
  | 'published'         // Executed/deployed
  | 'done'              // Completed (no publish step)
  | 'rejected';         // Cancelled/rejected
export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';

export type TaskType = 'task' | 'content' | 'blog';

export interface Task {
  id: string;
  title: string;
  description?: string;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
  updatedAt: string;
  createdBy: 'robert' | 'leon';
  assignedTo: 'robert' | 'leon';
  // Content/deliverable fields
  content?: string;        // Markdown content or notes
  contentUrl?: string;     // Link to PR, file, or preview
  previewUrl?: string;     // Preview/staging URL
  // Feedback/result fields
  result?: string;         // Final result notes
  feedback?: string;       // Review feedback
  reviewedAt?: string;     // When it was reviewed
  publishedAt?: string;    // When it was published
  tags?: string[];
}

const DATA_FILE = path.join(process.cwd(), 'data', 'tasks.json');

async function ensureDataFile() {
  const dataDir = path.dirname(DATA_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
  
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify([], null, 2));
  }
}

export async function getTasks(): Promise<Task[]> {
  await ensureDataFile();
  const data = await fs.readFile(DATA_FILE, 'utf-8');
  return JSON.parse(data);
}

export async function getTask(id: string): Promise<Task | null> {
  const tasks = await getTasks();
  return tasks.find(t => t.id === id) || null;
}

export async function createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
  const tasks = await getTasks();
  const newTask: Task = {
    ...task,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  tasks.push(newTask);
  await fs.writeFile(DATA_FILE, JSON.stringify(tasks, null, 2));
  return newTask;
}

export async function updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): Promise<Task | null> {
  const tasks = await getTasks();
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) return null;
  
  tasks[index] = {
    ...tasks[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  await fs.writeFile(DATA_FILE, JSON.stringify(tasks, null, 2));
  return tasks[index];
}

export async function deleteTask(id: string): Promise<boolean> {
  const tasks = await getTasks();
  const filtered = tasks.filter(t => t.id !== id);
  if (filtered.length === tasks.length) return false;
  await fs.writeFile(DATA_FILE, JSON.stringify(filtered, null, 2));
  return true;
}
