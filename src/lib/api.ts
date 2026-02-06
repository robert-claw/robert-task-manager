import { ContentItem, Project } from './types';

// Content API
const CONTENT_BASE = '/api/content';

export async function fetchContent(filters?: {
  projectId?: string;
  status?: string;
  platform?: string;
}): Promise<ContentItem[]> {
  let url = CONTENT_BASE;
  if (filters) {
    const params = new URLSearchParams();
    if (filters.projectId) params.set('projectId', filters.projectId);
    if (filters.status) params.set('status', filters.status);
    if (filters.platform) params.set('platform', filters.platform);
    if (params.toString()) url += `?${params.toString()}`;
  }
  
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch content');
  const data = await res.json();
  return data.content || [];
}

export async function createContent(content: Partial<ContentItem>): Promise<ContentItem> {
  const res = await fetch(CONTENT_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(content),
  });
  if (!res.ok) throw new Error('Failed to create content');
  const data = await res.json();
  return data.content;
}

export async function updateContent(id: string, updates: Partial<ContentItem>): Promise<ContentItem> {
  const res = await fetch(`${CONTENT_BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update content');
  const data = await res.json();
  return data.content;
}

export async function deleteContent(id: string): Promise<boolean> {
  const res = await fetch(`${CONTENT_BASE}/${id}`, {
    method: 'DELETE',
  });
  return res.ok;
}

// Projects API
const PROJECTS_BASE = '/api/projects';

export async function fetchProjects(): Promise<Project[]> {
  const res = await fetch(PROJECTS_BASE);
  if (!res.ok) throw new Error('Failed to fetch projects');
  const data = await res.json();
  return data.projects || [];
}

export async function getProject(id: string): Promise<Project | null> {
  const res = await fetch(`${PROJECTS_BASE}/${id}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.project;
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<Project> {
  const res = await fetch(`${PROJECTS_BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update project');
  const data = await res.json();
  return data.project;
}
