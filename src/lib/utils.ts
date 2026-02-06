import { ContentStatus, ContentType, Platform, Priority } from './types';

// Simple class merging utility
export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(' ');
}

// Status configuration with colors and icons
export const statusConfig: Record<ContentStatus, { icon: string; label: string; color: string; bg: string }> = {
  draft: { 
    icon: '◇', 
    label: 'Draft', 
    color: 'text-slate-400', 
    bg: 'bg-slate-500/20 border-slate-500/40' 
  },
  ready_for_review: { 
    icon: '◉', 
    label: 'Ready for Review', 
    color: 'text-yellow-400', 
    bg: 'bg-yellow-500/20 border-yellow-500/40' 
  },
  changes_requested: { 
    icon: '◈', 
    label: 'Changes Requested', 
    color: 'text-orange-400', 
    bg: 'bg-orange-500/20 border-orange-500/40' 
  },
  approved: { 
    icon: '◆', 
    label: 'Approved', 
    color: 'text-green-400', 
    bg: 'bg-green-500/20 border-green-500/40' 
  },
  scheduled: { 
    icon: '⏰', 
    label: 'Scheduled', 
    color: 'text-blue-400', 
    bg: 'bg-blue-500/20 border-blue-500/40' 
  },
  published: { 
    icon: '★', 
    label: 'Published', 
    color: 'text-purple-400', 
    bg: 'bg-purple-500/20 border-purple-500/40' 
  },
};

// Platform icons
export const platformIcons: Record<Platform, string> = {
  linkedin: '💼',
  twitter: '🐦',
  blog: '📝',
  instagram: '📸',
  facebook: '👥',
};

// Content type icons
export const contentTypeIcons: Record<ContentType, string> = {
  post: '📝',
  article: '📰',
  tweet: '🐦',
  thread: '🧵',
  story: '📱',
  reel: '🎬',
};

// Priority styling
export const priorityStyles: Record<Priority, string> = {
  urgent: 'bg-red-500/30 border border-red-500 text-red-400',
  high: 'bg-orange-500/30 border border-orange-500 text-orange-400',
  medium: 'bg-yellow-500/30 border border-yellow-500 text-yellow-400',
  low: 'bg-slate-500/30 border border-slate-500 text-slate-400',
};

// Format date for display
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

// Check if content is in terminal state
export function isTerminalStatus(status: ContentStatus): boolean {
  return status === 'published';
}

// Get active content count
export function getActiveCount(items: { status: ContentStatus }[]): number {
  return items.filter(t => !isTerminalStatus(t.status)).length;
}

// Get relative time string
export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return formatDate(dateString);
}
