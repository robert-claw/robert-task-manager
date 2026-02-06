'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sidebar } from '@/components/layout/Sidebar'
import { ToastProvider, useToast } from '@/components/ui/Toast'
import { LoadingPage, LoadingList } from '@/components/ui/Loading'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import {
  PlatformIcon,
  StatusIcon,
  Plus,
  X,
  Check,
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
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    action: 'approve' | 'reject' | 'publish' | null
    contentId: string | null
    contentTitle: string
  }>({ isOpen: false, action: null, contentId: null, contentTitle: '' })
  
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
  
  async function updateStatus(contentId: string, newStatus: string, showToast = true) {
    setActionLoading(contentId)
    try {
      const res = await fetch(`/api/content/${contentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      
      if (!res.ok) throw new Error('Failed to update')
      
      await fetchData()
      
      if (showToast) {
        const statusLabel = statusConfig[newStatus]?.label || newStatus
        toast.success('Status Updated', `Content moved to "${statusLabel}"`)
      }
    } catch (error) {
      console.error('Failed to update status:', error)
      toast.error('Update Failed', 'Could not update content status')
    } finally {
      setActionLoading(null)
    }
  }
  
  function handleConfirmAction() {
    if (!confirmModal.contentId || !confirmModal.action) return
    
    const statusMap = {
      approve: 'approved',
      reject: 'changes_requested',
      publish: 'published',
    }
    
    updateStatus(confirmModal.contentId, statusMap[confirmModal.action])
    setConfirmModal({ isOpen: false, action: null, contentId: null, contentTitle: '' })
    setSelectedContent(null)
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
            
            <button className="px-4 py-2 bg-cyan-500 text-black font-medium rounded-lg hover:bg-cyan-400 transition-colors flex items-center gap-2">
              <Plus size={18} />
              New Content
            </button>
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
          </div>
          
          {/* Content List */}
          <div className="space-y-4">
            {filteredContent.length === 0 ? (
              <div className="bg-slate-800/50 rounded-xl p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center mx-auto mb-4">
                  <FileText size={32} className="text-slate-500" />
                </div>
                <p className="text-slate-400 text-lg mb-2">No content found</p>
                <p className="text-slate-500 text-sm">Try adjusting your filters or create new content</p>
              </div>
            ) : (
              filteredContent.map(item => {
                const config = statusConfig[item.status] || statusConfig.draft
                const StatusIconComponent = config.icon
                const isLoading = actionLoading === item.id
                
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ x: 4 }}
                    onClick={() => setSelectedContent(item)}
                    className={`bg-slate-800/50 border border-slate-700 rounded-xl p-4 cursor-pointer hover:border-cyan-500/30 transition-all ${
                      isLoading ? 'opacity-50 pointer-events-none' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
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
                                setConfirmModal({
                                  isOpen: true,
                                  action: 'approve',
                                  contentId: item.id,
                                  contentTitle: item.title,
                                })
                              }}
                              disabled={isLoading}
                              className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 text-sm flex items-center gap-1 transition-colors"
                            >
                              <Check size={14} />
                              Approve
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setConfirmModal({
                                  isOpen: true,
                                  action: 'reject',
                                  contentId: item.id,
                                  contentTitle: item.title,
                                })
                              }}
                              disabled={isLoading}
                              className="px-3 py-1.5 bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/30 text-sm flex items-center gap-1 transition-colors"
                            >
                              <Edit3 size={14} />
                              Request Changes
                            </button>
                          </>
                        )}
                        {item.status === 'approved' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setConfirmModal({
                                isOpen: true,
                                action: 'publish',
                                contentId: item.id,
                                contentTitle: item.title,
                              })
                            }}
                            disabled={isLoading}
                            className="px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 text-sm flex items-center gap-1 transition-colors"
                          >
                            <Rocket size={14} />
                            Publish
                          </button>
                        )}
                        <ChevronRight size={18} className="text-slate-600" />
                      </div>
                    </div>
                  </motion.div>
                )
              })
            )}
          </div>
        </motion.div>
      </main>
      
      {/* Content Detail Modal */}
      <AnimatePresence>
        {selectedContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedContent(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center">
                      <PlatformIcon platform={selectedContent.platform} size={24} className="text-slate-300" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">{selectedContent.title}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        {(() => {
                          const config = statusConfig[selectedContent.status] || statusConfig.draft
                          const StatusIconComponent = config.icon
                          return (
                            <span className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${config.bg} ${config.text} border ${config.border}`}>
                              <StatusIconComponent size={12} />
                              {config.label}
                            </span>
                          )
                        })()}
                        <span className="text-slate-500 text-sm">
                          {projects.find(p => p.id === selectedContent.projectId)?.name}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedContent(null)}
                    className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
                
                <div className="bg-slate-800 rounded-lg p-4 mb-4">
                  <pre className="text-slate-300 whitespace-pre-wrap font-sans text-sm leading-relaxed">
                    {selectedContent.content}
                  </pre>
                </div>
                
                <div className="flex items-center justify-between text-sm text-slate-500 mb-6">
                  <div className="flex items-center gap-1">
                    <User size={14} />
                    Created by {selectedContent.createdBy} • {new Date(selectedContent.createdAt).toLocaleString()}
                  </div>
                  {selectedContent.scheduledFor && (
                    <div className="text-cyan-400 flex items-center gap-1">
                      <Calendar size={14} />
                      Scheduled: {new Date(selectedContent.scheduledFor).toLocaleString()}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3">
                  {selectedContent.status === 'ready_for_review' && (
                    <>
                      <button
                        onClick={() => {
                          setConfirmModal({
                            isOpen: true,
                            action: 'approve',
                            contentId: selectedContent.id,
                            contentTitle: selectedContent.title,
                          })
                        }}
                        className="flex-1 px-4 py-2.5 bg-green-500 text-black font-medium rounded-lg hover:bg-green-400 flex items-center justify-center gap-2 transition-colors"
                      >
                        <Check size={18} />
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          setConfirmModal({
                            isOpen: true,
                            action: 'reject',
                            contentId: selectedContent.id,
                            contentTitle: selectedContent.title,
                          })
                        }}
                        className="flex-1 px-4 py-2.5 bg-orange-500 text-black font-medium rounded-lg hover:bg-orange-400 flex items-center justify-center gap-2 transition-colors"
                      >
                        <Edit3 size={18} />
                        Request Changes
                      </button>
                    </>
                  )}
                  {selectedContent.status === 'approved' && (
                    <button
                      onClick={() => {
                        setConfirmModal({
                          isOpen: true,
                          action: 'publish',
                          contentId: selectedContent.id,
                          contentTitle: selectedContent.title,
                        })
                      }}
                      className="flex-1 px-4 py-2.5 bg-purple-500 text-black font-medium rounded-lg hover:bg-purple-400 flex items-center justify-center gap-2 transition-colors"
                    >
                      <Rocket size={18} />
                      Publish Now
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, action: null, contentId: null, contentTitle: '' })}
        onConfirm={handleConfirmAction}
        title={
          confirmModal.action === 'approve' ? 'Approve Content' :
          confirmModal.action === 'reject' ? 'Request Changes' :
          confirmModal.action === 'publish' ? 'Publish Content' : ''
        }
        message={
          <div>
            <p className="mb-2">
              {confirmModal.action === 'approve' && 'Are you sure you want to approve this content?'}
              {confirmModal.action === 'reject' && 'Are you sure you want to request changes for this content?'}
              {confirmModal.action === 'publish' && 'Are you sure you want to publish this content now?'}
            </p>
            <p className="text-slate-500 text-sm">"{confirmModal.contentTitle}"</p>
          </div>
        }
        confirmLabel={
          confirmModal.action === 'approve' ? 'Approve' :
          confirmModal.action === 'reject' ? 'Request Changes' :
          'Publish'
        }
        variant={
          confirmModal.action === 'approve' ? 'info' :
          confirmModal.action === 'reject' ? 'warning' :
          'info'
        }
      />
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
