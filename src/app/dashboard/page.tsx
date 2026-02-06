'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Task {
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

const STATUS_LABELS: Record<Task['status'], string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  ready_for_review: 'Ready for Review',
  changes_requested: 'Changes Requested',
  approved: 'Approved',
  done: 'Done',
  rejected: 'Rejected',
}

const STATUS_COLORS: Record<Task['status'], string> = {
  pending: 'bg-zinc-600',
  in_progress: 'bg-blue-600',
  ready_for_review: 'bg-yellow-600',
  changes_requested: 'bg-orange-600',
  approved: 'bg-green-600',
  done: 'bg-emerald-600',
  rejected: 'bg-red-600',
}

const PRIORITY_COLORS: Record<Task['priority'], string> = {
  low: 'text-zinc-400',
  medium: 'text-yellow-400',
  high: 'text-red-400',
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<string>('')
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'mine' | 'assigned'>('all')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    const savedUser = localStorage.getItem('auth_user')
    
    if (!token || !savedUser) {
      router.push('/login')
      return
    }

    setUser(savedUser)
    loadTasks()
  }, [router])

  const loadTasks = async () => {
    try {
      const res = await fetch('/api/tasks')
      if (res.ok) {
        const data = await res.json()
        setTasks(data.tasks || [])
      }
    } catch (error) {
      console.error('Failed to load tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    router.push('/login')
  }

  const filteredTasks = tasks.filter(task => {
    if (filter === 'mine') return task.createdBy === user
    if (filter === 'assigned') return task.assignee === user
    return true
  })

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length,
    review: tasks.filter(t => t.status === 'ready_for_review' || t.status === 'changes_requested').length,
    done: tasks.filter(t => t.status === 'done' || t.status === 'approved').length,
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-cyan-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800 sticky top-0 bg-zinc-950/80 backdrop-blur-md z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <span className="text-3xl">🦞</span>
              <span className="text-xl font-bold text-white">Task Manager</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-zinc-400">
              Logged in as <span className="text-cyan-400 font-medium">{user}</span>
            </span>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-zinc-400 hover:text-white transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Tasks', value: stats.total, color: 'text-white' },
            { label: 'In Progress', value: stats.pending, color: 'text-blue-400' },
            { label: 'Needs Review', value: stats.review, color: 'text-yellow-400' },
            { label: 'Completed', value: stats.done, color: 'text-green-400' },
          ].map((stat) => (
            <div key={stat.label} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
              <p className="text-zinc-400 text-sm">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            {(['all', 'mine', 'assigned'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-cyan-600 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {f === 'all' ? 'All Tasks' : f === 'mine' ? 'Created by Me' : 'Assigned to Me'}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Task
          </button>
        </div>

        {/* Task List */}
        <div className="space-y-3">
          <AnimatePresence>
            {filteredTasks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 text-zinc-500"
              >
                No tasks found. Create one to get started!
              </motion.div>
            ) : (
              filteredTasks.map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onClick={() => setSelectedTask(task)}
                  className="bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 rounded-xl p-4 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium text-white ${STATUS_COLORS[task.status]}`}>
                          {STATUS_LABELS[task.status]}
                        </span>
                        <span className={`text-xs font-medium ${PRIORITY_COLORS[task.priority]}`}>
                          {task.priority.toUpperCase()}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-white truncate">{task.title}</h3>
                      <p className="text-zinc-400 text-sm line-clamp-2 mt-1">{task.description}</p>
                    </div>
                    <div className="text-right text-sm text-zinc-500 shrink-0">
                      <p>by {task.createdBy}</p>
                      <p>→ {task.assignee}</p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Task Detail Modal */}
      <AnimatePresence>
        {selectedTask && (
          <TaskDetailModal
            task={selectedTask}
            user={user}
            onClose={() => setSelectedTask(null)}
            onUpdate={loadTasks}
          />
        )}
      </AnimatePresence>

      {/* Create Task Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateTaskModal
            user={user}
            onClose={() => setShowCreateModal(false)}
            onCreate={loadTasks}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Task Detail Modal Component
function TaskDetailModal({
  task,
  user,
  onClose,
  onUpdate,
}: {
  task: Task
  user: string
  onClose: () => void
  onUpdate: () => void
}) {
  const [showPreview, setShowPreview] = useState(true)
  const [reviewComment, setReviewComment] = useState('')
  const [updating, setUpdating] = useState(false)

  const handleStatusChange = async (newStatus: Task['status'], comment?: string) => {
    setUpdating(true)
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, reviewComment: comment }),
      })
      if (res.ok) {
        onUpdate()
        onClose()
      }
    } catch (error) {
      console.error('Failed to update task:', error)
    } finally {
      setUpdating(false)
    }
  }

  const canReview = task.assignee !== user && task.status === 'ready_for_review'
  const canSubmitForReview = task.assignee === user && ['pending', 'in_progress', 'changes_requested'].includes(task.status)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className={`px-2 py-0.5 rounded text-xs font-medium text-white ${STATUS_COLORS[task.status]}`}>
                {STATUS_LABELS[task.status]}
              </span>
              <span className={`text-xs font-medium ${PRIORITY_COLORS[task.priority]}`}>
                {task.priority.toUpperCase()}
              </span>
            </div>
            <button onClick={onClose} className="text-zinc-400 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <h2 className="text-2xl font-bold text-white">{task.title}</h2>
          <p className="text-zinc-400 mt-1">
            Created by <span className="text-cyan-400">{task.createdBy}</span> • 
            Assigned to <span className="text-cyan-400">{task.assignee}</span>
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Toggle */}
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => setShowPreview(false)}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                !showPreview ? 'bg-cyan-600 text-white' : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              Raw
            </button>
            <button
              onClick={() => setShowPreview(true)}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                showPreview ? 'bg-cyan-600 text-white' : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              Preview
            </button>
          </div>

          {/* Description */}
          <div className="bg-zinc-800/50 rounded-xl p-4 min-h-[200px]">
            {showPreview ? (
              <div className="markdown-body">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {task.description || '*No description*'}
                </ReactMarkdown>
              </div>
            ) : (
              <pre className="text-zinc-300 whitespace-pre-wrap font-mono text-sm">
                {task.description || 'No description'}
              </pre>
            )}
          </div>

          {/* Review Comment */}
          {task.reviewComment && (
            <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
              <p className="text-yellow-400 font-medium mb-1">Review Comment:</p>
              <p className="text-zinc-300">{task.reviewComment}</p>
            </div>
          )}

          {/* Review Actions */}
          {canReview && (
            <div className="mt-6 p-4 bg-zinc-800/50 rounded-xl">
              <p className="text-white font-medium mb-3">Review this task:</p>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Add a comment (optional for approval, required for changes/rejection)"
                className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 mb-4"
                rows={3}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => handleStatusChange('approved', reviewComment)}
                  disabled={updating}
                  className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleStatusChange('changes_requested', reviewComment)}
                  disabled={updating || !reviewComment.trim()}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  Request Changes
                </button>
                <button
                  onClick={() => handleStatusChange('rejected', reviewComment)}
                  disabled={updating || !reviewComment.trim()}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </div>
          )}

          {/* Submit for Review */}
          {canSubmitForReview && (
            <div className="mt-6">
              <button
                onClick={() => handleStatusChange('ready_for_review')}
                disabled={updating}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Submit for Review
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// Create Task Modal Component
function CreateTaskModal({
  user,
  onClose,
  onCreate,
}: {
  user: string
  onClose: () => void
  onCreate: () => void
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Task['priority']>('medium')
  const [assignee, setAssignee] = useState<'robert' | 'leon'>('robert')
  const [showPreview, setShowPreview] = useState(false)
  const [creating, setCreating] = useState(false)

  const handleCreate = async () => {
    if (!title.trim()) return
    
    setCreating(true)
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          priority,
          assignee,
          createdBy: user,
        }),
      })
      if (res.ok) {
        onCreate()
        onClose()
      }
    } catch (error) {
      console.error('Failed to create task:', error)
    } finally {
      setCreating(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Create New Task</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="What needs to be done?"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Task['priority'])}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Assign to</label>
              <select
                value={assignee}
                onChange={(e) => setAssignee(e.target.value as 'robert' | 'leon')}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="robert">Robert (AI)</option>
                <option value="leon">Leon (Human)</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-zinc-300">Description (Markdown)</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPreview(false)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    !showPreview ? 'bg-cyan-600 text-white' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  Edit
                </button>
                <button
                  onClick={() => setShowPreview(true)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    showPreview ? 'bg-cyan-600 text-white' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  Preview
                </button>
              </div>
            </div>
            {showPreview ? (
              <div className="w-full min-h-[200px] px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg">
                <div className="markdown-body">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {description || '*No description yet*'}
                  </ReactMarkdown>
                </div>
              </div>
            ) : (
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-sm"
                placeholder="Add details... (supports Markdown)"
                rows={8}
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-zinc-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 text-zinc-300 hover:text-white rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={creating || !title.trim()}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-600/50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            {creating ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
