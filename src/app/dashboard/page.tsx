'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sidebar } from '@/components/layout/Sidebar'
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

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [content, setContent] = useState<ContentItem[]>([])
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    async function fetchData() {
      try {
        const [projectsRes, contentRes] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/content'),
        ])
        
        const projectsData = await projectsRes.json()
        const contentData = await contentRes.json()
        
        setProjects(projectsData.projects || [])
        setContent(contentData.content || [])
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])
  
  // Filter content by selected project
  const filteredContent = selectedProject 
    ? content.filter(c => c.projectId === selectedProject)
    : content
  
  // Calculate stats
  const stats = {
    total: filteredContent.length,
    pendingReview: filteredContent.filter(c => c.status === 'ready_for_review').length,
    approved: filteredContent.filter(c => c.status === 'approved').length,
    scheduled: filteredContent.filter(c => c.status === 'scheduled' || c.scheduledFor).length,
    published: filteredContent.filter(c => c.status === 'published').length,
  }
  
  // Get content pending review
  const pendingReview = filteredContent.filter(c => c.status === 'ready_for_review')
  
  // Get upcoming scheduled content
  const upcoming = filteredContent
    .filter(c => c.scheduledFor && new Date(c.scheduledFor) > new Date())
    .sort((a, b) => new Date(a.scheduledFor!).getTime() - new Date(b.scheduledFor!).getTime())
    .slice(0, 5)
  
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
          <div className="mb-8">
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
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-slate-800/50 border border-slate-700 rounded-xl p-6"
            >
              <div className="text-slate-400 text-sm mb-1">Total Content</div>
              <div className="text-3xl font-bold text-white">{stats.total}</div>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6"
            >
              <div className="text-yellow-400 text-sm mb-1">Pending Review</div>
              <div className="text-3xl font-bold text-yellow-400">{stats.pendingReview}</div>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-green-500/10 border border-green-500/30 rounded-xl p-6"
            >
              <div className="text-green-400 text-sm mb-1">Approved</div>
              <div className="text-3xl font-bold text-green-400">{stats.approved}</div>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6"
            >
              <div className="text-blue-400 text-sm mb-1">Scheduled</div>
              <div className="text-3xl font-bold text-blue-400">{stats.scheduled}</div>
            </motion.div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Review */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">
                  🔔 Pending Review
                </h2>
                <Link 
                  href="/content?status=ready_for_review"
                  className="text-cyan-400 text-sm hover:underline"
                >
                  View all →
                </Link>
              </div>
              
              {pendingReview.length === 0 ? (
                <div className="text-slate-500 text-center py-8">
                  No content pending review 🎉
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingReview.slice(0, 5).map(item => (
                    <motion.div
                      key={item.id}
                      whileHover={{ x: 4 }}
                      className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg hover:bg-slate-700 cursor-pointer transition-colors"
                    >
                      <span className="text-xl">{platformIcons[item.platform]}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium truncate">{item.title}</div>
                        <div className="text-slate-500 text-sm">
                          {projects.find(p => p.id === item.projectId)?.name}
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${statusColors[item.status]}`}>
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
                <h2 className="text-xl font-semibold text-white">
                  📅 Upcoming
                </h2>
                <Link 
                  href="/calendar"
                  className="text-cyan-400 text-sm hover:underline"
                >
                  View calendar →
                </Link>
              </div>
              
              {upcoming.length === 0 ? (
                <div className="text-slate-500 text-center py-8">
                  No upcoming content scheduled
                </div>
              ) : (
                <div className="space-y-3">
                  {upcoming.map(item => (
                    <motion.div
                      key={item.id}
                      whileHover={{ x: 4 }}
                      className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg hover:bg-slate-700 cursor-pointer transition-colors"
                    >
                      <span className="text-xl">{platformIcons[item.platform]}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium truncate">{item.title}</div>
                        <div className="text-slate-500 text-sm">
                          {new Date(item.scheduledFor!).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${statusColors[item.status]}`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Projects Overview */}
          <div className="mt-6 bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">
                📁 Projects
              </h2>
              <Link 
                href="/projects"
                className="text-cyan-400 text-sm hover:underline"
              >
                Manage →
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
                    className="p-4 bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors border border-transparent hover:border-cyan-500/30"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{project.icon}</span>
                      <div>
                        <div className="text-white font-medium">{project.name}</div>
                        <div className="text-slate-500 text-sm">
                          {projectContent.length} items • {projectPending} pending
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {project.platforms.map(p => (
                        <span 
                          key={p.platform}
                          className={`text-xs px-2 py-1 rounded ${
                            p.connectionStatus === 'connected' 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}
                        >
                          {platformIcons[p.platform]} {p.cadence}
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
