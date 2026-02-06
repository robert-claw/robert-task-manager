// Task Types
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
export type Assignee = 'robert' | 'leon';

export interface Task {
  id: string;
  title: string;
  description?: string;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
  updatedAt: string;
  createdBy: Assignee;
  assignedTo: Assignee;
  content?: string;
  contentUrl?: string;
  previewUrl?: string;
  result?: string;
  feedback?: string;
  reviewedAt?: string;
  publishedAt?: string;
  tags?: string[];
}

// Config types
export interface StatusConfig {
  icon: string;
  label: string;
  color: string;
  bg: string;
}

export interface TypeConfig {
  icon: string;
  label: string;
}

// Tab types
export interface TabConfig {
  id: Assignee;
  labelKey: string;
  icon: string;
  color: string;
}

// Component props
export interface NewTaskForm {
  title: string;
  description: string;
  priority: TaskPriority;
  type: TaskType;
  assignedTo: Assignee;
}
