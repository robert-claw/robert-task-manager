'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sidebar } from '@/components/layout/Sidebar'
import { ToastProvider, useToast } from '@/components/ui/Toast'
import { LoadingPage } from '@/components/ui/Loading'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import {
  PlatformIcon,
  Sparkles,
  Plus,
  X,
  Link,
  Tag,
  Trash2,
  ChevronRight,
  ExternalLink,
  Rocket,
  Clock,
  CheckCircle2,
  Archive,
  AlertCircle,
  TrendingUp,
  MessageSquare,
  Users,
  Target,
} from '@/components/ui/Icons'

interface Project {
  id: string
  name: string
  icon: string
  color: string
}

interface Idea {
  id: string
  projectId: string
  title: string
  description: string
  source: 'internal' | 'competitor_analysis' | 'industry_trend' | 'user_feedback' | 'other'
  sourceUrl: string | null
  status: 'backlog' | 'in_progress' | 'converted' | 'archived'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  platforms: string[]
  tags: string[]
  notes: string | null
  linkedContentId?: string
  createdAt: string
}

const statusConfig: Record<string, { icon: React.ElementType; bg: string; text: string; label: string }> = {
  backlog: { icon: Clock, bg: 'bg-slate-600/20', text: 'text-slate-300', label: 'Backlog' },
  in_progress: { icon: TrendingUp, bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'In Progress' },
  converted: { icon: CheckCircle2, bg: 'bg-green-500/20', text: 'text-green-400', label: 'Converted' },
  archived: { icon: Archive, bg: 'bg-slate-600/20', text: 'text-slate-500', label: 'Archived' },
}

const priorityConfig: Record<string, { bg: string; text: string }> = {
  low: { bg: 'bg-slate-600/20', text: 'text-slate-400' },
  medium: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  high: { bg: 'bg-orange-500/20', text: 'text-orange-400' },
  urgent: { bg: 'bg-red-500/20', text: 'text-red-400' },
}

const sourceConfig: Record<string, { icon: React.ElementType; label: string }> = {
  internal: { icon: Sparkles, label: 'Internal' },
  competitor_analysis: { icon: Target, label: 'Competitor' },
  industry_trend: { icon: TrendingUp, label: 'Industry Trend' },
  user_feedback: { icon: Users, label: 'User Feedback' },
  other: { icon: MessageSquare, label: 'Other' },
}

function IdeasContent() {
  const [projects, setProjects] = useState<Project[]>([])
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [showNewModal, setShowNewModal] = useState(false)
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; idea: Idea | null }>({ isOpen: false, idea: null })
  
  const [newIdea, setNewIdea] = useState({
    title: '',
    description: '',
    source: 'internal',
    sourceUrl: '',
    priority: 'medium',
    platforms: [] as string[],
    tags: '',
    notes: '',
  })
  
  const toast = useToast()
  
  const fetchData = useCallback(async () => {
    try {
      const [projectsRes, ideasRes] = await Promise.all([
        fetch('/api/projects'),
        fetch(`/api/ideas${selectedProject ? `?projectId=${selectedProject}` : ''}${statusFilter ? `${selectedProject ? '&' : '?'}status=${statusFilter}` : ''}`),
      ])
      
      const projectsData = await projectsRes.json()
      const ideasData = await ideasRes.json()
      
      setProjects(projectsData.projects || [])
      setIdeas(ideasData.ideas || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
      toast.error('Failed to load ideas')
    } finally {
      setLoading(false)
    }
  }, [selectedProject, statusFilter, toast])
  
  useEffect(() => {
    fetchData()
  }, [fetchData])
  
  async function handleCreateIdea() {
    if (!selectedProject || !newIdea.title) {
      toast.error('Please select a project and enter a title')
      return
    }
    
    try {
      const res = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProject,
          title: newIdea.title,
          description: newIdea.description,
          source: newIdea.source,
          sourceUrl: newIdea.sourceUrl || null,
          priority: newIdea.priority,
          platforms: newIdea.platforms,
          tags: newIdea.tags.split(',').map(t => t.trim()).filter(Boolean),
          notes: newIdea.notes || null,
        }),
      })
      
      if (!res.ok) throw new Error('Failed to create')
      
      toast.success('Idea added')
      setShowNewModal(false)
      setNewIdea({ title: '', description: '', source: 'internal', sourceUrl: '', priority: 'medium', platforms: [], tags: '', notes: '' })
      fetchData()
    } catch (error) {
      toast.error('Failed to create idea')
    }
  }
  
  async function handleUpdateStatus(ideaId: string, newStatus: string) {
    try {
      const res = await fetch(`/api/ideas/${ideaId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      
      if (!res.ok) throw new Error('Failed to update')
      
      toast.success('Status updated')
      setSelectedIdea(null)
      fetchData()
    } catch (error) {
      toast.error('Failed to update')
    }
  }
  
  async function handleDeleteIdea() {
    if (!deleteModal.idea) return
    
    try {
      const res = await fetch(`/api/ideas/${deleteModal.idea.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      
      toast.success('Idea deleted')
      setDeleteModal({ isOpen: false, idea: null })
      setSelectedIdea(null)
      fetchData()
    } catch (error) {
      toast.error('Failed to delete')
    }
  }
  
  function togglePlatform(platform: string) {
    setNewIdea(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }))
  }
  
  if (loading) {
    return <LoadingPage message="Loading ideas..." />
  }
  
  const filteredIdeas = selectedProject 
    ? ideas.filter(i => i.projectId === selectedProject)
    : ideas
  
  const backlogIdeas = filteredIdeas.filter(i => i.status === 'backlog')
  const inProgressIdeas = filteredIdeas.filter(i => i.status === 'in_progress')
  const convertedIdeas = filteredIdeas.filter(i => i.status === 'converted')
  
  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Sidebar 
        projects={projects}
        selectedProject={selectedProject}
        onProjectChange={setSelectedProject}
      />
      
      <main className="flex-1 p-6 overflow-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <Sparkles size={32} className="text-cyan-400" />
                Ideas Board
              </h1>
              <p className="text-slate-400">
                {filteredIdeas.length} ideas {selectedProject && `for ${projects.find(p => p.id === selectedProject)?.name}`}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">All Status</option>
                <option value="backlog">Backlog</option>
                <option value="in_progress">In Progress</option>
                <option value="converted">Converted</option>
                <option value="archived">Archived</option>
              </select>
              
              <button
                onClick={() => setShowNewModal(true)}
                disabled={!selectedProject}
                className="px-4 py-2 bg-cyan-500 text-black font-medium rounded-lg hover:bg-cyan-400 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={18} />
                Add Idea
              </button>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-600/10 border border-slate-600/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={18} className="text-slate-400" />
                <span className="text-slate-400 text-sm">Backlog</span>
              </div>
              <div className="text-2xl font-bold text-white">{backlogIdeas.length}</div>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={18} className="text-blue-400" />
                <span className="text-blue-400 text-sm">In Progress</span>
              </div>
              <div className="text-2xl font-bold text-blue-400">{inProgressIdeas.length}</div>
            </div>
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 size={18} className="text-green-400" />
                <span className="text-green-400 text-sm">Converted</span>
              </div>
              <div className="text-2xl font-bold text-green-400">{convertedIdeas.length}</div>
            </div>
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle size={18} className="text-orange-400" />
                <span className="text-orange-400 text-sm">High Priority</span>
              </div>
              <div className="text-2xl font-bold text-orange-400">
                {filteredIdeas.filter(i => i.priority === 'high' || i.priority === 'urgent').length}
              </div>
            </div>
          </div>
          
          {/* Kanban-style columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Backlog */}
            <div className="bg-slate-800/30 rounded-xl p-4">
              <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Clock size={18} className="text-slate-400" />
                Backlog ({backlogIdeas.length})
              </h2>
              <div className="space-y-3">
                {backlogIdeas.map(idea => (
                  <IdeaCard key={idea.id} idea={idea} onClick={() => setSelectedIdea(idea)} />
                ))}
                {backlogIdeas.length === 0 && (
                  <p className="text-slate-500 text-sm text-center py-4">No ideas in backlog</p>
                )}
              </div>
            </div>
            
            {/* In Progress */}
            <div className="bg-slate-800/30 rounded-xl p-4">
              <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                <TrendingUp size={18} className="text-blue-400" />
                In Progress ({inProgressIdeas.length})
              </h2>
              <div className="space-y-3">
                {inProgressIdeas.map(idea => (
                  <IdeaCard key={idea.id} idea={idea} onClick={() => setSelectedIdea(idea)} />
                ))}
                {inProgressIdeas.length === 0 && (
                  <p className="text-slate-500 text-sm text-center py-4">No ideas in progress</p>
                )}
              </div>
            </div>
            
            {/* Converted */}
            <div className="bg-slate-800/30 rounded-xl p-4">
              <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                <CheckCircle2 size={18} className="text-green-400" />
                Converted ({convertedIdeas.length})
              </h2>
              <div className="space-y-3">
                {convertedIdeas.map(idea => (
                  <IdeaCard key={idea.id} idea={idea} onClick={() => setSelectedIdea(idea)} />
                ))}
                {convertedIdeas.length === 0 && (
                  <p className="text-slate-500 text-sm text-center py-4">No converted ideas</p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </main>
      
      {/* Idea Detail Modal */}
      <AnimatePresence>
        {selectedIdea && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedIdea(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-2">{selectedIdea.title}</h2>
                    <div className="flex items-center gap-2">
                      {(() => {
                        const config = statusConfig[selectedIdea.status]
                        const StatusIcon = config.icon
                        return (
                          <span className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${config.bg} ${config.text}`}>
                            <StatusIcon size={12} />
                            {config.label}
                          </span>
                        )
                      })()}
                      <span className={`text-xs px-2 py-1 rounded capitalize ${priorityConfig[selectedIdea.priority].bg} ${priorityConfig[selectedIdea.priority].text}`}>
                        {selectedIdea.priority}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedIdea(null)}
                    className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
                  >
                    <X size={24} />
                  </button>
                </div>
                
                <p className="text-slate-300 mb-6">{selectedIdea.description}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-800 rounded-lg p-4">
                    <div className="text-slate-500 text-sm mb-1">Source</div>
                    <div className="text-white flex items-center gap-2">
                      {(() => {
                        const config = sourceConfig[selectedIdea.source]
                        const SourceIcon = config.icon
                        return (
                          <>
                            <SourceIcon size={16} />
                            {config.label}
                          </>
                        )
                      })()}
                    </div>
                  </div>
                  <div className="bg-slate-800 rounded-lg p-4">
                    <div className="text-slate-500 text-sm mb-1">Target Platforms</div>
                    <div className="flex gap-2">
                      {selectedIdea.platforms.length > 0 ? (
                        selectedIdea.platforms.map(p => (
                          <PlatformIcon key={p} platform={p} size={20} className="text-slate-300" />
                        ))
                      ) : (
                        <span className="text-slate-500">Not specified</span>
                      )}
                    </div>
                  </div>
                </div>
                
                {selectedIdea.sourceUrl && (
                  <div className="mb-6">
                    <div className="text-slate-500 text-sm mb-1">Source URL</div>
                    <a 
                      href={selectedIdea.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      {selectedIdea.sourceUrl}
                      <ExternalLink size={14} />
                    </a>
                  </div>
                )}
                
                {selectedIdea.tags.length > 0 && (
                  <div className="mb-6">
                    <div className="text-slate-500 text-sm mb-2">Tags</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedIdea.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedIdea.notes && (
                  <div className="mb-6">
                    <div className="text-slate-500 text-sm mb-2">Notes</div>
                    <p className="text-slate-300 bg-slate-800 rounded-lg p-3">{selectedIdea.notes}</p>
                  </div>
                )}
                
                <div className="flex gap-3">
                  {selectedIdea.status === 'backlog' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedIdea.id, 'in_progress')}
                      className="flex-1 px-4 py-2.5 bg-blue-500 text-black font-medium rounded-lg hover:bg-blue-400 flex items-center justify-center gap-2"
                    >
                      <TrendingUp size={18} />
                      Start Working
                    </button>
                  )}
                  {selectedIdea.status === 'in_progress' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(selectedIdea.id, 'converted')}
                        className="flex-1 px-4 py-2.5 bg-green-500 text-black font-medium rounded-lg hover:bg-green-400 flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 size={18} />
                        Mark Converted
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(selectedIdea.id, 'backlog')}
                        className="px-4 py-2.5 bg-slate-700 text-white rounded-lg hover:bg-slate-600 flex items-center justify-center gap-2"
                      >
                        <Clock size={18} />
                        Back to Backlog
                      </button>
                    </>
                  )}
                  {selectedIdea.status !== 'archived' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedIdea.id, 'archived')}
                      className="px-4 py-2.5 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 flex items-center justify-center gap-2"
                    >
                      <Archive size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => setDeleteModal({ isOpen: true, idea: selectedIdea })}
                    className="px-4 py-2.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 flex items-center justify-center gap-2"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* New Idea Modal */}
      <AnimatePresence>
        {showNewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setShowNewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Add New Idea</h2>
                  <button
                    onClick={() => setShowNewModal(false)}
                    className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
                  >
                    <X size={24} />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Title</label>
                    <input
                      type="text"
                      value={newIdea.title}
                      onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="Content idea title"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Description</label>
                    <textarea
                      value={newIdea.description}
                      onChange={(e) => setNewIdea({ ...newIdea, description: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 h-24 resize-none"
                      placeholder="Describe the content idea..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Source</label>
                      <select
                        value={newIdea.source}
                        onChange={(e) => setNewIdea({ ...newIdea, source: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      >
                        <option value="internal">Internal</option>
                        <option value="competitor_analysis">Competitor Analysis</option>
                        <option value="industry_trend">Industry Trend</option>
                        <option value="user_feedback">User Feedback</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Priority</label>
                      <select
                        value={newIdea.priority}
                        onChange={(e) => setNewIdea({ ...newIdea, priority: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Source URL (optional)</label>
                    <input
                      type="url"
                      value={newIdea.sourceUrl}
                      onChange={(e) => setNewIdea({ ...newIdea, sourceUrl: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="https://..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Target Platforms</label>
                    <div className="flex gap-2">
                      {['linkedin', 'twitter', 'blog'].map(platform => (
                        <button
                          key={platform}
                          onClick={() => togglePlatform(platform)}
                          className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                            newIdea.platforms.includes(platform)
                              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          <PlatformIcon platform={platform} size={16} />
                          <span className="capitalize text-sm">{platform}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={newIdea.tags}
                      onChange={(e) => setNewIdea({ ...newIdea, tags: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="e.g., tips, technical, how-to"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Notes (optional)</label>
                    <textarea
                      value={newIdea.notes}
                      onChange={(e) => setNewIdea({ ...newIdea, notes: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 h-20 resize-none"
                      placeholder="Additional notes..."
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowNewModal(false)}
                    className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateIdea}
                    className="flex-1 px-4 py-2 bg-cyan-500 text-black font-medium rounded-lg hover:bg-cyan-400"
                  >
                    Add Idea
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, idea: null })}
        onConfirm={handleDeleteIdea}
        title="Delete Idea"
        message={`Are you sure you want to delete "${deleteModal.idea?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  )
}

function IdeaCard({ idea, onClick }: { idea: Idea; onClick: () => void }) {
  const priorityConfig: Record<string, string> = {
    low: 'border-l-slate-500',
    medium: 'border-l-blue-500',
    high: 'border-l-orange-500',
    urgent: 'border-l-red-500',
  }
  
  return (
    <motion.div
      whileHover={{ x: 2 }}
      onClick={onClick}
      className={`bg-slate-800 border border-slate-700 border-l-4 ${priorityConfig[idea.priority]} rounded-lg p-3 cursor-pointer hover:bg-slate-700/50`}
    >
      <h3 className="text-white font-medium text-sm mb-2 line-clamp-2">{idea.title}</h3>
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          {idea.platforms.slice(0, 3).map(p => (
            <PlatformIcon key={p} platform={p} size={14} className="text-slate-400" />
          ))}
        </div>
        <ChevronRight size={14} className="text-slate-600" />
      </div>
    </motion.div>
  )
}

export default function IdeasPage() {
  return (
    <ToastProvider>
      <IdeasContent />
    </ToastProvider>
  )
}
