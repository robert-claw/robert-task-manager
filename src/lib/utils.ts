import { TaskStatus, TaskType, StatusConfig, TypeConfig } from './types';

// Simple class merging utility
export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(' ');
}

// Status configuration with colors and icons
export const statusConfig: Record<TaskStatus, StatusConfig> = {
  pending: { 
    icon: '◇', 
    label: 'PENDING', 
    color: 'text-slate-400', 
    bg: 'from-slate-500/20 to-slate-600/20 border-slate-500/40' 
  },
  in_progress: { 
    icon: '◈', 
    label: 'IN_PROGRESS', 
    color: 'text-cyan-400', 
    bg: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/40' 
  },
  ready_for_review: { 
    icon: '◉', 
    label: 'READY_FOR_REVIEW', 
    color: 'text-amber-400', 
    bg: 'from-amber-500/20 to-orange-500/20 border-amber-500/40' 
  },
  changes_requested: { 
    icon: '◈', 
    label: 'CHANGES_REQUESTED', 
    color: 'text-rose-400', 
    bg: 'from-rose-500/20 to-red-500/20 border-rose-500/40' 
  },
  approved: { 
    icon: '◆', 
    label: 'APPROVED', 
    color: 'text-emerald-400', 
    bg: 'from-emerald-500/20 to-green-500/20 border-emerald-500/40' 
  },
  published: { 
    icon: '★', 
    label: 'PUBLISHED', 
    color: 'text-violet-400', 
    bg: 'from-violet-500/20 to-purple-500/20 border-violet-500/40' 
  },
  done: { 
    icon: '✓', 
    label: 'DONE', 
    color: 'text-emerald-400', 
    bg: 'from-emerald-500/20 to-green-500/20 border-emerald-500/40' 
  },
  rejected: { 
    icon: '✕', 
    label: 'REJECTED', 
    color: 'text-red-400', 
    bg: 'from-red-500/20 to-rose-500/20 border-red-500/40' 
  },
};

// Type configuration with icons
export const typeConfig: Record<TaskType, TypeConfig> = {
  task: { icon: '📋', label: 'Task' },
  content: { icon: '📝', label: 'Content' },
  blog: { icon: '📰', label: 'Blog Post' },
};

// Priority styling
export const priorityStyles: Record<string, string> = {
  urgent: 'bg-red-500/30 border border-red-500 text-red-400',
  high: 'bg-orange-500/30 border border-orange-500 text-orange-400',
  medium: 'bg-yellow-500/30 border border-yellow-500 text-yellow-400',
  low: 'bg-slate-500/30 border border-slate-500 text-slate-400',
};

// Format date for display
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString();
}

// Check if task is in terminal state
export function isTerminalStatus(status: TaskStatus): boolean {
  return ['done', 'published', 'rejected'].includes(status);
}

// Get active task count
export function getActiveCount(tasks: { status: TaskStatus }[]): number {
  return tasks.filter(t => !isTerminalStatus(t.status)).length;
}
