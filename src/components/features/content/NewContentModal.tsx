'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Calendar, Clock, AlertTriangle } from 'lucide-react'
import { PlatformIcon, LoadingSpinner } from '@/components/ui/Icons'
import { TagInput } from '@/components/ui/TagInput'

interface Project {
  id: string
  name: string
  icon: string
}

interface NewContentModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ContentFormData) => Promise<void>
  projects: Project[]
}

export interface ContentFormData {
  projectId: string
  platform: string
  type: string
  title: string
  content: string
  hashtags?: string[]
  scheduledFor?: string
  priority: string
  submitForReview: boolean
}

const platformOptions = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'twitter', label: 'Twitter' },
  { value: 'blog', label: 'Blog' },
  { value: 'instagram', label: 'Instagram' },
]

const contentTypeOptions = [
  { value: 'post', label: 'Post' },
  { value: 'article', label: 'Article' },
  { value: 'tweet', label: 'Tweet' },
  { value: 'thread', label: 'Thread' },
]

const priorityOptions = [
  { value: 'low', label: 'Low', color: 'text-slate-400' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-400' },
  { value: 'high', label: 'High', color: 'text-orange-400' },
  { value: 'urgent', label: 'Urgent', color: 'text-red-400' },
]

export function NewContentModal({ isOpen, onClose, onSubmit, projects }: NewContentModalProps) {
  const [formData, setFormData] = useState<ContentFormData>({
    projectId: projects[0]?.id || '',
    platform: 'linkedin',
    type: 'post',
    title: '',
    content: '',
    hashtags: [],
    scheduledFor: '',
    priority: 'medium',
    submitForReview: false,
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate
    const newErrors: Record<string, string> = {}
    if (!formData.projectId) newErrors.projectId = 'Please select a project'
    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (!formData.content.trim()) newErrors.content = 'Content is required'
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    setLoading(true)
    try {
      await onSubmit(formData)
      // Reset form
      setFormData({
        projectId: projects[0]?.id || '',
        platform: 'linkedin',
        type: 'post',
        title: '',
        content: '',
        scheduledFor: '',
        priority: 'medium',
        submitForReview: false,
      })
      setErrors({})
      onClose()
    } catch (error) {
      console.error('Failed to create content:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof ContentFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // Handle ESC key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
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
          onKeyDown={handleKeyDown}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                  <Plus size={20} className="text-cyan-400" />
                </div>
                <h2 className="text-xl font-semibold text-white">Create New Content</h2>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Project and Platform Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Project *
                  </label>
                  <select
                    value={formData.projectId}
                    onChange={(e) => handleChange('projectId', e.target.value)}
                    className={`w-full bg-slate-800 border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                      errors.projectId ? 'border-red-500' : 'border-slate-700'
                    }`}
                  >
                    <option value="">Select project...</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.icon} {project.name}
                      </option>
                    ))}
                  </select>
                  {errors.projectId && (
                    <p className="text-red-400 text-sm mt-1">{errors.projectId}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Platform *
                  </label>
                  <select
                    value={formData.platform}
                    onChange={(e) => handleChange('platform', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    {platformOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Content Type and Priority Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Content Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleChange('type', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    {contentTypeOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => handleChange('priority', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    {priorityOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Enter content title..."
                  className={`w-full bg-slate-800 border rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                    errors.title ? 'border-red-500' : 'border-slate-700'
                  }`}
                />
                {errors.title && (
                  <p className="text-red-400 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              {/* Content Body */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Content *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => handleChange('content', e.target.value)}
                  placeholder="Write your content here..."
                  rows={6}
                  className={`w-full bg-slate-800 border rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none ${
                    errors.content ? 'border-red-500' : 'border-slate-700'
                  }`}
                />
                {errors.content && (
                  <p className="text-red-400 text-sm mt-1">{errors.content}</p>
                )}
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>{formData.content.length} characters</span>
                  {formData.platform === 'twitter' && formData.content.length > 280 && (
                    <span className="text-red-400 flex items-center gap-1">
                      <AlertTriangle size={12} />
                      Exceeds Twitter limit
                    </span>
                  )}
                </div>
              </div>

              {/* Hashtags */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Hashtags (Optional)
                </label>
                <TagInput
                  tags={formData.hashtags || []}
                  onChange={(tags) => setFormData(prev => ({ ...prev, hashtags: tags }))}
                  placeholder="Add hashtag..."
                  maxTags={5}
                />
              </div>

              {/* Scheduled Date/Time */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  <span className="flex items-center gap-2">
                    <Calendar size={14} />
                    Schedule For (Optional)
                  </span>
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduledFor}
                  onChange={(e) => handleChange('scheduledFor', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Leave empty to save as unscheduled draft
                </p>
              </div>

              {/* Submit for Review Toggle */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.submitForReview}
                    onChange={(e) => handleChange('submitForReview', e.target.checked)}
                    className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-900"
                  />
                  <div>
                    <div className="text-white font-medium">Submit for Review</div>
                    <div className="text-sm text-slate-400">
                      Mark as "Ready for Review" instead of saving as draft
                    </div>
                  </div>
                </label>
              </div>
            </form>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-700">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2.5 bg-cyan-500 text-black font-medium rounded-lg hover:bg-cyan-400 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size={16} />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus size={18} />
                    {formData.submitForReview ? 'Create & Submit' : 'Create Draft'}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
