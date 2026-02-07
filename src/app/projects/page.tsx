'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sidebar } from '@/components/layout/Sidebar'
import { ToastProvider, useToast } from '@/components/ui/Toast'
import { LoadingPage } from '@/components/ui/Loading'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import {
  PlatformIcon,
  FolderOpen,
  ChevronLeft,
  Plus,
  Edit3,
  Radio,
  ClipboardList,
  Target,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Settings,
  X,
  Save,
  Trash2,
  FileText,
  ChevronRight,
  Link,
} from '@/components/ui/Icons'

interface Project {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  color: string
  platforms: PlatformConfig[]
  marketingPlan: MarketingPlan
  settings: ProjectSettings
}

interface PlatformConfig {
  platform: string
  enabled: boolean
  accountId?: string
  accountName?: string
  connectionStatus: string
  cadence?: string
}

interface MarketingPlan {
  goals: string[]
  targetAudience: string
  contentPillars: string[]
  notes?: string
}

interface ProjectSettings {
  timezone: string
  defaultAssignee: string
  autoSchedule: boolean
}

interface ContentStats {
  total: number
  draft: number
  pending: number
  approved: number
  scheduled: number
  published: number
}

const AVAILABLE_PLATFORMS = [
  { id: 'twitter', name: 'Twitter/X', icon: 'twitter' },
  { id: 'linkedin', name: 'LinkedIn', icon: 'linkedin' },
  { id: 'blog', name: 'Blog', icon: 'blog' },
  { id: 'instagram', name: 'Instagram', icon: 'instagram' },
  { id: 'facebook', name: 'Facebook', icon: 'facebook' },
  { id: 'youtube', name: 'YouTube', icon: 'youtube' },
  { id: 'tiktok', name: 'TikTok', icon: 'tiktok' },
  { id: 'nostr', name: 'Nostr', icon: 'nostr' },
]

const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Los_Angeles',
  'America/Chicago',
  'Europe/London',
  'Europe/Paris',
  'Europe/Zurich',
  'Asia/Tokyo',
  'Asia/Singapore',
  'Australia/Sydney',
]

// Modal wrapper with Escape key handling
function Modal({ isOpen, onClose, children, title }: { 
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title: string
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>
      </motion.div>
    </motion.div>
  )
}

// Create/Edit Project Form
function ProjectForm({
  project,
  onSave,
  onCancel,
  loading,
}: {
  project: Partial<Project>
  onSave: (data: Partial<Project>) => void
  onCancel: () => void
  loading: boolean
}) {
  const [form, setForm] = useState<Partial<Project>>({
    name: '',
    slug: '',
    description: '',
    icon: '📁',
    color: '#6b7280',
    platforms: [],
    marketingPlan: {
      goals: [''],
      targetAudience: '',
      contentPillars: [''],
      notes: '',
    },
    settings: {
      timezone: 'UTC',
      defaultAssignee: 'leon',
      autoSchedule: false,
    },
    ...project,
  })

  const updateForm = (updates: Partial<Project>) => {
    setForm(prev => ({ ...prev, ...updates }))
  }

  const updateMarketingPlan = (updates: Partial<MarketingPlan>) => {
    setForm(prev => ({
      ...prev,
      marketingPlan: { ...prev.marketingPlan!, ...updates },
    }))
  }

  const updateSettings = (updates: Partial<ProjectSettings>) => {
    setForm(prev => ({
      ...prev,
      settings: { ...prev.settings!, ...updates },
    }))
  }

  const togglePlatform = (platformId: string) => {
    const existing = form.platforms?.find(p => p.platform === platformId)
    if (existing) {
      updateForm({
        platforms: form.platforms?.filter(p => p.platform !== platformId),
      })
    } else {
      updateForm({
        platforms: [
          ...(form.platforms || []),
          {
            platform: platformId,
            enabled: true,
            connectionStatus: 'pending',
            cadence: '3x/week',
          },
        ],
      })
    }
  }

  const updatePlatformConfig = (platformId: string, updates: Partial<PlatformConfig>) => {
    updateForm({
      platforms: form.platforms?.map(p =>
        p.platform === platformId ? { ...p, ...updates } : p
      ),
    })
  }

  const addGoal = () => {
    updateMarketingPlan({
      goals: [...(form.marketingPlan?.goals || []), ''],
    })
  }

  const updateGoal = (index: number, value: string) => {
    const goals = [...(form.marketingPlan?.goals || [])]
    goals[index] = value
    updateMarketingPlan({ goals })
  }

  const removeGoal = (index: number) => {
    const goals = form.marketingPlan?.goals?.filter((_, i) => i !== index) || []
    updateMarketingPlan({ goals: goals.length ? goals : [''] })
  }

  const addPillar = () => {
    updateMarketingPlan({
      contentPillars: [...(form.marketingPlan?.contentPillars || []), ''],
    })
  }

  const updatePillar = (index: number, value: string) => {
    const pillars = [...(form.marketingPlan?.contentPillars || [])]
    pillars[index] = value
    updateMarketingPlan({ contentPillars: pillars })
  }

  const removePillar = (index: number) => {
    const pillars = form.marketingPlan?.contentPillars?.filter((_, i) => i !== index) || []
    updateMarketingPlan({ contentPillars: pillars.length ? pillars : [''] })
  }

  const handleSubmit = () => {
    // Filter out empty goals and pillars
    const cleanedForm = {
      ...form,
      marketingPlan: {
        ...form.marketingPlan!,
        goals: form.marketingPlan?.goals?.filter(g => g.trim()) || [],
        contentPillars: form.marketingPlan?.contentPillars?.filter(p => p.trim()) || [],
      },
    }
    onSave(cleanedForm)
  }

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-slate-400 uppercase flex items-center gap-2">
          <FolderOpen size={14} />
          Basic Information
        </h4>
        <div className="grid grid-cols-[auto_1fr] gap-4 items-start">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Icon</label>
            <input
              type="text"
              value={form.icon || ''}
              onChange={(e) => updateForm({ icon: e.target.value })}
              className="w-16 h-16 bg-slate-800 border border-slate-600 rounded-xl text-center text-3xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
              maxLength={2}
            />
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Project Name *</label>
              <input
                type="text"
                value={form.name || ''}
                onChange={(e) => updateForm({ name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="My Project"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Description</label>
              <input
                type="text"
                value={form.description || ''}
                onChange={(e) => updateForm({ description: e.target.value })}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="A brief description..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Platforms */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-slate-400 uppercase flex items-center gap-2">
          <Radio size={14} />
          Social Platforms
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {AVAILABLE_PLATFORMS.map(platform => {
            const config = form.platforms?.find(p => p.platform === platform.id)
            const isEnabled = !!config

            return (
              <div
                key={platform.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  isEnabled
                    ? 'bg-cyan-500/10 border-cyan-500/50'
                    : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                }`}
                onClick={() => togglePlatform(platform.id)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isEnabled ? 'bg-cyan-500/20' : 'bg-slate-700'
                  }`}>
                    <PlatformIcon platform={platform.id} size={20} className={isEnabled ? 'text-cyan-400' : 'text-slate-400'} />
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-medium">{platform.name}</div>
                    {isEnabled && (
                      <input
                        type="text"
                        value={config?.accountName || ''}
                        onChange={(e) => {
                          e.stopPropagation()
                          updatePlatformConfig(platform.id, { accountName: e.target.value })
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full bg-transparent text-xs text-cyan-400 focus:outline-none mt-1"
                        placeholder="@account or URL"
                      />
                    )}
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isEnabled ? 'border-cyan-500 bg-cyan-500' : 'border-slate-600'
                  }`}>
                    {isEnabled && <CheckCircle2 size={12} className="text-black" />}
                  </div>
                </div>
                {isEnabled && (
                  <div className="mt-3 pt-3 border-t border-slate-700/50">
                    <label className="block text-xs text-slate-500 mb-1">Posting Cadence</label>
                    <select
                      value={config?.cadence || '3x/week'}
                      onChange={(e) => {
                        e.stopPropagation()
                        updatePlatformConfig(platform.id, { cadence: e.target.value })
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    >
                      <option value="daily">Daily</option>
                      <option value="5x/week">5x per week</option>
                      <option value="3x/week">3x per week</option>
                      <option value="2x/week">2x per week</option>
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Bi-weekly</option>
                    </select>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Marketing Plan */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-slate-400 uppercase flex items-center gap-2">
          <Target size={14} />
          Marketing Plan
        </h4>
        
        <div>
          <label className="block text-xs text-slate-500 mb-2">Goals</label>
          <div className="space-y-2">
            {form.marketingPlan?.goals?.map((goal, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => updateGoal(i, e.target.value)}
                  className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="e.g., Increase brand awareness"
                />
                <button
                  onClick={() => removeGoal(i)}
                  className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            <button
              onClick={addGoal}
              className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <Plus size={14} /> Add Goal
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-500 mb-1">Target Audience</label>
          <textarea
            value={form.marketingPlan?.targetAudience || ''}
            onChange={(e) => updateMarketingPlan({ targetAudience: e.target.value })}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
            rows={2}
            placeholder="Describe your target audience..."
          />
        </div>

        <div>
          <label className="block text-xs text-slate-500 mb-2">Content Pillars</label>
          <div className="space-y-2">
            {form.marketingPlan?.contentPillars?.map((pillar, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={pillar}
                  onChange={(e) => updatePillar(i, e.target.value)}
                  className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="e.g., Industry insights"
                />
                <button
                  onClick={() => removePillar(i)}
                  className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            <button
              onClick={addPillar}
              className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <Plus size={14} /> Add Pillar
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-500 mb-1">Notes</label>
          <textarea
            value={form.marketingPlan?.notes || ''}
            onChange={(e) => updateMarketingPlan({ notes: e.target.value })}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
            rows={2}
            placeholder="Additional notes..."
          />
        </div>
      </div>

      {/* Settings */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-slate-400 uppercase flex items-center gap-2">
          <Settings size={14} />
          Settings
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Timezone</label>
            <select
              value={form.settings?.timezone || 'UTC'}
              onChange={(e) => updateSettings({ timezone: e.target.value })}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              {TIMEZONES.map(tz => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Default Assignee</label>
            <input
              type="text"
              value={form.settings?.defaultAssignee || ''}
              onChange={(e) => updateSettings({ defaultAssignee: e.target.value })}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            className={`w-10 h-6 rounded-full transition-colors relative ${
              form.settings?.autoSchedule ? 'bg-cyan-500' : 'bg-slate-600'
            }`}
            onClick={() => updateSettings({ autoSchedule: !form.settings?.autoSchedule })}
          >
            <div
              className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                form.settings?.autoSchedule ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </div>
          <span className="text-white">Auto-schedule approved content</span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t border-slate-700">
        <button
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading || !form.name}
          className="px-4 py-2 bg-cyan-500 text-black font-medium rounded-lg hover:bg-cyan-400 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <Save size={16} />
          {loading ? 'Saving...' : 'Save Project'}
        </button>
      </div>
    </div>
  )
}

function ProjectsPageContent() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [contentStats, setContentStats] = useState<Record<string, ContentStats>>({})
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const toast = useToast()

  const fetchProjects = useCallback(async () => {
    try {
      const [projectsRes, contentRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/content'),
      ])

      const projectsData = await projectsRes.json()
      const contentData = await contentRes.json()

      setProjects(projectsData.projects || [])

      const stats: Record<string, ContentStats> = {}
      const content = contentData.content || []

      for (const project of projectsData.projects || []) {
        const projectContent = content.filter((c: { projectId: string }) => c.projectId === project.id)
        stats[project.id] = {
          total: projectContent.length,
          draft: projectContent.filter((c: { status: string }) => c.status === 'draft').length,
          pending: projectContent.filter((c: { status: string }) => c.status === 'ready_for_review').length,
          approved: projectContent.filter((c: { status: string }) => c.status === 'approved').length,
          scheduled: projectContent.filter((c: { status: string }) => c.status === 'scheduled').length,
          published: projectContent.filter((c: { status: string }) => c.status === 'published').length,
        }
      }
      setContentStats(stats)
    } catch (error) {
      console.error('Failed to fetch projects:', error)
      toast.error('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const currentProject = selectedProject ? projects.find(p => p.id === selectedProject) : null

  const handleCreateProject = async (data: Partial<Project>) => {
    setSaving(true)
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) throw new Error('Failed to create')

      toast.success('Project Created')
      setShowCreateModal(false)
      await fetchProjects()
    } catch (error) {
      toast.error('Failed to create project')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateProject = async (data: Partial<Project>) => {
    if (!currentProject) return
    setSaving(true)
    try {
      const res = await fetch(`/api/projects/${currentProject.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) throw new Error('Failed to update')

      toast.success('Project Updated')
      setShowEditModal(false)
      await fetchProjects()
    } catch (error) {
      toast.error('Failed to update project')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteProject = async () => {
    if (!currentProject) return

    try {
      const res = await fetch(`/api/projects/${currentProject.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete')

      toast.success('Project Deleted')
      setSelectedProject(null)
      setShowDeleteConfirm(false)
      await fetchProjects()
    } catch (error) {
      toast.error('Failed to delete project')
    }
  }

  if (loading) {
    return <LoadingPage message="Loading projects..." />
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <FolderOpen size={32} className="text-cyan-400" />
              Projects
            </h1>
            <p className="text-slate-400">
              Manage your projects and their marketing configurations
            </p>
          </div>

          {!selectedProject ? (
            // Projects List
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map(project => {
                const stats = contentStats[project.id] || { total: 0, draft: 0, pending: 0, approved: 0, scheduled: 0, published: 0 }

                return (
                  <motion.div
                    key={project.id}
                    whileHover={{ scale: 1.02, y: -4 }}
                    onClick={() => setSelectedProject(project.id)}
                    className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 cursor-pointer hover:border-cyan-500/50 transition-all"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 rounded-xl bg-slate-700 flex items-center justify-center text-3xl">
                        {project.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white">{project.name}</h3>
                        <p className="text-slate-500 text-sm">{project.description}</p>
                      </div>
                    </div>

                    {/* Content Stats */}
                    <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-slate-800/50 rounded-lg">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-white">{stats.total}</div>
                        <div className="text-xs text-slate-500">Total</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-yellow-400">{stats.pending}</div>
                        <div className="text-xs text-slate-500">Pending</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-green-400">{stats.published}</div>
                        <div className="text-xs text-slate-500">Published</div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="text-xs text-slate-500 uppercase mb-2 flex items-center gap-1">
                          <Radio size={12} />
                          Platforms
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {project.platforms.map(p => (
                            <span
                              key={p.platform}
                              className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${
                                p.connectionStatus === 'connected'
                                  ? 'bg-green-500/20 text-green-400'
                                  : p.connectionStatus === 'pending'
                                  ? 'bg-yellow-500/20 text-yellow-400'
                                  : 'bg-slate-700 text-slate-400'
                              }`}
                            >
                              <PlatformIcon platform={p.platform} size={12} />
                              {p.platform}
                            </span>
                          ))}
                          {project.platforms.length === 0 && (
                            <span className="text-xs text-slate-500">No platforms configured</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-slate-500 uppercase mb-2 flex items-center gap-1">
                          <Target size={12} />
                          Goals
                        </div>
                        <div className="text-sm text-slate-300">
                          {project.marketingPlan.goals.length > 0
                            ? project.marketingPlan.goals.slice(0, 2).join(' • ') + (project.marketingPlan.goals.length > 2 ? ' ...' : '')
                            : 'No goals set'}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-700 flex items-center justify-between text-xs text-slate-500">
                      <span>Click to view details</span>
                      <ChevronRight size={14} />
                    </div>
                  </motion.div>
                )
              })}

              {/* Add New Project Card */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                onClick={() => setShowCreateModal(true)}
                className="bg-slate-800/30 border-2 border-dashed border-slate-700 rounded-xl p-6 flex items-center justify-center cursor-pointer hover:border-cyan-500/50 hover:bg-slate-800/50 transition-all min-h-[300px]"
              >
                <div className="text-center">
                  <div className="w-14 h-14 rounded-xl bg-slate-800 flex items-center justify-center mx-auto mb-3">
                    <Plus size={28} className="text-slate-400" />
                  </div>
                  <span className="text-slate-400">Add New Project</span>
                </div>
              </motion.div>
            </div>
          ) : currentProject && (
            // Project Detail View
            <div>
              <button
                onClick={() => setSelectedProject(null)}
                className="text-cyan-400 hover:text-cyan-300 mb-6 flex items-center gap-2 transition-colors"
              >
                <ChevronLeft size={20} />
                Back to Projects
              </button>

              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-slate-700 flex items-center justify-center text-4xl">
                      {currentProject.icon}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{currentProject.name}</h2>
                      <p className="text-slate-400">{currentProject.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`/projects/${currentProject.id}/settings`}
                      className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors flex items-center gap-2"
                    >
                      <Settings size={16} />
                      Connections
                    </a>
                    <button
                      onClick={() => setShowEditModal(true)}
                      className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors flex items-center gap-2"
                    >
                      <Edit3 size={16} />
                      Edit Project
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors flex items-center gap-2"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Content Stats Bar */}
                {contentStats[currentProject.id] && (
                  <div className="grid grid-cols-5 gap-4 mb-8 p-4 bg-slate-800/50 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{contentStats[currentProject.id].total}</div>
                      <div className="text-xs text-slate-400 flex items-center justify-center gap-1">
                        <FileText size={12} /> Total
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-slate-400">{contentStats[currentProject.id].draft}</div>
                      <div className="text-xs text-slate-400 flex items-center justify-center gap-1">
                        <Edit3 size={12} /> Drafts
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-400">{contentStats[currentProject.id].pending}</div>
                      <div className="text-xs text-yellow-400/70 flex items-center justify-center gap-1">
                        <AlertCircle size={12} /> Pending
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">{contentStats[currentProject.id].scheduled}</div>
                      <div className="text-xs text-blue-400/70 flex items-center justify-center gap-1">
                        <Clock size={12} /> Scheduled
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">{contentStats[currentProject.id].published}</div>
                      <div className="text-xs text-green-400/70 flex items-center justify-center gap-1">
                        <CheckCircle2 size={12} /> Published
                      </div>
                    </div>
                  </div>
                )}

                {/* Platforms */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Radio size={20} className="text-cyan-400" />
                    Connected Platforms
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentProject.platforms.length > 0 ? currentProject.platforms.map(platform => (
                      <motion.div
                        key={platform.platform}
                        whileHover={{ scale: 1.02 }}
                        className="bg-slate-800 rounded-lg p-4 border border-slate-700"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">
                              <PlatformIcon platform={platform.platform} size={20} className="text-slate-300" />
                            </div>
                            <span className="text-white font-medium capitalize">{platform.platform}</span>
                          </div>
                          {platform.connectionStatus !== 'connected' && platform.platform !== 'blog' ? (
                            <a
                              href={`/projects/${currentProject.id}/settings`}
                              className="text-xs px-2 py-1 rounded flex items-center gap-1 bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition-colors"
                            >
                              <AlertCircle size={12} />
                              Connect
                            </a>
                          ) : (
                          <span className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${
                            platform.connectionStatus === 'connected'
                              ? 'bg-green-500/20 text-green-400'
                              : platform.connectionStatus === 'pending'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {platform.connectionStatus === 'connected' ? (
                              <CheckCircle2 size={12} />
                            ) : platform.connectionStatus === 'pending' ? (
                              <Clock size={12} />
                            ) : (
                              <AlertCircle size={12} />
                            )}
                            {platform.connectionStatus}
                          </span>
                          )}
                        </div>
                        {platform.accountName && (
                          <div className="text-sm text-slate-400 mb-2 flex items-center gap-1">
                            <Link size={12} />
                            {platform.accountName}
                          </div>
                        )}
                        {platform.cadence && (
                          <div className="text-sm text-cyan-400 flex items-center gap-1">
                            <Clock size={14} />
                            {platform.cadence}
                          </div>
                        )}
                      </motion.div>
                    )) : (
                      <div className="col-span-full text-center py-8 text-slate-500">
                        No platforms configured. <button onClick={() => setShowEditModal(true)} className="text-cyan-400 hover:underline">Add platforms</button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Marketing Plan */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <ClipboardList size={20} className="text-cyan-400" />
                    Marketing Plan
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                      <div className="text-sm text-slate-500 uppercase mb-3 flex items-center gap-1">
                        <Target size={14} />
                        Goals
                      </div>
                      {currentProject.marketingPlan.goals.length > 0 ? (
                        <ul className="space-y-2">
                          {currentProject.marketingPlan.goals.map((goal, i) => (
                            <li key={i} className="text-slate-300 flex items-start gap-2">
                              <CheckCircle2 size={16} className="text-green-400 mt-0.5 shrink-0" />
                              {goal}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-slate-500 text-sm">No goals set</p>
                      )}
                    </div>

                    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                      <div className="text-sm text-slate-500 uppercase mb-3 flex items-center gap-1">
                        <Users size={14} />
                        Target Audience
                      </div>
                      <p className="text-slate-300">
                        {currentProject.marketingPlan.targetAudience || <span className="text-slate-500">Not defined</span>}
                      </p>
                    </div>

                    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                      <div className="text-sm text-slate-500 uppercase mb-3">Content Pillars</div>
                      {currentProject.marketingPlan.contentPillars.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {currentProject.marketingPlan.contentPillars.map((pillar, i) => (
                            <span key={i} className="text-sm bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-lg">
                              {pillar}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-500 text-sm">No pillars defined</p>
                      )}
                    </div>

                    {currentProject.marketingPlan.notes && (
                      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                        <div className="text-sm text-slate-500 uppercase mb-3">Notes</div>
                        <p className="text-slate-300">{currentProject.marketingPlan.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Settings */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Settings size={20} className="text-cyan-400" />
                    Settings
                  </h3>
                  <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <div className="text-sm text-slate-500 mb-1 flex items-center gap-1">
                        <Clock size={12} />
                        Timezone
                      </div>
                      <div className="text-white">{currentProject.settings.timezone}</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-500 mb-1">Default Assignee</div>
                      <div className="text-white capitalize">{currentProject.settings.defaultAssignee}</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-500 mb-1">Auto Schedule</div>
                      <div className={currentProject.settings.autoSchedule ? 'text-green-400' : 'text-slate-400'}>
                        {currentProject.settings.autoSchedule ? 'Enabled' : 'Disabled'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </main>

      {/* Create Project Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Project">
            <ProjectForm
              project={{}}
              onSave={handleCreateProject}
              onCancel={() => setShowCreateModal(false)}
              loading={saving}
            />
          </Modal>
        )}
      </AnimatePresence>

      {/* Edit Project Modal */}
      <AnimatePresence>
        {showEditModal && currentProject && (
          <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Project">
            <ProjectForm
              project={currentProject}
              onSave={handleUpdateProject}
              onCancel={() => setShowEditModal(false)}
              loading={saving}
            />
          </Modal>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteProject}
        title="Delete Project"
        message={
          <div>
            <p className="mb-2">Are you sure you want to delete this project?</p>
            <p className="text-red-400 text-sm">This will also delete all associated content. This action cannot be undone.</p>
          </div>
        }
        confirmLabel="Delete Project"
        variant="danger"
      />
    </div>
  )
}

export default function ProjectsPage() {
  return (
    <ToastProvider>
      <ProjectsPageContent />
    </ToastProvider>
  )
}
