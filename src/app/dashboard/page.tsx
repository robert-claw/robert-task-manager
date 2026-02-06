'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type TaskType = 'general' | 'blog' | 'code' | 'review' | 'research' | 'tweet'

interface Comment {
  id: number
  author: 'robert' | 'leon'
  text: string
  createdAt: string
}

interface Task {
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
  content?: {
    article?: string
    languages?: string[]
    prUrl?: string
    repo?: string
    branch?: string
    files?: string[]
    sources?: string[]
    findings?: string
    tweetText?: string
    scheduledFor?: string
    threadParts?: string[]
    mediaUrl?: string
  }
}

interface Frontmatter {
  [key: string]: string | undefined
}

// Parse frontmatter from markdown
function parseFrontmatter(markdown: string): { frontmatter: Frontmatter; content: string } {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/
  const match = markdown.match(frontmatterRegex)
  
  if (!match) {
    return { frontmatter: {}, content: markdown }
  }
  
  const frontmatterStr = match[1]
  const content = match[2]
  const frontmatter: Frontmatter = {}
  
  frontmatterStr.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':')
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim()
      let value = line.slice(colonIndex + 1).trim()
      // Remove surrounding quotes
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      frontmatter[key] = value
    }
  })
  
  return { frontmatter, content }
}

// Reconstruct markdown with frontmatter
function reconstructMarkdown(frontmatter: Frontmatter, content: string): string {
  const frontmatterLines = Object.entries(frontmatter)
    .filter(([_, value]) => value !== undefined && value !== '')
    .map(([key, value]) => `${key}: "${value}"`)
    .join('\n')
  
  return `---\n${frontmatterLines}\n---\n${content}`
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

const TYPE_ICONS: Record<TaskType, string> = {
  general: '📋',
  blog: '📝',
  code: '💻',
  review: '👁️',
  research: '🔍',
  tweet: '🐦',
}

const TYPE_LABELS: Record<TaskType, string> = {
  general: 'General',
  blog: 'Blog Post',
  code: 'Code',
  review: 'Review',
  research: 'Research',
  tweet: 'Tweet',
}

const FRONTMATTER_LABELS: Record<string, string> = {
  title: 'Title',
  slug: 'Slug',
  subtitle: 'Subtitle',
  summary: 'Summary',
  date: 'Date',
  author: 'Author',
  mainImage: 'Main Image',
  keywords: 'Keywords',
  category: 'Category',
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<string>('')
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'mine' | 'assigned'>('all')
  const [typeFilter, setTypeFilter] = useState<TaskType | 'all'>('all')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

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
    const ownerMatch = filter === 'all' || 
      (filter === 'mine' && task.createdBy === user) ||
      (filter === 'assigned' && task.assignee === user)
    const typeMatch = typeFilter === 'all' || task.type === typeFilter
    return ownerMatch && typeMatch
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
      <header className="border-b border-zinc-800 sticky top-0 bg-zinc-950/80 backdrop-blur-md z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3">
              <span className="text-3xl">🦞</span>
              <span className="text-xl font-bold text-white">Task Manager</span>
            </Link>
            <nav className="flex items-center gap-4">
              <Link 
                href="/dashboard" 
                className="text-cyan-400 font-medium"
              >
                Tasks
              </Link>
              <Link 
                href="/activities" 
                className="text-zinc-400 hover:text-white transition-colors"
              >
                Activities
              </Link>
            </nav>
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

        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-2">
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
                {f === 'all' ? 'All' : f === 'mine' ? 'Created by Me' : 'Assigned to Me'}
              </button>
            ))}
            
            <span className="text-zinc-600 mx-2">|</span>
            
            {(['all', 'tweet', 'blog', 'code', 'review', 'research', 'general'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  typeFilter === t
                    ? 'bg-cyan-600 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {t !== 'all' && <span>{TYPE_ICONS[t]}</span>}
                {t === 'all' ? 'All Types' : TYPE_LABELS[t]}
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
                        <span className="text-lg">{TYPE_ICONS[task.type || 'general']}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium text-white ${STATUS_COLORS[task.status]}`}>
                          {STATUS_LABELS[task.status]}
                        </span>
                        <span className={`text-xs font-medium ${PRIORITY_COLORS[task.priority]}`}>
                          {task.priority.toUpperCase()}
                        </span>
                        {task.comments && task.comments.length > 0 && (
                          <span className="text-xs text-zinc-500 flex items-center gap-1">
                            💬 {task.comments.length}
                          </span>
                        )}
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

// Twitter Preview Component
function TweetPreview({ 
  tweetText, 
  threadParts 
}: { 
  tweetText: string
  threadParts?: string[]
}) {
  // Parse tweet text - handle \n as actual newlines
  const formatTweetText = (text: string) => {
    return text.split('\\n').join('\n')
  }

  // If there are thread parts, show them; otherwise show single tweet
  const tweets = threadParts && threadParts.length > 0 
    ? threadParts 
    : [tweetText]

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <p className="text-zinc-400 text-sm">Preview how this will appear on X</p>
      </div>
      
      {tweets.map((tweet, index) => (
        <div key={index} className="relative">
          {/* Thread connector line */}
          {index > 0 && (
            <div className="absolute left-6 -top-4 w-0.5 h-4 bg-zinc-700" />
          )}
          {index < tweets.length - 1 && (
            <div className="absolute left-6 -bottom-4 w-0.5 h-4 bg-zinc-700" />
          )}
          
          {/* Tweet Card */}
          <div className="bg-black border border-zinc-800 rounded-2xl p-4 max-w-xl mx-auto">
            {/* Header */}
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
                D
              </div>
              
              <div className="flex-1 min-w-0">
                {/* Name row */}
                <div className="flex items-center gap-1">
                  <span className="font-bold text-white">Dandelion Labs</span>
                  <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z" />
                  </svg>
                  <span className="text-zinc-500">@dandelionlabsio</span>
                </div>
                
                {/* Tweet content */}
                <div className="mt-2 text-white whitespace-pre-wrap text-[15px] leading-relaxed">
                  {formatTweetText(tweet)}
                </div>
                
                {/* Thread indicator */}
                {tweets.length > 1 && (
                  <p className="text-zinc-500 text-sm mt-2">
                    {index + 1}/{tweets.length}
                  </p>
                )}
                
                {/* Action bar */}
                <div className="flex items-center justify-between mt-4 max-w-md text-zinc-500">
                  <button className="flex items-center gap-2 hover:text-blue-400 transition-colors group">
                    <div className="p-2 rounded-full group-hover:bg-blue-400/10">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                  </button>
                  <button className="flex items-center gap-2 hover:text-green-400 transition-colors group">
                    <div className="p-2 rounded-full group-hover:bg-green-400/10">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </div>
                  </button>
                  <button className="flex items-center gap-2 hover:text-pink-400 transition-colors group">
                    <div className="p-2 rounded-full group-hover:bg-pink-400/10">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                  </button>
                  <button className="flex items-center gap-2 hover:text-blue-400 transition-colors group">
                    <div className="p-2 rounded-full group-hover:bg-blue-400/10">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Character count */}
      <div className="text-center mt-4">
        <span className={`text-sm ${tweetText.length > 280 ? 'text-red-400' : 'text-zinc-500'}`}>
          {tweetText.length}/280 characters
          {tweetText.length > 280 && ' ⚠️ Too long!'}
        </span>
      </div>
    </div>
  )
}

function TaskDetailModal({
  task: initialTask,
  user,
  onClose,
  onUpdate,
}: {
  task: Task
  user: string
  onClose: () => void
  onUpdate: () => void
}) {
  const [task, setTask] = useState(initialTask)
  const [activeTab, setActiveTab] = useState<'overview' | 'comments' | 'article' | 'edit' | 'preview'>(
    initialTask.type === 'tweet' && initialTask.content?.tweetText ? 'preview' : 'overview'
  )
  const [reviewComment, setReviewComment] = useState('')
  const [newComment, setNewComment] = useState('')
  const [updating, setUpdating] = useState(false)
  const [notifyOnComment, setNotifyOnComment] = useState(true)
  const [notificationSent, setNotificationSent] = useState(false)
  const [articleSaved, setArticleSaved] = useState(false)
  
  // Article editing state
  const [editedArticle, setEditedArticle] = useState(task.content?.article || '')
  const [editedFrontmatter, setEditedFrontmatter] = useState<Frontmatter>({})
  const [editedContent, setEditedContent] = useState('')
  
  // Parse frontmatter on load
  const parsed = useMemo(() => {
    if (!task.content?.article) return { frontmatter: {}, content: '' }
    return parseFrontmatter(task.content.article)
  }, [task.content?.article])
  
  useEffect(() => {
    setEditedFrontmatter(parsed.frontmatter)
    setEditedContent(parsed.content)
    setEditedArticle(task.content?.article || '')
  }, [parsed, task.content?.article])

  const handleStatusChange = async (newStatus: Task['status'], comment?: string) => {
    setUpdating(true)
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, reviewComment: comment, feedback: comment }),
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

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return
    
    setUpdating(true)
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        onUpdate()
        onClose()
      }
    } catch (error) {
      console.error('Failed to delete task:', error)
    } finally {
      setUpdating(false)
    }
  }

  const handleRedo = async () => {
    // Reset task to pending status with a note
    setUpdating(true)
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'pending',
          feedback: 'Task marked for redo',
        }),
      })
      if (res.ok) {
        onUpdate()
        onClose()
      }
    } catch (error) {
      console.error('Failed to redo task:', error)
    } finally {
      setUpdating(false)
    }
  }

  const handleSaveArticle = async () => {
    setUpdating(true)
    try {
      // Reconstruct full markdown
      const fullArticle = reconstructMarkdown(editedFrontmatter, editedContent)
      
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: {
            ...task.content,
            article: fullArticle,
          }
        }),
      })
      if (res.ok) {
        setArticleSaved(true)
        setTimeout(() => setArticleSaved(false), 3000)
        // Update local task state
        setTask(prev => ({
          ...prev,
          content: { ...prev.content, article: fullArticle }
        }))
        onUpdate()
      }
    } catch (error) {
      console.error('Failed to save article:', error)
    } finally {
      setUpdating(false)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    
    setUpdating(true)
    try {
      const res = await fetch(`/api/tasks/${task.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: newComment,
          author: user,
          notify: notifyOnComment,
        }),
      })
      if (res.ok) {
        setNewComment('')
        if (notifyOnComment) {
          setNotificationSent(true)
          setTimeout(() => setNotificationSent(false), 3000)
        }
        onUpdate()
        // Refresh task data
        const taskRes = await fetch(`/api/tasks/${task.id}`)
        if (taskRes.ok) {
          const data = await taskRes.json()
          setTask(prev => ({ ...prev, comments: data.task.comments }))
        }
      }
    } catch (error) {
      console.error('Failed to add comment:', error)
    } finally {
      setUpdating(false)
    }
  }

  const canReview = task.assignee !== user && task.status === 'ready_for_review'
  const canSubmitForReview = task.assignee === user && ['pending', 'in_progress', 'changes_requested'].includes(task.status)
  const hasBlogContent = task.type === 'blog' && task.content?.article
  const hasTweetContent = task.type === 'tweet' && task.content?.tweetText

  const tabs: { id: 'overview' | 'comments' | 'article' | 'edit' | 'preview'; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'comments', label: `💬 Comments${task.comments?.length ? ` (${task.comments.length})` : ''}` },
  ]
  
  if (hasTweetContent) {
    tabs.unshift({ id: 'preview', label: '🐦 Preview' })
  }
  
  if (hasBlogContent) {
    tabs.push({ id: 'article', label: '📄 Article' })
    tabs.push({ id: 'edit', label: '✏️ Edit' })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b border-zinc-800 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{TYPE_ICONS[task.type || 'general']}</span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium text-white ${STATUS_COLORS[task.status]}`}>
                {STATUS_LABELS[task.status]}
              </span>
              <span className={`text-xs font-medium ${PRIORITY_COLORS[task.priority]}`}>
                {task.priority.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRedo}
                disabled={updating || task.status === 'pending'}
                title="Send back for redo"
                className="p-2 text-yellow-400 hover:bg-yellow-500/20 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button
                onClick={handleDelete}
                disabled={updating}
                title="Delete task"
                className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white">{task.title}</h2>
          <p className="text-zinc-400 mt-1">
            Created by <span className="text-cyan-400">{task.createdBy}</span> • 
            Assigned to <span className="text-cyan-400">{task.assignee}</span>
          </p>
        </div>

        <div className="flex gap-1 px-6 pt-4 border-b border-zinc-800 shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-zinc-800 text-white border-b-2 border-cyan-500'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'preview' && hasTweetContent && (
            <TweetPreview 
              tweetText={task.content!.tweetText!}
              threadParts={task.content?.threadParts}
            />
          )}

          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-zinc-400 mb-2">Description</h3>
                <div className="bg-zinc-800/50 rounded-xl p-4">
                  <div className="markdown-body">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {task.description || '*No description*'}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>

              {(task.reviewComment || task.feedback) && (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                  <p className="text-yellow-400 font-medium mb-1">Feedback:</p>
                  <p className="text-zinc-300">{task.reviewComment || task.feedback}</p>
                </div>
              )}

              {task.type === 'blog' && task.content && (
                <div className="grid grid-cols-2 gap-4">
                  {task.content.languages && (
                    <div className="bg-zinc-800/50 rounded-lg p-3">
                      <p className="text-xs text-zinc-500 mb-1">Languages</p>
                      <p className="text-white">{task.content.languages.join(', ')}</p>
                    </div>
                  )}
                  {task.content.prUrl && (
                    <div className="bg-zinc-800/50 rounded-lg p-3">
                      <p className="text-xs text-zinc-500 mb-1">Pull Request</p>
                      <a 
                        href={task.content.prUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 underline text-sm"
                      >
                        View on GitHub
                      </a>
                    </div>
                  )}
                </div>
              )}

              {canReview && (
                <div className="p-4 bg-zinc-800/50 rounded-xl">
                  <p className="text-white font-medium mb-3">Review this task:</p>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Add feedback (optional for approval, required for changes/rejection)"
                    className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 mb-4"
                    rows={3}
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleStatusChange('approved', reviewComment)}
                      disabled={updating}
                      className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => handleStatusChange('changes_requested', reviewComment)}
                      disabled={updating || !reviewComment.trim()}
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      ↻ Request Changes
                    </button>
                    <button
                      onClick={() => handleStatusChange('rejected', reviewComment)}
                      disabled={updating || !reviewComment.trim()}
                      className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      ✕ Reject
                    </button>
                  </div>
                </div>
              )}

              {canSubmitForReview && (
                <div>
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
          )}

          {activeTab === 'comments' && (
            <div className="space-y-6">
              <div className="space-y-4">
                {(!task.comments || task.comments.length === 0) ? (
                  <p className="text-zinc-500 text-center py-8">No comments yet. Start the conversation!</p>
                ) : (
                  task.comments.map((comment) => (
                    <div 
                      key={comment.id} 
                      className={`p-4 rounded-xl ${
                        comment.author === 'robert' 
                          ? 'bg-cyan-900/20 border border-cyan-800/30 ml-8' 
                          : 'bg-zinc-800/50 border border-zinc-700 mr-8'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{comment.author === 'robert' ? '🦞' : '👤'}</span>
                        <span className="font-medium text-white capitalize">{comment.author}</span>
                        <span className="text-xs text-zinc-500">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="markdown-body">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {comment.text}
                        </ReactMarkdown>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t border-zinc-800 pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-sm font-medium text-white">Add Comment</h3>
                  <label className="flex items-center gap-2 text-sm text-zinc-400 ml-auto cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifyOnComment}
                      onChange={(e) => setNotifyOnComment(e.target.checked)}
                      className="rounded border-zinc-600 bg-zinc-700 text-cyan-500 focus:ring-cyan-500"
                    />
                    🔔 Notify Robert
                  </label>
                </div>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write your feedback... (Markdown supported)"
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-sm"
                  rows={4}
                />
                <div className="flex items-center justify-between mt-3">
                  {notificationSent && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-green-400 text-sm"
                    >
                      ✓ Robert will be notified!
                    </motion.span>
                  )}
                  <button
                    onClick={handleAddComment}
                    disabled={updating || !newComment.trim()}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-600/50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors ml-auto"
                  >
                    {updating ? 'Sending...' : 'Send Comment'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'article' && hasBlogContent && (
            <div className="space-y-6">
              {/* Frontmatter Fields */}
              <div className="bg-zinc-800/50 rounded-xl p-4">
                <h3 className="text-sm font-medium text-zinc-400 mb-4">Article Metadata</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(parsed.frontmatter).map(([key, value]) => (
                    <div key={key} className={key === 'summary' || key === 'keywords' ? 'col-span-2' : ''}>
                      <p className="text-xs text-zinc-500 mb-1">{FRONTMATTER_LABELS[key] || key}</p>
                      <p className={`text-white ${key === 'summary' ? 'text-sm' : ''}`}>
                        {value || <span className="text-zinc-600">Not set</span>}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Article Content Preview */}
              <div>
                <h3 className="text-sm font-medium text-zinc-400 mb-2">Article Content</h3>
                <div className="bg-zinc-800/30 rounded-xl p-6">
                  <div className="prose prose-invert prose-lg max-w-none markdown-body">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {parsed.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'edit' && hasBlogContent && (
            <div className="space-y-6">
              {/* Editable Frontmatter Fields */}
              <div className="bg-zinc-800/50 rounded-xl p-4">
                <h3 className="text-sm font-medium text-zinc-400 mb-4">Edit Metadata</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(editedFrontmatter).map(([key, value]) => (
                    <div key={key} className={key === 'summary' || key === 'keywords' ? 'col-span-2' : ''}>
                      <label className="text-xs text-zinc-500 mb-1 block">
                        {FRONTMATTER_LABELS[key] || key}
                      </label>
                      {key === 'summary' ? (
                        <textarea
                          value={value || ''}
                          onChange={(e) => setEditedFrontmatter(prev => ({ ...prev, [key]: e.target.value }))}
                          className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          rows={2}
                        />
                      ) : (
                        <input
                          type="text"
                          value={value || ''}
                          onChange={(e) => setEditedFrontmatter(prev => ({ ...prev, [key]: e.target.value }))}
                          className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Editable Article Content */}
              <div>
                <label className="text-sm font-medium text-zinc-400 mb-2 block">Edit Article Content (Markdown)</label>
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  rows={20}
                />
              </div>

              {/* Save Button */}
              <div className="flex items-center justify-between">
                {articleSaved && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-green-400 text-sm"
                  >
                    ✓ Article saved!
                  </motion.span>
                )}
                <button
                  onClick={handleSaveArticle}
                  disabled={updating}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-600/50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors ml-auto"
                >
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

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
  const [taskType, setTaskType] = useState<TaskType>('general')
  const [assignee, setAssignee] = useState<'robert' | 'leon'>('robert')
  const [showPreview, setShowPreview] = useState(false)
  const [creating, setCreating] = useState(false)
  const [articleContent, setArticleContent] = useState('')
  const [prUrl, setPrUrl] = useState('')

  const handleCreate = async () => {
    if (!title.trim()) return
    
    setCreating(true)
    try {
      const content: Task['content'] = {}
      
      if (taskType === 'blog') {
        if (articleContent) content.article = articleContent
        if (prUrl) content.prUrl = prUrl
      }
      
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          priority,
          type: taskType,
          assignee,
          createdBy: user,
          content: Object.keys(content).length > 0 ? content : undefined,
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
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <h2 className="text-xl font-bold text-white">Create New Task</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

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

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Type</label>
              <select
                value={taskType}
                onChange={(e) => setTaskType(e.target.value as TaskType)}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="general">📋 General</option>
                <option value="tweet">🐦 Tweet</option>
                <option value="blog">📝 Blog Post</option>
                <option value="code">💻 Code</option>
                <option value="review">👁️ Review</option>
                <option value="research">🔍 Research</option>
              </select>
            </div>
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
              <label className="block text-sm font-medium text-zinc-300">Description</label>
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
              <div className="w-full min-h-[120px] px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg">
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
                rows={4}
              />
            )}
          </div>

          {taskType === 'blog' && (
            <>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">PR URL (optional)</label>
                <input
                  type="url"
                  value={prUrl}
                  onChange={(e) => setPrUrl(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="https://github.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Article Content (Markdown)</label>
                <textarea
                  value={articleContent}
                  onChange={(e) => setArticleContent(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-sm"
                  placeholder="Paste the full article in Markdown..."
                  rows={10}
                />
              </div>
            </>
          )}
        </div>

        <div className="p-6 border-t border-zinc-800 flex justify-end gap-3 shrink-0">
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
