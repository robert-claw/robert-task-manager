'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sidebar } from '@/components/layout/Sidebar'

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

const platformIcons: Record<string, string> = {
  linkedin: '💼',
  twitter: '🐦',
  blog: '📝',
  instagram: '📸',
  facebook: '👥',
}

const statusColors: Record<string, string> = {
  draft: 'bg-slate-600 text-slate-200',
  ready_for_review: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50',
  changes_requested: 'bg-orange-500/20 text-orange-400 border border-orange-500/50',
  approved: 'bg-green-500/20 text-green-400 border border-green-500/50',
  scheduled: 'bg-blue-500/20 text-blue-400 border border-blue-500/50',
  published: 'bg-purple-500/20 text-purple-400 border border-purple-500/50',
}

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'draft', label: 'Draft' },
  { value: 'ready_for_review', label: 'Ready for Review' },
  { value: 'changes_requested', label: 'Changes Requested' },
  { value: 'approved', label: 'Approved' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'published', label: 'Published' },
]

const platformOptions = [
  { value: '', label: 'All Platforms' },
  { value: 'linkedin', label: '💼 LinkedIn' },
  { value: 'twitter', label: '🐦 Twitter' },
  { value: 'blog', label: '📝 Blog' },
]

export default function ContentPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [content, setContent] = useState<ContentItem[]>([])
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [platformFilter, setPlatformFilter] = useState('')
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchData()
  }, [selectedProject, statusFilter, platformFilter])
  
  async function fetchData() {
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
    } finally {
      setLoading(false)
    }
  }
  
  async function updateStatus(contentId: string, newStatus: string) {
    try {
      await fetch(`/api/content/${contentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      fetchData()
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-cyan-400 text-xl">Loading...</div>
      </div>
    )
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
              <h1 className="text-3xl font-bold text-white mb-2">Content</h1>
              <p className="text-slate-400">
                {content.length} items
                {selectedProject && ` in ${projects.find(p => p.id === selectedProject)?.name}`}
              </p>
            </div>
            
            <button className="px-4 py-2 bg-cyan-500 text-black font-medium rounded-lg hover:bg-cyan-400 transition-colors">
              + New Content
            </button>
          </div>
          
          {/* Filters */}
          <div className="flex gap-4 mb-6">
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
            {content.length === 0 ? (
              <div className="bg-slate-800/50 rounded-xl p-12 text-center">
                <span className="text-4xl mb-4 block">📝</span>
                <p className="text-slate-400">No content found</p>
              </div>
            ) : (
              content.map(item => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ x: 4 }}
                  onClick={() => setSelectedContent(item)}
                  className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 cursor-pointer hover:border-cyan-500/30 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <span className="text-2xl">{platformIcons[item.platform]}</span>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-white font-medium truncate">{item.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded ${statusColors[item.status]}`}>
                          {item.status.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <p className="text-slate-400 text-sm line-clamp-2 mb-2">
                        {item.content}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>{projects.find(p => p.id === item.projectId)?.icon} {projects.find(p => p.id === item.projectId)?.name}</span>
                        <span>By {item.createdBy}</span>
                        {item.scheduledFor && (
                          <span className="text-cyan-400">
                            📅 {new Date(item.scheduledFor).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {item.status === 'ready_for_review' && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              updateStatus(item.id, 'approved')
                            }}
                            className="px-3 py-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 text-sm"
                          >
                            ✓ Approve
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              updateStatus(item.id, 'changes_requested')
                            }}
                            className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded hover:bg-orange-500/30 text-sm"
                          >
                            ✎ Request Changes
                          </button>
                        </>
                      )}
                      {item.status === 'approved' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            updateStatus(item.id, 'published')
                          }}
                          className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded hover:bg-purple-500/30 text-sm"
                        >
                          🚀 Publish
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
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
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{platformIcons[selectedContent.platform]}</span>
                    <div>
                      <h2 className="text-xl font-bold text-white">{selectedContent.title}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded ${statusColors[selectedContent.status]}`}>
                          {selectedContent.status.replace('_', ' ')}
                        </span>
                        <span className="text-slate-500 text-sm">
                          {projects.find(p => p.id === selectedContent.projectId)?.name}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedContent(null)}
                    className="text-slate-400 hover:text-white text-2xl"
                  >
                    ×
                  </button>
                </div>
                
                <div className="bg-slate-800 rounded-lg p-4 mb-4">
                  <pre className="text-slate-300 whitespace-pre-wrap font-sans text-sm">
                    {selectedContent.content}
                  </pre>
                </div>
                
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <div>
                    Created by {selectedContent.createdBy} • {new Date(selectedContent.createdAt).toLocaleString()}
                  </div>
                  {selectedContent.scheduledFor && (
                    <div className="text-cyan-400">
                      Scheduled: {new Date(selectedContent.scheduledFor).toLocaleString()}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 mt-6">
                  {selectedContent.status === 'ready_for_review' && (
                    <>
                      <button
                        onClick={() => {
                          updateStatus(selectedContent.id, 'approved')
                          setSelectedContent(null)
                        }}
                        className="flex-1 px-4 py-2 bg-green-500 text-black font-medium rounded-lg hover:bg-green-400"
                      >
                        ✓ Approve
                      </button>
                      <button
                        onClick={() => {
                          updateStatus(selectedContent.id, 'changes_requested')
                          setSelectedContent(null)
                        }}
                        className="flex-1 px-4 py-2 bg-orange-500 text-black font-medium rounded-lg hover:bg-orange-400"
                      >
                        ✎ Request Changes
                      </button>
                    </>
                  )}
                  {selectedContent.status === 'approved' && (
                    <button
                      onClick={() => {
                        updateStatus(selectedContent.id, 'published')
                        setSelectedContent(null)
                      }}
                      className="flex-1 px-4 py-2 bg-purple-500 text-black font-medium rounded-lg hover:bg-purple-400"
                    >
                      🚀 Publish Now
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
