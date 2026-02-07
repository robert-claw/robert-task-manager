'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Edit3,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  Rocket,
  Calendar,
  User,
  Save,
  Trash2,
} from 'lucide-react'
import { PlatformIcon, LoadingSpinner } from '@/components/ui/Icons'

interface ContentItem {
  id: string
  projectId: string
  type: string
  platform: string
  title: string
  content: string
  status: string
  priority: string
  scheduledFor?: string
  createdBy: string
  assignee: string
  createdAt: string
}

interface Project {
  id: string
  name: string
  icon: string
}

interface ContentDetailModalProps {
  isOpen: boolean
  onClose: () => void
  content: ContentItem | null
  projects: Project[]
  onStatusChange: (contentId: string, newStatus: string) => Promise<void>
  onUpdate: (contentId: string, updates: Partial<ContentItem>) => Promise<void>
  onDelete: (contentId: string) => Promise<void>
  onAddComment?: (contentId: string, comment: string) => Promise<void>
}

const statusConfig: Record<string, { icon: React.ElementType; bg: string; text: string; border: string; label: string }> = {
  draft: { icon: Edit3, bg: 'bg-slate-600/20', text: 'text-slate-300', border: 'border-slate-600/50', label: 'Draft' },
  ready_for_review: { icon: Eye, bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/50', label: 'Ready for Review' },
  changes_requested: { icon: AlertCircle, bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/50', label: 'Changes Requested' },
  approved: { icon: CheckCircle2, bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/50', label: 'Approved' },
  scheduled: { icon: Clock, bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/50', label: 'Scheduled' },
  published: { icon: Rocket, bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/50', label: 'Published' },
}

export function ContentDetailModal({
  isOpen,
  onClose,
  content,
  projects,
  onStatusChange,
  onUpdate,
  onDelete,
  onAddComment,
}: ContentDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState('')
  const [editedTitle, setEditedTitle] = useState('')
  const [editedScheduledFor, setEditedScheduledFor] = useState('')
  const [loading, setLoading] = useState<string | null>(null)
  const [showChangesModal, setShowChangesModal] = useState(false)
  const [changesRequested, setChangesRequested] = useState('')

  // Reset edit state when content changes
  useEffect(() => {
    if (content) {
      setEditedContent(content.content)
      setEditedTitle(content.title)
      setEditedScheduledFor(content.scheduledFor ? content.scheduledFor.slice(0, 16) : '')
      setIsEditing(false)
    }
  }, [content])

  // Handle ESC key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (isEditing) {
        setIsEditing(false)
      } else {
        onClose()
      }
    }
  }, [isEditing, onClose])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleKeyDown])

  if (!content) return null

  const config = statusConfig[content.status] || statusConfig.draft
  const StatusIconComponent = config.icon
  const project = projects.find(p => p.id === content.projectId)

  const handleSave = async () => {
    setLoading('save')
    try {
      await onUpdate(content.id, {
        title: editedTitle,
        content: editedContent,
        scheduledFor: editedScheduledFor || undefined,
      })
      setIsEditing(false)
    } finally {
      setLoading(null)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    setLoading(newStatus)
    try {
      await onStatusChange(content.id, newStatus)
    } finally {
      setLoading(null)
    }
  }

  const handleRequestChanges = async () => {
    if (!changesRequested.trim()) return
    
    setLoading('changes_requested')
    try {
      // Add the comment first
      if (onAddComment) {
        await onAddComment(content.id, `📝 Changes requested: ${changesRequested}`)
      }
      // Then change status
      await onStatusChange(content.id, 'changes_requested')
      setShowChangesModal(false)
      setChangesRequested('')
    } finally {
      setLoading(null)
    }
  }

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this content? This action cannot be undone.')) {
      setLoading('delete')
      try {
        await onDelete(content.id)
        onClose()
      } finally {
        setLoading(null)
      }
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                    <PlatformIcon platform={content.platform} size={24} className="text-slate-300" />
                  </div>
                  <div className="min-w-0 flex-1">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    ) : (
                      <h2 className="text-xl font-bold text-white truncate">{content.title}</h2>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${config.bg} ${config.text} border ${config.border}`}>
                        <StatusIconComponent size={12} />
                        {config.label}
                      </span>
                      <span className="text-slate-500 text-sm">
                        {project?.icon} {project?.name}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!isEditing && content.status !== 'published' && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                      title="Edit content"
                    >
                      <Edit3 size={20} />
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    aria-label="Close modal"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Content</label>
                    <textarea
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      rows={10}
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                    />
                    <div className="text-xs text-slate-500 mt-1">
                      {editedContent.length} characters
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      <span className="flex items-center gap-2">
                        <Calendar size={14} />
                        Schedule For
                      </span>
                    </label>
                    <input
                      type="datetime-local"
                      value={editedScheduledFor}
                      onChange={(e) => setEditedScheduledFor(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-slate-800 rounded-lg p-4 mb-4">
                  <pre className="text-slate-300 whitespace-pre-wrap font-sans text-sm leading-relaxed">
                    {content.content}
                  </pre>
                </div>
              )}

              {!isEditing && (
                <div className="flex items-center justify-between text-sm text-slate-500 mb-6">
                  <div className="flex items-center gap-1">
                    <User size={14} />
                    Created by {content.createdBy} • {new Date(content.createdAt).toLocaleString()}
                  </div>
                  {content.scheduledFor && (
                    <div className="text-cyan-400 flex items-center gap-1">
                      <Calendar size={14} />
                      Scheduled: {new Date(content.scheduledFor).toLocaleString()}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-slate-700">
              {isEditing ? (
                <div className="flex items-center justify-between">
                  <button
                    onClick={handleDelete}
                    disabled={loading === 'delete'}
                    className="px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsEditing(false)}
                      disabled={loading === 'save'}
                      className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={loading === 'save'}
                      className="px-4 py-2 bg-cyan-500 text-black font-medium rounded-lg hover:bg-cyan-400 transition-colors flex items-center gap-2"
                    >
                      {loading === 'save' ? <LoadingSpinner size={16} /> : <Save size={16} />}
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {/* Status transitions based on current status */}
                  {content.status === 'draft' && (
                    <button
                      onClick={() => handleStatusChange('ready_for_review')}
                      disabled={loading === 'ready_for_review'}
                      className="flex-1 px-4 py-2.5 bg-yellow-500 text-black font-medium rounded-lg hover:bg-yellow-400 flex items-center justify-center gap-2 transition-colors"
                    >
                      {loading === 'ready_for_review' ? <LoadingSpinner size={16} /> : <Eye size={18} />}
                      Submit for Review
                    </button>
                  )}
                  
                  {content.status === 'ready_for_review' && (
                    <>
                      <button
                        onClick={() => handleStatusChange('approved')}
                        disabled={loading === 'approved'}
                        className="flex-1 px-4 py-2.5 bg-green-500 text-black font-medium rounded-lg hover:bg-green-400 flex items-center justify-center gap-2 transition-colors"
                      >
                        {loading === 'approved' ? <LoadingSpinner size={16} /> : <CheckCircle2 size={18} />}
                        Approve
                      </button>
                      <button
                        onClick={() => setShowChangesModal(true)}
                        disabled={loading === 'changes_requested'}
                        className="flex-1 px-4 py-2.5 bg-orange-500 text-black font-medium rounded-lg hover:bg-orange-400 flex items-center justify-center gap-2 transition-colors"
                      >
                        {loading === 'changes_requested' ? <LoadingSpinner size={16} /> : <AlertCircle size={18} />}
                        Request Changes
                      </button>
                    </>
                  )}
                  
                  {content.status === 'changes_requested' && (
                    <button
                      onClick={() => handleStatusChange('ready_for_review')}
                      disabled={loading === 'ready_for_review'}
                      className="flex-1 px-4 py-2.5 bg-yellow-500 text-black font-medium rounded-lg hover:bg-yellow-400 flex items-center justify-center gap-2 transition-colors"
                    >
                      {loading === 'ready_for_review' ? <LoadingSpinner size={16} /> : <Eye size={18} />}
                      Re-submit for Review
                    </button>
                  )}
                  
                  {content.status === 'approved' && (
                    <>
                      <button
                        onClick={() => handleStatusChange('scheduled')}
                        disabled={loading === 'scheduled' || !content.scheduledFor}
                        className="flex-1 px-4 py-2.5 bg-blue-500 text-black font-medium rounded-lg hover:bg-blue-400 flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title={!content.scheduledFor ? 'Set a schedule date first' : ''}
                      >
                        {loading === 'scheduled' ? <LoadingSpinner size={16} /> : <Clock size={18} />}
                        Schedule
                      </button>
                      <button
                        onClick={() => handleStatusChange('published')}
                        disabled={loading === 'published'}
                        className="flex-1 px-4 py-2.5 bg-purple-500 text-black font-medium rounded-lg hover:bg-purple-400 flex items-center justify-center gap-2 transition-colors"
                      >
                        {loading === 'published' ? <LoadingSpinner size={16} /> : <Rocket size={18} />}
                        Publish Now
                      </button>
                    </>
                  )}
                  
                  {content.status === 'scheduled' && (
                    <button
                      onClick={() => handleStatusChange('published')}
                      disabled={loading === 'published'}
                      className="flex-1 px-4 py-2.5 bg-purple-500 text-black font-medium rounded-lg hover:bg-purple-400 flex items-center justify-center gap-2 transition-colors"
                    >
                      {loading === 'published' ? <LoadingSpinner size={16} /> : <Rocket size={18} />}
                      Publish Now
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          {/* Request Changes Modal */}
          <AnimatePresence>
            {showChangesModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/50 flex items-center justify-center p-4"
                onClick={() => setShowChangesModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.95 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-slate-800 border border-slate-600 rounded-xl p-6 max-w-md w-full"
                >
                  <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                    <AlertCircle size={20} className="text-orange-400" />
                    Request Changes
                  </h3>
                  <p className="text-sm text-slate-400 mb-4">
                    What changes would you like to see?
                  </p>
                  <textarea
                    value={changesRequested}
                    onChange={(e) => setChangesRequested(e.target.value)}
                    placeholder="Describe the changes needed..."
                    rows={4}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none mb-4"
                    autoFocus
                  />
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => {
                        setShowChangesModal(false)
                        setChangesRequested('')
                      }}
                      className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRequestChanges}
                      disabled={!changesRequested.trim() || loading === 'changes_requested'}
                      className="px-4 py-2 bg-orange-500 text-black font-medium rounded-lg hover:bg-orange-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {loading === 'changes_requested' ? <LoadingSpinner size={16} /> : <AlertCircle size={16} />}
                      Request Changes
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
