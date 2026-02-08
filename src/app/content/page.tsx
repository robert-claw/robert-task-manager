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
import { BulkActions } from '@/components/BulkActions'
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
  FolderOpen,
  ChevronRight,
  Check,
  Trash2,
} from '@/components/ui/Icons'

interface PlatformConfig {
  platform: string
  enabled: boolean
  cadence?: string
}

interface Project {
  id: string
  name: string
  icon: string
  color: string
  platforms?: PlatformConfig[]
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
  const [selectedProjects, setSelectedProjects] = useState<string[]>([])
  const [selectedProject, setSelectedProject] = useState<string | null>(null) // For sidebar compatibility
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

  // Sync sidebar selection with multi-select
  const handleSidebarProjectChange = (projectId: string | null) => {
    setSelectedProject(projectId)
    if (projectId) {
      setSelectedProjects([projectId])
    } else {
      setSelectedProjects([])
    }
  }

  // Toggle project in multi-select
  const toggleProjectSelection = (projectId: string) => {
    setSelectedProjects(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    )
    setSelectedProject(null) // Clear sidebar single selection when using multi-select
  }

  const fetchData = useCallback(async () => {
    try {
      const [projectsRes] = await Promise.all([
        fetch('/api/projects'),
      ])

      // Only fetch content if projects are selected
      let contentData: { content: ContentItem[] } = { content: [] }
      if (selectedProjects.length > 0) {
        // Fetch content for each selected project
        const contentPromises = selectedProjects.map(projectId => {
          let url = `/api/content?projectId=${projectId}`
          if (statusFilter) url += `&status=${statusFilter}`
          if (platformFilter) url += `&platform=${platformFilter}`
          return fetch(url).then(r => r.json())
        })
        const contentResults = await Promise.all(contentPromises)
        contentData = { content: contentResults.flatMap((r: { content?: ContentItem[] }) => r.content || []) }
      }

      const projectsData = await projectsRes.json()

      setProjects(projectsData.projects || [])
      setContent(contentData.content || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
      toast.error('Failed to load content', 'Please try refreshing the page')
    } finally {
      setLoading(false)
    }
  }, [selectedProjects, statusFilter, platformFilter, toast])

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

  const handleAddComment = async (contentId: string, comment: string) => {
    try {
      const res = await fetch(`/api/content/${contentId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: 'leon',
          text: comment,
          notifyRobert: true,
        }),
      })

      if (!res.ok) throw new Error('Failed to add comment')
      
      toast.success('Comment Added')
    } catch (error) {
      console.error('Failed to add comment:', error)
      toast.error('Failed to Add Comment')
      throw error
    }
  }

  // Parse cadence string to days between posts
  const parseCadenceToDays = (cadence?: string): number => {
    if (!cadence) return 2 // default
    // Patterns: "4x/week", "daily", "2x/month", "weekly"
    if (cadence === 'daily') return 1
    if (cadence === 'weekly') return 7
    if (cadence.includes('/week')) {
      const match = cadence.match(/(\d+)x\/week/)
      if (match) {
        const perWeek = parseInt(match[1])
        return Math.ceil(7 / perWeek)
      }
    }
    if (cadence.includes('/month')) {
      const match = cadence.match(/(\d+)x\/month/)
      if (match) {
        const perMonth = parseInt(match[1])
        return Math.ceil(30 / perMonth)
      }
    }
    return 2 // default fallback
  }

  // Get platforms from selected projects
  const getSelectedPlatforms = (): PlatformConfig[] => {
    const platforms: PlatformConfig[] = []
    for (const projectId of selectedProjects) {
      const project = projects.find(p => p.id === projectId)
      if (project?.platforms) {
        for (const platform of project.platforms) {
          if (platform.enabled && !platforms.some(p => p.platform === platform.platform)) {
            platforms.push(platform)
          }
        }
      }
    }
    return platforms
  }

  // Priority order for scheduling (higher priority = schedule earlier)
  const priorityOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 }

  // Bulk actions
  const handleAutoDistribute = async () => {
    const unscheduled = content.filter(c => !c.scheduledFor && c.status !== 'published')
    if (unscheduled.length === 0) {
      toast.info('No Content to Schedule', 'All content is already scheduled')
      return
    }

    // Get platform configs for cadence
    const platformConfigs = getSelectedPlatforms()
    
    // Get already scheduled content to find occupied dates
    const scheduled = content.filter(c => c.scheduledFor)
    
    // Build map of occupied dates per platform
    const occupiedDates: Record<string, Set<string>> = {}
    for (const item of scheduled) {
      if (!occupiedDates[item.platform]) {
        occupiedDates[item.platform] = new Set()
      }
      const dateKey = new Date(item.scheduledFor!).toISOString().split('T')[0]
      occupiedDates[item.platform].add(dateKey)
    }
    
    // Group unscheduled content by platform and sort by priority
    const byPlatform: Record<string, typeof unscheduled> = {}
    for (const item of unscheduled) {
      if (!byPlatform[item.platform]) {
        byPlatform[item.platform] = []
      }
      byPlatform[item.platform].push(item)
    }
    
    // Sort each platform's content by priority (urgent first)
    for (const platform of Object.keys(byPlatform)) {
      byPlatform[platform].sort((a, b) => 
        (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2)
      )
    }

    // Distribute each platform's content based on its cadence, skipping occupied dates
    let totalScheduled = 0
    const startDate = new Date()
    startDate.setDate(startDate.getDate() + 1)
    startDate.setHours(10, 0, 0, 0)

    for (const [platform, items] of Object.entries(byPlatform)) {
      const config = platformConfigs.find(p => p.platform === platform)
      const cadenceDays = parseCadenceToDays(config?.cadence)
      const occupied = occupiedDates[platform] || new Set()
      
      let currentDate = new Date(startDate)
      let attempts = 0
      const maxAttempts = 365 // Don't look more than a year ahead

      for (const item of items) {
        // Find next available slot for this platform
        while (attempts < maxAttempts) {
          const dateKey = currentDate.toISOString().split('T')[0]
          if (!occupied.has(dateKey)) {
            // Found an available slot
            break
          }
          // Skip to next day and try again
          currentDate.setDate(currentDate.getDate() + 1)
          attempts++
        }
        
        if (attempts >= maxAttempts) {
          console.error(`Could not find slot for ${item.id}`)
          continue
        }

        try {
          const scheduledFor = currentDate.toISOString()
          await fetch(`/api/content/${item.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              scheduledFor,
              status: item.status === 'approved' ? 'scheduled' : item.status,
            }),
          })
          totalScheduled++
          
          // Mark this date as occupied
          const dateKey = currentDate.toISOString().split('T')[0]
          occupied.add(dateKey)
        } catch (error) {
          console.error(`Failed to schedule ${item.id}:`, error)
        }

        // Move forward by cadence days for next item
        currentDate.setDate(currentDate.getDate() + cadenceDays)
        attempts = 0
      }
    }

    toast.success('Content Distributed', `${totalScheduled} items scheduled based on project cadence`)
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
        onProjectChange={handleSidebarProjectChange}
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

          {/* Project Selection */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-slate-400">Select projects:</span>
              {selectedProjects.length > 0 && (
                <button
                  onClick={() => setSelectedProjects([])}
                  className="text-xs text-slate-500 hover:text-slate-300"
                >
                  Clear all
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {projects.map(project => {
                const isSelected = selectedProjects.includes(project.id)
                return (
                  <button
                    key={project.id}
                    onClick={() => toggleProjectSelection(project.id)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                        : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <span>{project.icon}</span>
                    <span>{project.name}</span>
                    {isSelected && <Check size={14} />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Quick Actions Panel - Only show when projects selected */}
          {selectedProjects.length > 0 && (
          <div className="mb-6">
            <ContentActions
              content={content}
              platforms={getSelectedPlatforms()}
              onAutoDistribute={handleAutoDistribute}
              onScheduleApproved={handleScheduleApproved}
              onBulkApprove={handleBulkApprove}
              onPreviewSchedule={handlePreviewSchedule}
              selectedIds={selectedIds}
              onSelectedIdsChange={setSelectedIds}
            />
          </div>
          )}

          {/* Filters - Only show when projects selected */}
          {selectedProjects.length > 0 && (
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
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm text-slate-400">{selectedIds.length} selected</span>
                <button
                  onClick={async () => {
                    if (confirm(`Reset ${selectedIds.length} item(s) to draft?`)) {
                      for (const id of selectedIds) {
                        await handleStatusChange(id, 'draft')
                      }
                      setSelectedIds([])
                      toast.success('Content Reset', `${selectedIds.length} items reset to draft`)
                    }
                  }}
                  className="px-3 py-2 bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/30 transition-colors text-sm flex items-center gap-1"
                >
                  <Edit3 size={14} />
                  Redo
                </button>
                <button
                  onClick={async () => {
                    if (confirm(`Delete ${selectedIds.length} item(s)? This cannot be undone.`)) {
                      for (const id of selectedIds) {
                        await handleDeleteContent(id)
                      }
                      setSelectedIds([])
                      toast.success('Content Deleted', `${selectedIds.length} items deleted`)
                    }
                  }}
                  className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm flex items-center gap-1"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
                <button
                  onClick={() => setSelectedIds([])}
                  className="px-3 py-2 bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-700 transition-colors text-sm"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
          )}

          {/* Content List - Grouped by Platform */}
          {selectedProjects.length === 0 ? (
            <div className="bg-slate-800/50 rounded-xl p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center mx-auto mb-4">
                <FolderOpen size={32} className="text-slate-500" />
              </div>
              <p className="text-slate-400 text-lg mb-2">Select a project to view content</p>
              <p className="text-slate-500 text-sm">Choose one or more projects above to see their content</p>
            </div>
          ) : filteredContent.length === 0 ? (
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Group by platform */}
              {['linkedin', 'twitter', 'blog'].map(platform => {
                const platformContent = filteredContent.filter(c => c.platform === platform)
                if (platformContent.length === 0 && platformFilter && platformFilter !== platform) return null
                
                const platformLabels: Record<string, string> = {
                  linkedin: 'LinkedIn',
                  twitter: 'Twitter',
                  blog: 'Blog',
                }
                
                return (
                  <div key={platform} className="bg-slate-800/30 rounded-xl border border-slate-700/50">
                    {/* Platform Header */}
                    <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <PlatformIcon platform={platform} size={20} className="text-slate-400" />
                        <h3 className="text-white font-medium">{platformLabels[platform]}</h3>
                        <span className="text-slate-500 text-sm">({platformContent.length})</span>
                      </div>
                    </div>
                    
                    {/* Content Items */}
                    <div className="p-2 space-y-1 max-h-[600px] overflow-y-auto">
                      {platformContent.length === 0 ? (
                        <div className="text-center py-8 text-slate-500 text-sm">
                          No {platformLabels[platform]} content
                        </div>
                      ) : (
                        platformContent.map(item => {
                          const config = statusConfig[item.status] || statusConfig.draft
                          const isSelected = selectedIds.includes(item.id)

                          return (
                            <motion.div
                              key={item.id}
                              layout
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              onClick={() => setSelectedContent(item)}
                              className={`p-3 rounded-lg cursor-pointer transition-all group ${
                                isSelected 
                                  ? 'bg-cyan-500/10 border border-cyan-500/50' 
                                  : 'hover:bg-slate-800 border border-transparent'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                {/* Selection Checkbox */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    toggleSelection(item.id)
                                  }}
                                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors mt-0.5 shrink-0 ${
                                    isSelected
                                      ? 'bg-cyan-500 border-cyan-500'
                                      : 'border-slate-600 hover:border-slate-500 opacity-0 group-hover:opacity-100'
                                  }`}
                                >
                                  {isSelected && <Check size={10} className="text-black" />}
                                </button>

                                <div className="flex-1 min-w-0">
                                  {/* Title */}
                                  <div className="text-white text-sm font-medium truncate mb-1">
                                    {item.title}
                                  </div>
                                  
                                  {/* Status & Schedule */}
                                  <div className="flex items-center gap-2 text-xs">
                                    <span className={`px-1.5 py-0.5 rounded ${config.bg} ${config.text}`}>
                                      {config.label}
                                    </span>
                                    {item.scheduledFor && (
                                      <span className="text-cyan-400">
                                        {new Date(item.scheduledFor).toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {item.status === 'ready_for_review' && (
                                    <>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleStatusChange(item.id, 'approved')
                                        }}
                                        className="p-1.5 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors"
                                        title="Approve"
                                      >
                                        <Check size={14} />
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleStatusChange(item.id, 'changes_requested')
                                        }}
                                        className="p-1.5 bg-orange-500/20 text-orange-400 rounded hover:bg-orange-500/30 transition-colors"
                                        title="Request Changes"
                                      >
                                        <Edit3 size={14} />
                                      </button>
                                    </>
                                  )}
                                  {item.status === 'approved' && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleStatusChange(item.id, 'published')
                                      }}
                                      className="p-1.5 bg-purple-500/20 text-purple-400 rounded hover:bg-purple-500/30 transition-colors"
                                      title="Publish"
                                    >
                                      <Rocket size={14} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )
                        })
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>

        {/* Bulk Actions */}
        <BulkActions
          selectedIds={selectedIds}
          onClearSelection={() => setSelectedIds([])}
          onActionComplete={fetchData}
        />
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
        onAddComment={handleAddComment}
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

