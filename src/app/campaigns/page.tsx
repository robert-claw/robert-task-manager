'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sidebar } from '@/components/layout/Sidebar'
import { ToastProvider, useToast } from '@/components/ui/Toast'
import { LoadingPage } from '@/components/ui/Loading'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import {
  Target,
  Plus,
  X,
  Calendar,
  FileText,
  CheckCircle2,
  Clock,
  Pause,
  Play,
  ChevronRight,
  BarChart3,
  Tag,
  Trash2,
} from '@/components/ui/Icons'

interface Project {
  id: string
  name: string
  icon: string
  color: string
}

interface Campaign {
  id: string
  projectId: string
  name: string
  description: string
  status: 'planned' | 'active' | 'paused' | 'completed'
  color: string
  startDate: string
  endDate: string | null
  goals: { id: string; metric: string; target: number; current: number; unit: string }[]
  contentIds: string[]
  tags: string[]
  createdAt: string
}

const statusConfig: Record<string, { icon: React.ElementType; bg: string; text: string; label: string }> = {
  planned: { icon: Clock, bg: 'bg-slate-600/20', text: 'text-slate-300', label: 'Planned' },
  active: { icon: Play, bg: 'bg-green-500/20', text: 'text-green-400', label: 'Active' },
  paused: { icon: Pause, bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Paused' },
  completed: { icon: CheckCircle2, bg: 'bg-purple-500/20', text: 'text-purple-400', label: 'Completed' },
}

function CampaignsContent() {
  const [projects, setProjects] = useState<Project[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [showNewModal, setShowNewModal] = useState(false)
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; campaign: Campaign | null }>({ isOpen: false, campaign: null })
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    color: '#6366f1',
    tags: '',
  })
  const toast = useToast()
  
  const fetchData = useCallback(async () => {
    try {
      const [projectsRes, campaignsRes] = await Promise.all([
        fetch('/api/projects'),
        fetch(`/api/campaigns${selectedProject ? `?projectId=${selectedProject}` : ''}`),
      ])
      
      const projectsData = await projectsRes.json()
      const campaignsData = await campaignsRes.json()
      
      setProjects(projectsData.projects || [])
      setCampaigns(campaignsData.campaigns || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
      toast.error('Failed to load campaigns')
    } finally {
      setLoading(false)
    }
  }, [selectedProject, toast])
  
  useEffect(() => {
    fetchData()
  }, [fetchData])
  
  async function handleCreateCampaign() {
    if (!selectedProject || !newCampaign.name) {
      toast.error('Please select a project and enter a campaign name')
      return
    }
    
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProject,
          name: newCampaign.name,
          description: newCampaign.description,
          startDate: newCampaign.startDate,
          endDate: newCampaign.endDate || null,
          color: newCampaign.color,
          tags: newCampaign.tags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      })
      
      if (!res.ok) throw new Error('Failed to create campaign')
      
      toast.success('Campaign created successfully')
      setShowNewModal(false)
      setNewCampaign({ name: '', description: '', startDate: new Date().toISOString().split('T')[0], endDate: '', color: '#6366f1', tags: '' })
      fetchData()
    } catch (error) {
      toast.error('Failed to create campaign')
    }
  }
  
  async function handleUpdateStatus(campaignId: string, newStatus: string) {
    try {
      const res = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      
      if (!res.ok) throw new Error('Failed to update')
      
      toast.success('Campaign status updated')
      fetchData()
    } catch (error) {
      toast.error('Failed to update campaign')
    }
  }
  
  async function handleDeleteCampaign() {
    if (!deleteModal.campaign) return
    
    try {
      const res = await fetch(`/api/campaigns/${deleteModal.campaign.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      
      toast.success('Campaign deleted')
      setDeleteModal({ isOpen: false, campaign: null })
      setSelectedCampaign(null)
      fetchData()
    } catch (error) {
      toast.error('Failed to delete campaign')
    }
  }
  
  if (loading) {
    return <LoadingPage message="Loading campaigns..." />
  }
  
  const filteredCampaigns = selectedProject 
    ? campaigns.filter(c => c.projectId === selectedProject)
    : campaigns
  
  const activeCampaigns = filteredCampaigns.filter(c => c.status === 'active')
  const plannedCampaigns = filteredCampaigns.filter(c => c.status === 'planned')
  const completedCampaigns = filteredCampaigns.filter(c => c.status === 'completed' || c.status === 'paused')
  
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
                <Target size={32} className="text-cyan-400" />
                Campaigns
              </h1>
              <p className="text-slate-400">
                {filteredCampaigns.length} campaigns {selectedProject && `in ${projects.find(p => p.id === selectedProject)?.name}`}
              </p>
            </div>
            
            <button
              onClick={() => setShowNewModal(true)}
              disabled={!selectedProject}
              className="px-4 py-2 bg-cyan-500 text-black font-medium rounded-lg hover:bg-cyan-400 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={18} />
              New Campaign
            </button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Play size={18} className="text-green-400" />
                <span className="text-green-400 text-sm">Active</span>
              </div>
              <div className="text-2xl font-bold text-green-400">{activeCampaigns.length}</div>
            </div>
            <div className="bg-slate-600/10 border border-slate-600/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={18} className="text-slate-400" />
                <span className="text-slate-400 text-sm">Planned</span>
              </div>
              <div className="text-2xl font-bold text-slate-300">{plannedCampaigns.length}</div>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 size={18} className="text-purple-400" />
                <span className="text-purple-400 text-sm">Completed</span>
              </div>
              <div className="text-2xl font-bold text-purple-400">{completedCampaigns.length}</div>
            </div>
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText size={18} className="text-cyan-400" />
                <span className="text-cyan-400 text-sm">Total Content</span>
              </div>
              <div className="text-2xl font-bold text-cyan-400">
                {filteredCampaigns.reduce((sum, c) => sum + c.contentIds.length, 0)}
              </div>
            </div>
          </div>
          
          {/* Campaign Sections */}
          {activeCampaigns.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Play size={20} className="text-green-400" />
                Active Campaigns
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {activeCampaigns.map(campaign => (
                  <CampaignCard 
                    key={campaign.id} 
                    campaign={campaign} 
                    project={projects.find(p => p.id === campaign.projectId)}
                    onClick={() => setSelectedCampaign(campaign)}
                    onStatusChange={handleUpdateStatus}
                  />
                ))}
              </div>
            </div>
          )}
          
          {plannedCampaigns.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Clock size={20} className="text-slate-400" />
                Planned Campaigns
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {plannedCampaigns.map(campaign => (
                  <CampaignCard 
                    key={campaign.id} 
                    campaign={campaign} 
                    project={projects.find(p => p.id === campaign.projectId)}
                    onClick={() => setSelectedCampaign(campaign)}
                    onStatusChange={handleUpdateStatus}
                  />
                ))}
              </div>
            </div>
          )}
          
          {completedCampaigns.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <CheckCircle2 size={20} className="text-purple-400" />
                Completed / Paused
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {completedCampaigns.map(campaign => (
                  <CampaignCard 
                    key={campaign.id} 
                    campaign={campaign} 
                    project={projects.find(p => p.id === campaign.projectId)}
                    onClick={() => setSelectedCampaign(campaign)}
                    onStatusChange={handleUpdateStatus}
                  />
                ))}
              </div>
            </div>
          )}
          
          {filteredCampaigns.length === 0 && (
            <div className="bg-slate-800/50 rounded-xl p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center mx-auto mb-4">
                <Target size={32} className="text-slate-500" />
              </div>
              <p className="text-slate-400 text-lg mb-2">No campaigns yet</p>
              <p className="text-slate-500 text-sm">
                {selectedProject ? 'Create your first campaign to organize content around themes and goals' : 'Select a project to view its campaigns'}
              </p>
            </div>
          )}
        </motion.div>
      </main>
      
      {/* Campaign Detail Modal */}
      <AnimatePresence>
        {selectedCampaign && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedCampaign(null)}
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
                    <div className="flex items-center gap-3 mb-2">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: selectedCampaign.color }}
                      />
                      <h2 className="text-2xl font-bold text-white">{selectedCampaign.name}</h2>
                    </div>
                    <p className="text-slate-400">{selectedCampaign.description}</p>
                  </div>
                  <button
                    onClick={() => setSelectedCampaign(null)}
                    className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
                  >
                    <X size={24} />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-800 rounded-lg p-4">
                    <div className="text-slate-500 text-sm mb-1">Status</div>
                    <div className={`flex items-center gap-2 ${statusConfig[selectedCampaign.status].text}`}>
                      {(() => {
                        const Icon = statusConfig[selectedCampaign.status].icon
                        return <Icon size={16} />
                      })()}
                      {statusConfig[selectedCampaign.status].label}
                    </div>
                  </div>
                  <div className="bg-slate-800 rounded-lg p-4">
                    <div className="text-slate-500 text-sm mb-1">Content Items</div>
                    <div className="text-white font-semibold">{selectedCampaign.contentIds.length}</div>
                  </div>
                  <div className="bg-slate-800 rounded-lg p-4">
                    <div className="text-slate-500 text-sm mb-1">Start Date</div>
                    <div className="text-white">{new Date(selectedCampaign.startDate).toLocaleDateString()}</div>
                  </div>
                  <div className="bg-slate-800 rounded-lg p-4">
                    <div className="text-slate-500 text-sm mb-1">End Date</div>
                    <div className="text-white">
                      {selectedCampaign.endDate ? new Date(selectedCampaign.endDate).toLocaleDateString() : 'Ongoing'}
                    </div>
                  </div>
                </div>
                
                {selectedCampaign.goals.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <BarChart3 size={18} />
                      Goals
                    </h3>
                    <div className="space-y-3">
                      {selectedCampaign.goals.map(goal => {
                        const progress = goal.target > 0 ? Math.min((goal.current / goal.target) * 100, 100) : 0
                        return (
                          <div key={goal.id} className="bg-slate-800 rounded-lg p-3">
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-slate-300">{goal.metric.replace(/_/g, ' ')}</span>
                              <span className="text-white">{goal.current} / {goal.target} {goal.unit}</span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-2">
                              <div 
                                className="bg-cyan-500 h-2 rounded-full transition-all"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
                
                {selectedCampaign.tags.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <Tag size={18} />
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedCampaign.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-3">
                  {selectedCampaign.status === 'planned' && (
                    <button
                      onClick={() => {
                        handleUpdateStatus(selectedCampaign.id, 'active')
                        setSelectedCampaign(null)
                      }}
                      className="flex-1 px-4 py-2.5 bg-green-500 text-black font-medium rounded-lg hover:bg-green-400 flex items-center justify-center gap-2"
                    >
                      <Play size={18} />
                      Start Campaign
                    </button>
                  )}
                  {selectedCampaign.status === 'active' && (
                    <>
                      <button
                        onClick={() => {
                          handleUpdateStatus(selectedCampaign.id, 'paused')
                          setSelectedCampaign(null)
                        }}
                        className="flex-1 px-4 py-2.5 bg-yellow-500 text-black font-medium rounded-lg hover:bg-yellow-400 flex items-center justify-center gap-2"
                      >
                        <Pause size={18} />
                        Pause
                      </button>
                      <button
                        onClick={() => {
                          handleUpdateStatus(selectedCampaign.id, 'completed')
                          setSelectedCampaign(null)
                        }}
                        className="flex-1 px-4 py-2.5 bg-purple-500 text-black font-medium rounded-lg hover:bg-purple-400 flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 size={18} />
                        Complete
                      </button>
                    </>
                  )}
                  {selectedCampaign.status === 'paused' && (
                    <button
                      onClick={() => {
                        handleUpdateStatus(selectedCampaign.id, 'active')
                        setSelectedCampaign(null)
                      }}
                      className="flex-1 px-4 py-2.5 bg-green-500 text-black font-medium rounded-lg hover:bg-green-400 flex items-center justify-center gap-2"
                    >
                      <Play size={18} />
                      Resume
                    </button>
                  )}
                  <button
                    onClick={() => setDeleteModal({ isOpen: true, campaign: selectedCampaign })}
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
      
      {/* New Campaign Modal */}
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
              className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">New Campaign</h2>
                  <button
                    onClick={() => setShowNewModal(false)}
                    className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
                  >
                    <X size={24} />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Campaign Name</label>
                    <input
                      type="text"
                      value={newCampaign.name}
                      onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="e.g., Product Launch Q1"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Description</label>
                    <textarea
                      value={newCampaign.description}
                      onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 h-24 resize-none"
                      placeholder="What's this campaign about?"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={newCampaign.startDate}
                        onChange={(e) => setNewCampaign({ ...newCampaign, startDate: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">End Date (optional)</label>
                      <input
                        type="date"
                        value={newCampaign.endDate}
                        onChange={(e) => setNewCampaign({ ...newCampaign, endDate: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Color</label>
                    <div className="flex gap-2">
                      {['#6366f1', '#f59e0b', '#06b6d4', '#10b981', '#ef4444', '#8b5cf6'].map(color => (
                        <button
                          key={color}
                          onClick={() => setNewCampaign({ ...newCampaign, color })}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${newCampaign.color === color ? 'border-white scale-110' : 'border-transparent'}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={newCampaign.tags}
                      onChange={(e) => setNewCampaign({ ...newCampaign, tags: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="e.g., launch, awareness, q1"
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
                    onClick={handleCreateCampaign}
                    className="flex-1 px-4 py-2 bg-cyan-500 text-black font-medium rounded-lg hover:bg-cyan-400"
                  >
                    Create Campaign
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, campaign: null })}
        onConfirm={handleDeleteCampaign}
        title="Delete Campaign"
        message={`Are you sure you want to delete "${deleteModal.campaign?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  )
}

function CampaignCard({ 
  campaign, 
  project, 
  onClick, 
  onStatusChange 
}: { 
  campaign: Campaign
  project?: Project
  onClick: () => void
  onStatusChange: (id: string, status: string) => void
}) {
  const config = statusConfig[campaign.status]
  const StatusIcon = config.icon
  
  const totalGoalProgress = campaign.goals.length > 0
    ? campaign.goals.reduce((sum, g) => sum + (g.target > 0 ? (g.current / g.target) * 100 : 0), 0) / campaign.goals.length
    : 0
  
  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={onClick}
      className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 cursor-pointer hover:border-slate-600 transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: campaign.color }}
          />
          <h3 className="text-white font-semibold">{campaign.name}</h3>
        </div>
        <span className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${config.bg} ${config.text}`}>
          <StatusIcon size={12} />
          {config.label}
        </span>
      </div>
      
      <p className="text-slate-400 text-sm line-clamp-2 mb-4">{campaign.description}</p>
      
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <span className="text-slate-500 flex items-center gap-1">
            <FileText size={14} />
            {campaign.contentIds.length} items
          </span>
          <span className="text-slate-500 flex items-center gap-1">
            <Calendar size={14} />
            {new Date(campaign.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>
        
        {campaign.goals.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-16 bg-slate-700 rounded-full h-1.5">
              <div 
                className="bg-cyan-500 h-1.5 rounded-full"
                style={{ width: `${Math.min(totalGoalProgress, 100)}%` }}
              />
            </div>
            <span className="text-cyan-400 text-xs">{Math.round(totalGoalProgress)}%</span>
          </div>
        )}
        
        <ChevronRight size={16} className="text-slate-600" />
      </div>
    </motion.div>
  )
}

export default function CampaignsPage() {
  return (
    <ToastProvider>
      <CampaignsContent />
    </ToastProvider>
  )
}
