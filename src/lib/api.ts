import { Task, NewTaskForm } from './types';

const API_BASE = '/api/tasks';

export async function fetchTasks(): Promise<Task[]> {
  const res = await fetch(API_BASE);
  if (!res.ok) throw new Error('Failed to fetch tasks');
  return res.json();
}

export async function createTask(task: NewTaskForm): Promise<Task> {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      ...task, 
      status: 'pending', 
      createdBy: 'leon' 
    }),
  });
  if (!res.ok) throw new Error('Failed to create task');
  return res.json();
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update task');
  return res.json();
}

export async function deleteTask(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });
  return res.ok;
}
