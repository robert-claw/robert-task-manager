'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sidebar } from '@/components/layout/Sidebar'
import { ToastProvider, useToast } from '@/components/ui/Toast'
import { LoadingPage } from '@/components/ui/Loading'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import {
  PlatformIcon,
  FileText,
  Plus,
  X,
  Copy,
  Trash2,
  Hash,
  Star,
  CheckCircle2,
  Info,
} from '@/components/ui/Icons'

interface Project {
  id: string
  name: string
  icon: string
  color: string
}

interface Template {
  id: string
  projectId: string
  name: string
  description: string
  platform: string
  type: string
  structure: string
  variables: { name: string; description: string }[]
  hashtags: string[]
  bestPractices: string[]
  usageCount: number
  createdAt: string
}

interface HashtagGroup {
  id: string
  projectId: string
  name: string
  description: string
  platform: string
  hashtags: string[]
  usageCount: number
}

function TemplatesContent() {
  const [projects, setProjects] = useState<Project[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [hashtagGroups, setHashtagGroups] = useState<HashtagGroup[]>([])
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [activeTab, setActiveTab] = useState<'templates' | 'hashtags'>('templates')
  const [loading, setLoading] = useState(true)
  const [showNewTemplateModal, setShowNewTemplateModal] = useState(false)
  const [showNewHashtagModal, setShowNewHashtagModal] = useState(false)
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; type: 'template' | 'hashtag'; id: string; name: string }>({ isOpen: false, type: 'template', id: '', name: '' })
  
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    platform: 'linkedin',
    type: 'post',
    structure: '',
    hashtags: '',
    bestPractices: '',
  })
  
  const [newHashtag, setNewHashtag] = useState({
    name: '',
    description: '',
    platform: 'linkedin',
    hashtags: '',
  })
  
  const toast = useToast()
  
  const fetchData = useCallback(async () => {
    try {
      const [projectsRes, templatesRes, hashtagsRes] = await Promise.all([
        fetch('/api/projects'),
        fetch(`/api/templates${selectedProject ? `?projectId=${selectedProject}` : ''}`),
        fetch(`/api/hashtags${selectedProject ? `?projectId=${selectedProject}` : ''}`),
      ])
      
      const projectsData = await projectsRes.json()
      const templatesData = await templatesRes.json()
      const hashtagsData = await hashtagsRes.json()
      
      setProjects(projectsData.projects || [])
      setTemplates(templatesData.templates || [])
      setHashtagGroups(hashtagsData.hashtagGroups || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [selectedProject, toast])
  
  useEffect(() => {
    fetchData()
  }, [fetchData])
  
  async function handleCreateTemplate() {
    if (!selectedProject || !newTemplate.name || !newTemplate.structure) {
      toast.error('Please fill in all required fields')
      return
    }
    
    try {
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProject,
          ...newTemplate,
          hashtags: newTemplate.hashtags.split(',').map(h => h.trim()).filter(Boolean),
          bestPractices: newTemplate.bestPractices.split('\n').filter(Boolean),
          variables: [],
        }),
      })
      
      if (!res.ok) throw new Error('Failed to create')
      
      toast.success('Template created')
      setShowNewTemplateModal(false)
      setNewTemplate({ name: '', description: '', platform: 'linkedin', type: 'post', structure: '', hashtags: '', bestPractices: '' })
      fetchData()
    } catch (error) {
      toast.error('Failed to create template')
    }
  }
  
  async function handleCreateHashtagGroup() {
    if (!selectedProject || !newHashtag.name || !newHashtag.hashtags) {
      toast.error('Please fill in all required fields')
      return
    }
    
    try {
      const res = await fetch('/api/hashtags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProject,
          name: newHashtag.name,
          description: newHashtag.description,
          platform: newHashtag.platform,
          hashtags: newHashtag.hashtags.split(',').map(h => h.trim().replace(/^#/, '')).filter(Boolean),
        }),
      })
      
      if (!res.ok) throw new Error('Failed to create')
      
      toast.success('Hashtag group created')
      setShowNewHashtagModal(false)
      setNewHashtag({ name: '', description: '', platform: 'linkedin', hashtags: '' })
      fetchData()
    } catch (error) {
      toast.error('Failed to create hashtag group')
    }
  }
  
  async function handleDelete() {
    try {
      const endpoint = deleteModal.type === 'template' 
        ? `/api/templates/${deleteModal.id}`
        : `/api/hashtags/${deleteModal.id}`
      
      const res = await fetch(endpoint, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      
      toast.success(`${deleteModal.type === 'template' ? 'Template' : 'Hashtag group'} deleted`)
      setDeleteModal({ isOpen: false, type: 'template', id: '', name: '' })
      setSelectedTemplate(null)
      fetchData()
    } catch (error) {
      toast.error('Failed to delete')
    }
  }
  
  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }
  
  if (loading) {
    return <LoadingPage message="Loading templates..." />
  }
  
  const filteredTemplates = selectedProject 
    ? templates.filter(t => t.projectId === selectedProject)
    : templates
  
  const filteredHashtags = selectedProject
    ? hashtagGroups.filter(h => h.projectId === selectedProject)
    : hashtagGroups
  
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
                <FileText size={32} className="text-cyan-400" />
                Content Library
              </h1>
              <p className="text-slate-400">
                Templates and hashtag groups for quick content creation
              </p>
            </div>
            
            <button
              onClick={() => activeTab === 'templates' ? setShowNewTemplateModal(true) : setShowNewHashtagModal(true)}
              disabled={!selectedProject}
              className="px-4 py-2 bg-cyan-500 text-black font-medium rounded-lg hover:bg-cyan-400 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={18} />
              {activeTab === 'templates' ? 'New Template' : 'New Hashtag Group'}
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('templates')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'templates' 
                  ? 'bg-cyan-500 text-black' 
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <FileText size={18} className="inline mr-2" />
              Templates ({filteredTemplates.length})
            </button>
            <button
              onClick={() => setActiveTab('hashtags')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'hashtags' 
                  ? 'bg-cyan-500 text-black' 
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Hash size={18} className="inline mr-2" />
              Hashtag Groups ({filteredHashtags.length})
            </button>
          </div>
          
          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredTemplates.length === 0 ? (
                <div className="col-span-2 bg-slate-800/50 rounded-xl p-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center mx-auto mb-4">
                    <FileText size={32} className="text-slate-500" />
                  </div>
                  <p className="text-slate-400 text-lg mb-2">No templates yet</p>
                  <p className="text-slate-500 text-sm">
                    {selectedProject ? 'Create templates to speed up content creation' : 'Select a project to view templates'}
                  </p>
                </div>
              ) : (
                filteredTemplates.map(template => (
                  <motion.div
                    key={template.id}
                    whileHover={{ y: -2 }}
                    onClick={() => setSelectedTemplate(template)}
                    className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 cursor-pointer hover:border-slate-600"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">
                          <PlatformIcon platform={template.platform} size={20} className="text-slate-300" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">{template.name}</h3>
                          <span className="text-slate-500 text-sm capitalize">{template.type}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-slate-500">
                        <Star size={14} />
                        <span className="text-sm">{template.usageCount}</span>
                      </div>
                    </div>
                    <p className="text-slate-400 text-sm line-clamp-2">{template.description}</p>
                  </motion.div>
                ))
              )}
            </div>
          )}
          
          {/* Hashtags Tab */}
          {activeTab === 'hashtags' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredHashtags.length === 0 ? (
                <div className="col-span-3 bg-slate-800/50 rounded-xl p-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center mx-auto mb-4">
                    <Hash size={32} className="text-slate-500" />
                  </div>
                  <p className="text-slate-400 text-lg mb-2">No hashtag groups yet</p>
                  <p className="text-slate-500 text-sm">
                    {selectedProject ? 'Create hashtag groups for quick insertion' : 'Select a project to view hashtag groups'}
                  </p>
                </div>
              ) : (
                filteredHashtags.map(group => (
                  <motion.div
                    key={group.id}
                    whileHover={{ y: -2 }}
                    className="bg-slate-800/50 border border-slate-700 rounded-xl p-5"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <PlatformIcon platform={group.platform} size={16} className="text-slate-400" />
                        <h3 className="text-white font-semibold">{group.name}</h3>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => copyToClipboard(group.hashtags.map(h => `#${h}`).join(' '))}
                          className="p-1.5 rounded-lg bg-slate-700 text-slate-400 hover:text-white hover:bg-slate-600"
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteModal({ isOpen: true, type: 'hashtag', id: group.id, name: group.name })}
                          className="p-1.5 rounded-lg bg-slate-700 text-slate-400 hover:text-red-400 hover:bg-red-500/20"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <p className="text-slate-500 text-sm mb-3">{group.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {group.hashtags.slice(0, 5).map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded text-xs">
                          #{tag}
                        </span>
                      ))}
                      {group.hashtags.length > 5 && (
                        <span className="px-2 py-0.5 bg-slate-700 text-slate-400 rounded text-xs">
                          +{group.hashtags.length - 5} more
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </motion.div>
      </main>
      
      {/* Template Detail Modal */}
      <AnimatePresence>
        {selectedTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedTemplate(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center">
                      <PlatformIcon platform={selectedTemplate.platform} size={24} className="text-slate-300" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">{selectedTemplate.name}</h2>
                      <span className="text-slate-400 text-sm capitalize">{selectedTemplate.platform} - {selectedTemplate.type}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedTemplate(null)}
                    className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
                  >
                    <X size={24} />
                  </button>
                </div>
                
                <p className="text-slate-400 mb-6">{selectedTemplate.description}</p>
                
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-semibold">Template Structure</h3>
                    <button
                      onClick={() => copyToClipboard(selectedTemplate.structure)}
                      className="px-3 py-1 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 text-sm flex items-center gap-1"
                    >
                      <Copy size={14} />
                      Copy
                    </button>
                  </div>
                  <pre className="bg-slate-800 rounded-lg p-4 text-slate-300 text-sm whitespace-pre-wrap font-mono overflow-x-auto">
                    {selectedTemplate.structure}
                  </pre>
                </div>
                
                {selectedTemplate.hashtags.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white font-semibold">Suggested Hashtags</h3>
                      <button
                        onClick={() => copyToClipboard(selectedTemplate.hashtags.map(h => `#${h}`).join(' '))}
                        className="px-3 py-1 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 text-sm flex items-center gap-1"
                      >
                        <Copy size={14} />
                        Copy
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedTemplate.hashtags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded text-sm">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedTemplate.bestPractices.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                      <Info size={16} />
                      Best Practices
                    </h3>
                    <ul className="space-y-2">
                      {selectedTemplate.bestPractices.map((practice, i) => (
                        <li key={i} className="flex items-start gap-2 text-slate-400 text-sm">
                          <CheckCircle2 size={16} className="text-green-400 shrink-0 mt-0.5" />
                          {practice}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="flex gap-3">
                  <button
                    onClick={() => copyToClipboard(selectedTemplate.structure)}
                    className="flex-1 px-4 py-2.5 bg-cyan-500 text-black font-medium rounded-lg hover:bg-cyan-400 flex items-center justify-center gap-2"
                  >
                    <Copy size={18} />
                    Use Template
                  </button>
                  <button
                    onClick={() => setDeleteModal({ isOpen: true, type: 'template', id: selectedTemplate.id, name: selectedTemplate.name })}
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
      
      {/* New Template Modal */}
      <AnimatePresence>
        {showNewTemplateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setShowNewTemplateModal(false)}
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
                  <h2 className="text-xl font-bold text-white">New Template</h2>
                  <button
                    onClick={() => setShowNewTemplateModal(false)}
                    className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
                  >
                    <X size={24} />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Name</label>
                    <input
                      type="text"
                      value={newTemplate.name}
                      onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="e.g., LinkedIn Thought Leadership"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Description</label>
                    <input
                      type="text"
                      value={newTemplate.description}
                      onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="What's this template for?"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Platform</label>
                      <select
                        value={newTemplate.platform}
                        onChange={(e) => setNewTemplate({ ...newTemplate, platform: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      >
                        <option value="linkedin">LinkedIn</option>
                        <option value="twitter">Twitter</option>
                        <option value="blog">Blog</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Type</label>
                      <select
                        value={newTemplate.type}
                        onChange={(e) => setNewTemplate({ ...newTemplate, type: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      >
                        <option value="post">Post</option>
                        <option value="tweet">Tweet</option>
                        <option value="thread">Thread</option>
                        <option value="article">Article</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Template Structure</label>
                    <textarea
                      value={newTemplate.structure}
                      onChange={(e) => setNewTemplate({ ...newTemplate, structure: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 h-40 resize-none font-mono text-sm"
                      placeholder="Enter your template structure here..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Hashtags (comma-separated)</label>
                    <input
                      type="text"
                      value={newTemplate.hashtags}
                      onChange={(e) => setNewTemplate({ ...newTemplate, hashtags: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="AI, Startups, Tech"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Best Practices (one per line)</label>
                    <textarea
                      value={newTemplate.bestPractices}
                      onChange={(e) => setNewTemplate({ ...newTemplate, bestPractices: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 h-24 resize-none"
                      placeholder="Keep under 1300 characters&#10;Use line breaks&#10;Include a CTA"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowNewTemplateModal(false)}
                    className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateTemplate}
                    className="flex-1 px-4 py-2 bg-cyan-500 text-black font-medium rounded-lg hover:bg-cyan-400"
                  >
                    Create Template
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* New Hashtag Group Modal */}
      <AnimatePresence>
        {showNewHashtagModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setShowNewHashtagModal(false)}
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
                  <h2 className="text-xl font-bold text-white">New Hashtag Group</h2>
                  <button
                    onClick={() => setShowNewHashtagModal(false)}
                    className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
                  >
                    <X size={24} />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Group Name</label>
                    <input
                      type="text"
                      value={newHashtag.name}
                      onChange={(e) => setNewHashtag({ ...newHashtag, name: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="e.g., AI General"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Description</label>
                    <input
                      type="text"
                      value={newHashtag.description}
                      onChange={(e) => setNewHashtag({ ...newHashtag, description: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="When to use these hashtags"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Platform</label>
                    <select
                      value={newHashtag.platform}
                      onChange={(e) => setNewHashtag({ ...newHashtag, platform: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="linkedin">LinkedIn</option>
                      <option value="twitter">Twitter</option>
                      <option value="instagram">Instagram</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Hashtags (comma-separated)</label>
                    <textarea
                      value={newHashtag.hashtags}
                      onChange={(e) => setNewHashtag({ ...newHashtag, hashtags: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 h-24 resize-none"
                      placeholder="#AI, #MachineLearning, #Startups"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowNewHashtagModal(false)}
                    className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateHashtagGroup}
                    className="flex-1 px-4 py-2 bg-cyan-500 text-black font-medium rounded-lg hover:bg-cyan-400"
                  >
                    Create Group
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, type: 'template', id: '', name: '' })}
        onConfirm={handleDelete}
        title={`Delete ${deleteModal.type === 'template' ? 'Template' : 'Hashtag Group'}`}
        message={`Are you sure you want to delete "${deleteModal.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  )
}

export default function TemplatesPage() {
  return (
    <ToastProvider>
      <TemplatesContent />
    </ToastProvider>
  )
}
