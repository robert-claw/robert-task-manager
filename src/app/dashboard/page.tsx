'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Sidebar } from '@/components/layout/Sidebar'
import { ToastProvider, useToast } from '@/components/ui/Toast'
import { LoadingPage } from '@/components/ui/Loading'
import {
  PlatformIcon,
  Bell,
  Calendar,
  FolderOpen,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  TrendingUp,
  Target,
  Zap,
  ChevronRight,
  Check,
  Edit3,
} from '@/components/ui/Icons'
import Link from 'next/link'

interface Project {
  id: string
  name: string
  icon: string
  color: string
  platforms: { platform: string; cadence: string; connectionStatus: string }[]
}

interface ContentItem {
  id: string
  projectId: string
  platform: string
  title: string
  status: string
  scheduledFor?: string
}

const statusConfig: Record<string, { icon: React.ElementType; bg: string; text: string; border: string }> = {
  draft: { icon: Edit3, bg: 'bg-slate-600/20', text: 'text-slate-400', border: 'border-slate-600/50' },
  ready_for_review: { icon: Eye, bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/50' },
  changes_requested: { icon: AlertCircle, bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/50' },
  approved: { icon: CheckCircle2, bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/50' },
  scheduled: { icon: Clock, bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/50' },
  published: { icon: Zap, bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/50' },
}

function DashboardContent() {
  const [projects, setProjects] = useState<Project[]>([])
  const [content, setContent] = useState<ContentItem[]>([])
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const toast = useToast()
  
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [projectsRes, contentRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/content'),
      ])
      
      if (!projectsRes.ok || !contentRes.ok) {
        throw new Error('Failed to fetch data')
      }
      
      const projectsData = await projectsRes.json()
      const contentData = await contentRes.json()
      
      setProjects(projectsData.projects || [])
      setContent(contentData.content || [])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
      toast.error('Failed to load dashboard', 'Please try refreshing the page')
    } finally {
      setLoading(false)
    }
  }, [toast])
  
  useEffect(() => {
    fetchData()
  }, [fetchData])
  
  // Filter content by selected project
  const filteredContent = selectedProject 
    ? content.filter(c => c.projectId === selectedProject)
    : content
  
  // Calculate stats with actionable insights
  const stats = {
    total: filteredContent.length,
    pendingReview: filteredContent.filter(c => c.status === 'ready_for_review').length,
    approved: filteredContent.filter(c => c.status === 'approved').length,
    scheduled: filteredContent.filter(c => c.status === 'scheduled' || c.scheduledFor).length,
    published: filteredContent.filter(c => c.status === 'published').length,
    drafts: filteredContent.filter(c => c.status === 'draft').length,
    changesRequested: filteredContent.filter(c => c.status === 'changes_requested').length,
  }
  
  // Calculate urgency score - higher = more action needed
  const urgencyScore = stats.pendingReview * 3 + stats.changesRequested * 2 + (stats.approved > 0 && stats.scheduled === 0 ? 2 : 0)
  
  // Get content pending review
  const pendingReview = filteredContent.filter(c => c.status === 'ready_for_review')
  
  // Get upcoming scheduled content
  const upcoming = filteredContent
    .filter(c => c.scheduledFor && new Date(c.scheduledFor) > new Date())
    .sort((a, b) => new Date(a.scheduledFor!).getTime() - new Date(b.scheduledFor!).getTime())
    .slice(0, 5)
  
  // Get items that need attention
  const needsAttention = filteredContent.filter(c => 
    c.status === 'changes_requested' || c.status === 'ready_for_review'
  )
  
  if (loading) {
    return <LoadingPage message="Loading dashboard..." />
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
          {/* Header with Action Summary */}
          <div className="mb-8">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Dashboard
                </h1>
                <p className="text-slate-400">
                  {selectedProject 
                    ? `Viewing: ${projects.find(p => p.id === selectedProject)?.name}`
                    : 'All projects overview'
                  }
                </p>
              </div>
              
              {/* Quick Action Indicator */}
              {urgencyScore > 0 && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-3 flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <Target size={20} className="text-yellow-400" />
                  </div>
                  <div>
                    <div className="text-yellow-400 font-medium text-sm">Action Required</div>
                    <div className="text-slate-400 text-xs">
                      {needsAttention.length} item{needsAttention.length !== 1 ? 's' : ''} need your attention
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
          
          {/* Stats Grid - Redesigned with actionable metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-slate-800/50 border border-slate-700 rounded-xl p-5"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-slate-400 text-sm">Total Content</div>
                <FolderOpen size={18} className="text-slate-500" />
              </div>
              <div className="text-3xl font-bold text-white">{stats.total}</div>
              <div className="text-xs text-slate-500 mt-1">Across all platforms</div>
            </motion.div>
            
            <Link href="/content?status=ready_for_review">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className={`rounded-xl p-5 cursor-pointer transition-all ${
                  stats.pendingReview > 0 
                    ? 'bg-yellow-500/10 border-2 border-yellow-500/50 ring-2 ring-yellow-500/20' 
                    : 'bg-slate-800/50 border border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={stats.pendingReview > 0 ? 'text-yellow-400 text-sm font-medium' : 'text-slate-400 text-sm'}>
                    Pending Review
                  </div>
                  <Eye size={18} className={stats.pendingReview > 0 ? 'text-yellow-400' : 'text-slate-500'} />
                </div>
                <div className={`text-3xl font-bold ${stats.pendingReview > 0 ? 'text-yellow-400' : 'text-white'}`}>
                  {stats.pendingReview}
                </div>
                {stats.pendingReview > 0 && (
                  <div className="text-xs text-yellow-400/80 mt-1 flex items-center gap-1">
                    Review now <ChevronRight size={12} />
                  </div>
                )}
              </motion.div>
            </Link>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-green-500/10 border border-green-500/30 rounded-xl p-5"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-green-400 text-sm">Approved</div>
                <CheckCircle2 size={18} className="text-green-400" />
              </div>
              <div className="text-3xl font-bold text-green-400">{stats.approved}</div>
              <div className="text-xs text-green-400/70 mt-1">Ready to schedule</div>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-5"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-blue-400 text-sm">Scheduled</div>
                <Clock size={18} className="text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-blue-400">{stats.scheduled}</div>
              <div className="text-xs text-blue-400/70 mt-1">
                {upcoming.length > 0 
                  ? `Next: ${new Date(upcoming[0].scheduledFor!).toLocaleDateString()}` 
                  : 'No upcoming posts'
                }
              </div>
            </motion.div>
          </div>
          
          {/* Secondary Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-800/30 rounded-lg p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center">
                <Edit3 size={16} className="text-slate-400" />
              </div>
              <div>
                <div className="text-lg font-semibold text-white">{stats.drafts}</div>
                <div className="text-xs text-slate-500">Drafts</div>
              </div>
            </div>
            
            {stats.changesRequested > 0 && (
              <div className="bg-orange-500/10 rounded-lg p-4 flex items-center gap-3 border border-orange-500/30">
                <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <AlertCircle size={16} className="text-orange-400" />
                </div>
                <div>
                  <div className="text-lg font-semibold text-orange-400">{stats.changesRequested}</div>
                  <div className="text-xs text-orange-400/70">Changes Requested</div>
                </div>
              </div>
            )}
            
            <div className="bg-purple-500/10 rounded-lg p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Zap size={16} className="text-purple-400" />
              </div>
              <div>
                <div className="text-lg font-semibold text-purple-400">{stats.published}</div>
                <div className="text-xs text-purple-400/70">Published</div>
              </div>
            </div>
            
            <div className="bg-cyan-500/10 rounded-lg p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                <TrendingUp size={16} className="text-cyan-400" />
              </div>
              <div>
                <div className="text-lg font-semibold text-cyan-400">
                  {stats.total > 0 ? Math.round((stats.published / stats.total) * 100) : 0}%
                </div>
                <div className="text-xs text-cyan-400/70">Completion Rate</div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Review - Primary Action */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Bell size={20} className="text-yellow-400" />
                  <h2 className="text-xl font-semibold text-white">
                    Pending Review
                  </h2>
                </div>
                <Link 
                  href="/content?status=ready_for_review"
                  className="text-cyan-400 text-sm hover:underline flex items-center gap-1"
                >
                  View all <ChevronRight size={14} />
                </Link>
              </div>
              
              {pendingReview.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                    <Check size={24} className="text-green-400" />
                  </div>
                  <p className="text-slate-400">All caught up!</p>
                  <p className="text-slate-500 text-sm mt-1">No content pending review</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingReview.slice(0, 5).map(item => (
                    <motion.div
                      key={item.id}
                      whileHover={{ x: 4 }}
                      className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg hover:bg-slate-700 cursor-pointer transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">
                        <PlatformIcon platform={item.platform} size={20} className="text-slate-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium truncate">{item.title}</div>
                        <div className="text-slate-500 text-sm">
                          {projects.find(p => p.id === item.projectId)?.name}
                        </div>
                      </div>
                      <span className="text-xs px-2 py-1 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 opacity-0 group-hover:opacity-100 transition-opacity">
                        Review
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Upcoming Scheduled */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar size={20} className="text-blue-400" />
                  <h2 className="text-xl font-semibold text-white">
                    Upcoming
                  </h2>
                </div>
                <Link 
                  href="/calendar"
                  className="text-cyan-400 text-sm hover:underline flex items-center gap-1"
                >
                  View calendar <ChevronRight size={14} />
                </Link>
              </div>
              
              {upcoming.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center mx-auto mb-3">
                    <Calendar size={24} className="text-slate-500" />
                  </div>
                  <p className="text-slate-400">Nothing scheduled</p>
                  <p className="text-slate-500 text-sm mt-1">Schedule content from the calendar</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcoming.map(item => {
                    const config = statusConfig[item.status] || statusConfig.draft
                    const StatusIcon = config.icon
                    return (
                      <motion.div
                        key={item.id}
                        whileHover={{ x: 4 }}
                        className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg hover:bg-slate-700 cursor-pointer transition-colors"
                      >
                        <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">
                          <PlatformIcon platform={item.platform} size={20} className="text-slate-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-medium truncate">{item.title}</div>
                          <div className="text-slate-500 text-sm flex items-center gap-1">
                            <Clock size={12} />
                            {new Date(item.scheduledFor!).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${config.bg} ${config.text} border ${config.border}`}>
                          <StatusIcon size={12} />
                          {item.status.replace('_', ' ')}
                        </span>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
          
          {/* Projects Overview */}
          <div className="mt-6 bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FolderOpen size={20} className="text-cyan-400" />
                <h2 className="text-xl font-semibold text-white">
                  Projects
                </h2>
              </div>
              <Link 
                href="/projects"
                className="text-cyan-400 text-sm hover:underline flex items-center gap-1"
              >
                Manage <ChevronRight size={14} />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map(project => {
                const projectContent = content.filter(c => c.projectId === project.id)
                const projectPending = projectContent.filter(c => c.status === 'ready_for_review').length
                
                return (
                  <motion.div
                    key={project.id}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => setSelectedProject(project.id)}
                    className={`p-4 bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors border ${
                      selectedProject === project.id ? 'border-cyan-500/50' : 'border-transparent hover:border-cyan-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center text-xl">
                        {project.icon}
                      </div>
                      <div>
                        <div className="text-white font-medium">{project.name}</div>
                        <div className="text-slate-500 text-sm">
                          {projectContent.length} items 
                          {projectPending > 0 && (
                            <span className="text-yellow-400 ml-2">• {projectPending} pending</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {project.platforms.map(p => (
                        <span 
                          key={p.platform}
                          className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${
                            p.connectionStatus === 'connected' 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}
                        >
                          <PlatformIcon platform={p.platform} size={12} />
                          {p.cadence}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ToastProvider>
      <DashboardContent />
    </ToastProvider>
  )
}
