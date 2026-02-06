'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sidebar } from '@/components/layout/Sidebar'
import { ToastProvider, useToast } from '@/components/ui/Toast'
import { LoadingPage } from '@/components/ui/Loading'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { NewContentModal, ContentFormData } from '@/components/features/content/NewContentModal'
import { ContentDetailModal } from '@/components/features/content/ContentDetailModal'
import { ContentActions } from '@/components/features/content/ContentActions'
import {
  PlatformIcon,
  Plus,
  Edit3,
  Calendar,
  Clock,
  User,
  Filter,
  Search,
  Rocket,
  AlertCircle,
  CheckCircle2,
  Eye,
  FileText,
  ChevronRight,
  Check,
} from '@/components/ui/Icons'

interface Project {
  id: string
  name: string
  icon: string
  color: string
}

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

const statusConfig: Record<string, { icon: React.ElementType; bg: string; text: string; border: string; label: string }> = {
  draft: { icon: Edit3, bg: 'bg-slate-600/20', text: 'text-slate-300', border: 'border-slate-600/50', label: 'Draft' },
  ready_for_review: { icon: Eye, bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/50', label: 'Ready for Review' },
  changes_requested: { icon: AlertCircle, bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/50', label: 'Changes Requested' },
  approved: { icon: CheckCircle2, bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/50', label: 'Approved' },
  scheduled: { icon: Clock, bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/50', label: 'Scheduled' },
  published: { icon: Rocket, bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/50', label: 'Published' },
}

const statusOptions = [
  { value: '', label: 'All Status', icon: Filter },
  { value: 'draft', label: 'Draft', icon: Edit3 },
  { value: 'ready_for_review', label: 'Ready for Review', icon: Eye },
  { value: 'changes_requested', label: 'Changes Requested', icon: AlertCircle },
  { value: 'approved', label: 'Approved', icon: CheckCircle2 },
  { value: 'scheduled', label: 'Scheduled', icon: Clock },
  { value: 'published', label: 'Published', icon: Rocket },
]

const platformOptions = [
  { value: '', label: 'All Platforms' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'twitter', label: 'Twitter' },
  { value: 'blog', label: 'Blog' },
]

function ContentPageContent() {
  const [projects, setProjects] = useState<Project[]>([])
  const [content, setContent] = useState<ContentItem[]>([])
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [platformFilter, setPlatformFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showNewContentModal, setShowNewContentModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)

  const toast = useToast()

  const fetchData = useCallback(async () => {
    try {
      const [projectsRes] = await Promise.all([
        fetch('/api/projects'),
      ])

      let contentUrl = '/api/content?'
      if (selectedProject) contentUrl += `projectId=${selectedProject}&`
      if (statusFilter) contentUrl += `status=${statusFilter}&`
      if (platformFilter) contentUrl += `platform=${platformFilter}&`

      const [projectsData, contentRes] = await Promise.all([
        projectsRes.json(),
        fetch(contentUrl).then(r => r.json()),
      ])

      setProjects(projectsData.projects || [])
      setContent(contentRes.content || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
      toast.error('Failed to load content', 'Please try refreshing the page')
    } finally {
      setLoading(false)
    }
  }, [selectedProject, statusFilter, platformFilter, toast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Create new content
  const handleCreateContent = async (formData: ContentFormData) => {
    try {
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: formData.projectId,
          platform: formData.platform,
          type: formData.type,
          title: formData.title,
          content: formData.content,
          priority: formData.priority,
          scheduledFor: formData.scheduledFor || undefined,
          status: formData.submitForReview ? 'ready_for_review' : 'draft',
        }),
      })

      if (!res.ok) throw new Error('Failed to create content')

      toast.success('Content Created', formData.submitForReview ? 'Submitted for review' : 'Saved as draft')
      await fetchData()
    } catch (error) {
      console.error('Failed to create content:', error)
      toast.error('Failed to create content')
      throw error
    }
  }

  // Update content status
  const handleStatusChange = async (contentId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/content/${contentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) throw new Error('Failed to update')

      const statusLabel = statusConfig[newStatus]?.label || newStatus
      toast.success('Status Updated', `Content moved to "${statusLabel}"`)
      await fetchData()
      
      // Update selected content if it's the one being modified
      if (selectedContent?.id === contentId) {
        setSelectedContent(prev => prev ? { ...prev, status: newStatus } : null)
      }
    } catch (error) {
      console.error('Failed to update status:', error)
      toast.error('Update Failed', 'Could not update content status')
      throw error
    }
  }

  // Update content
  const handleUpdateContent = async (contentId: string, updates: Partial<ContentItem>) => {
    try {
      const res = await fetch(`/api/content/${contentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (!res.ok) throw new Error('Failed to update')

      toast.success('Content Updated')
      await fetchData()
      
      // Update selected content
      if (selectedContent?.id === contentId) {
        setSelectedContent(prev => prev ? { ...prev, ...updates } : null)
      }
    } catch (error) {
      console.error('Failed to update content:', error)
      toast.error('Update Failed')
      throw error
    }
  }

  // Delete content
  const handleDeleteContent = async (contentId: string) => {
    try {
      const res = await fetch(`/api/content/${contentId}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete')

      toast.success('Content Deleted')
      await fetchData()
    } catch (error) {
      console.error('Failed to delete content:', error)
      toast.error('Delete Failed')
      throw error
    }
  }

  // Bulk actions
  const handleAutoDistribute = async (cadenceDays: number) => {
    const unscheduled = content.filter(c => !c.scheduledFor && c.status !== 'published')
    if (unscheduled.length === 0) {
      toast.info('No Content to Schedule', 'All content is already scheduled')
      return
    }

    // Distribute starting from tomorrow
    const startDate = new Date()
    startDate.setDate(startDate.getDate() + 1)
    startDate.setHours(10, 0, 0, 0)

    let currentDate = new Date(startDate)

    for (const item of unscheduled) {
      try {
        await fetch(`/api/content/${item.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scheduledFor: currentDate.toISOString(),
            status: item.status === 'approved' ? 'scheduled' : item.status,
          }),
        })
      } catch (error) {
        console.error(`Failed to schedule ${item.id}:`, error)
      }

      currentDate.setDate(currentDate.getDate() + cadenceDays)
    }

    toast.success('Content Distributed', `${unscheduled.length} items scheduled`)
    await fetchData()
  }

  const handleScheduleApproved = async () => {
    const approved = content.filter(c => c.status === 'approved' && !c.scheduledFor)
    if (approved.length === 0) {
      toast.info('No Approved Content', 'No approved content without schedule')
      return
    }

    const startDate = new Date()
    startDate.setDate(startDate.getDate() + 1)
    startDate.setHours(10, 0, 0, 0)

    let currentDate = new Date(startDate)

    for (const item of approved) {
      try {
        await fetch(`/api/content/${item.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scheduledFor: currentDate.toISOString(),
            status: 'scheduled',
          }),
        })
      } catch (error) {
        console.error(`Failed to schedule ${item.id}:`, error)
      }

      currentDate.setDate(currentDate.getDate() + 2)
    }

    toast.success('Content Scheduled', `${approved.length} items scheduled`)
    await fetchData()
  }

  const handleBulkApprove = async (ids: string[]) => {
    let successCount = 0

    for (const id of ids) {
      try {
        await fetch(`/api/content/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'approved' }),
        })
        successCount++
      } catch (error) {
        console.error(`Failed to approve ${id}:`, error)
      }
    }

    toast.success('Content Approved', `${successCount} items approved`)
    await fetchData()
  }

  const handlePreviewSchedule = () => {
    setShowPreviewModal(true)
  }

  // Toggle item selection
  const toggleSelection = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  // Filter content by search
  const filteredContent = content.filter(item => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      item.title.toLowerCase().includes(query) ||
      item.content.toLowerCase().includes(query)
    )
  })

  if (loading) {
    return <LoadingPage message="Loading content..." />
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Sidebar
        projects={projects}
        selectedProject={selectedProject}
        onProjectChange={setSelectedProject}
      />

      <main className="flex-1 p-6 overflow-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <FileText size={32} className="text-cyan-400" />
                Content
              </h1>
              <p className="text-slate-400">
                {filteredContent.length} items
                {selectedProject && ` in ${projects.find(p => p.id === selectedProject)?.name}`}
              </p>
            </div>

            <button
              onClick={() => setShowNewContentModal(true)}
              className="px-4 py-2 bg-cyan-500 text-black font-medium rounded-lg hover:bg-cyan-400 transition-colors flex items-center gap-2"
            >
              <Plus size={18} />
              New Content
            </button>
          </div>

          {/* Quick Actions Panel */}
          <div className="mb-6">
            <ContentActions
              content={content}
              onAutoDistribute={handleAutoDistribute}
              onScheduleApproved={handleScheduleApproved}
              onBulkApprove={handleBulkApprove}
              onPreviewSchedule={handlePreviewSchedule}
              selectedIds={selectedIds}
              onSelectedIdsChange={setSelectedIds}
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white w-64 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              {platformOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            {selectedIds.length > 0 && (
              <button
                onClick={() => setSelectedIds([])}
                className="px-3 py-2 bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-700 transition-colors text-sm"
              >
                Clear selection ({selectedIds.length})
              </button>
            )}
          </div>

          {/* Content List */}
          <div className="space-y-4">
            {filteredContent.length === 0 ? (
              <div className="bg-slate-800/50 rounded-xl p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center mx-auto mb-4">
                  <FileText size={32} className="text-slate-500" />
                </div>
                <p className="text-slate-400 text-lg mb-2">No content found</p>
                <p className="text-slate-500 text-sm mb-4">Try adjusting your filters or create new content</p>
                <button
                  onClick={() => setShowNewContentModal(true)}
                  className="px-4 py-2 bg-cyan-500 text-black font-medium rounded-lg hover:bg-cyan-400 transition-colors inline-flex items-center gap-2"
                >
                  <Plus size={18} />
                  Create Content
                </button>
              </div>
            ) : (
              filteredContent.map(item => {
                const config = statusConfig[item.status] || statusConfig.draft
                const StatusIconComponent = config.icon
                const isSelected = selectedIds.includes(item.id)

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`bg-slate-800/50 border rounded-xl p-4 cursor-pointer transition-all ${
                      isSelected ? 'border-cyan-500 ring-2 ring-cyan-500/20' : 'border-slate-700 hover:border-cyan-500/30'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Selection Checkbox */}
                      <div className="shrink-0 pt-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleSelection(item.id)
                          }}
                          className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'bg-cyan-500 border-cyan-500'
                              : 'border-slate-600 hover:border-slate-500'
                          }`}
                        >
                          {isSelected && <Check size={12} className="text-black" />}
                        </button>
                      </div>

                      <div
                        className="flex-1 min-w-0 flex items-start gap-4"
                        onClick={() => setSelectedContent(item)}
                      >
                        <div className="w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center shrink-0">
                          <PlatformIcon platform={item.platform} size={24} className="text-slate-300" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-white font-medium truncate">{item.title}</h3>
                            <span className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${config.bg} ${config.text} border ${config.border}`}>
                              <StatusIconComponent size={12} />
                              {config.label}
                            </span>
                          </div>

                          <p className="text-slate-400 text-sm line-clamp-2 mb-2">
                            {item.content}
                          </p>

                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              {projects.find(p => p.id === item.projectId)?.icon}
                              {projects.find(p => p.id === item.projectId)?.name}
                            </span>
                            <span className="flex items-center gap-1">
                              <User size={12} />
                              {item.createdBy}
                            </span>
                            {item.scheduledFor && (
                              <span className="text-cyan-400 flex items-center gap-1">
                                <Calendar size={12} />
                                {new Date(item.scheduledFor).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {item.status === 'ready_for_review' && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleStatusChange(item.id, 'approved')
                                }}
                                className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 text-sm flex items-center gap-1 transition-colors"
                              >
                                <Check size={14} />
                                Approve
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleStatusChange(item.id, 'changes_requested')
                                }}
                                className="px-3 py-1.5 bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/30 text-sm flex items-center gap-1 transition-colors"
                              >
                                <Edit3 size={14} />
                                Changes
                              </button>
                            </>
                          )}
                          {item.status === 'approved' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleStatusChange(item.id, 'published')
                              }}
                              className="px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 text-sm flex items-center gap-1 transition-colors"
                            >
                              <Rocket size={14} />
                              Publish
                            </button>
                          )}
                          <ChevronRight size={18} className="text-slate-600" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })
            )}
          </div>
        </motion.div>
      </main>

      {/* New Content Modal */}
      <NewContentModal
        isOpen={showNewContentModal}
        onClose={() => setShowNewContentModal(false)}
        onSubmit={handleCreateContent}
        projects={projects}
      />

      {/* Content Detail Modal */}
      <ContentDetailModal
        isOpen={!!selectedContent}
        onClose={() => setSelectedContent(null)}
        content={selectedContent}
        projects={projects}
        onStatusChange={handleStatusChange}
        onUpdate={handleUpdateContent}
        onDelete={handleDeleteContent}
      />

      {/* Preview Schedule Modal */}
      <AnimatePresence>
        {showPreviewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowPreviewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-700 rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
            >
              <div className="p-6 border-b border-slate-700">
                <h2 className="text-xl font-semibold text-white">Schedule Preview</h2>
                <p className="text-slate-400 text-sm mt-1">What your publishing schedule would look like</p>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {content.filter(c => c.scheduledFor).length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar size={48} className="text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No scheduled content yet</p>
                    <p className="text-slate-500 text-sm mt-1">Use "Auto-Distribute" to schedule content</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {content
                      .filter(c => c.scheduledFor)
                      .sort((a, b) => new Date(a.scheduledFor!).getTime() - new Date(b.scheduledFor!).getTime())
                      .map(item => {
                        const config = statusConfig[item.status] || statusConfig.draft
                        return (
                          <div key={item.id} className="flex items-center gap-4 p-3 bg-slate-800 rounded-lg">
                            <div className="text-center w-20">
                              <div className="text-cyan-400 font-bold">
                                {new Date(item.scheduledFor!).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                              </div>
                              <div className="text-slate-500 text-xs">
                                {new Date(item.scheduledFor!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                            <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center">
                              <PlatformIcon platform={item.platform} size={16} className="text-slate-300" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-white font-medium truncate">{item.title}</div>
                              <div className={`text-xs ${config.text}`}>{config.label}</div>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                )}
              </div>
              <div className="p-6 border-t border-slate-700">
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="w-full px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function ContentPage() {
  return (
    <ToastProvider>
      <ContentPageContent />
    </ToastProvider>
  )
}
