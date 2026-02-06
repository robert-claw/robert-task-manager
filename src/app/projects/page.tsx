'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sidebar } from '@/components/layout/Sidebar'

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

const platformIcons: Record<string, string> = {
  linkedin: '💼',
  twitter: '🐦',
  blog: '📝',
  instagram: '📸',
  facebook: '👥',
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchProjects()
  }, [])
  
  async function fetchProjects() {
    try {
      const res = await fetch('/api/projects')
      const data = await res.json()
      setProjects(data.projects || [])
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const currentProject = selectedProject 
    ? projects.find(p => p.id === selectedProject) 
    : null
  
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
              Projects
            </h1>
            <p className="text-slate-400">
              Manage your projects and their marketing configurations
            </p>
          </div>
          
          {!selectedProject ? (
            // Projects List
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map(project => (
                <motion.div
                  key={project.id}
                  whileHover={{ scale: 1.02, y: -4 }}
                  onClick={() => setSelectedProject(project.id)}
                  className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 cursor-pointer hover:border-cyan-500/50 transition-colors"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-4xl">{project.icon}</span>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{project.name}</h3>
                      <p className="text-slate-500 text-sm">{project.description}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-slate-500 uppercase mb-2">Platforms</div>
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
                            {platformIcons[p.platform]} {p.platform}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs text-slate-500 uppercase mb-2">Goals</div>
                      <div className="text-sm text-slate-300">
                        {project.marketingPlan.goals.slice(0, 2).join(' • ')}
                        {project.marketingPlan.goals.length > 2 && ' ...'}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {/* Add New Project Card */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-slate-800/30 border border-dashed border-slate-700 rounded-xl p-6 flex items-center justify-center cursor-pointer hover:border-cyan-500/50 transition-colors min-h-[200px]"
              >
                <div className="text-center">
                  <span className="text-4xl mb-2 block">➕</span>
                  <span className="text-slate-400">Add New Project</span>
                </div>
              </motion.div>
            </div>
          ) : currentProject && (
            // Project Detail View
            <div>
              <button
                onClick={() => setSelectedProject(null)}
                className="text-cyan-400 hover:underline mb-6 flex items-center gap-2"
              >
                ← Back to Projects
              </button>
              
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <span className="text-5xl">{currentProject.icon}</span>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{currentProject.name}</h2>
                      <p className="text-slate-400">{currentProject.description}</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors">
                    Edit Project
                  </button>
                </div>
                
                {/* Platforms */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-white mb-4">📡 Connected Platforms</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentProject.platforms.map(platform => (
                      <div 
                        key={platform.platform}
                        className="bg-slate-800 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{platformIcons[platform.platform]}</span>
                            <span className="text-white font-medium capitalize">{platform.platform}</span>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded ${
                            platform.connectionStatus === 'connected' 
                              ? 'bg-green-500/20 text-green-400' 
                              : platform.connectionStatus === 'pending'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {platform.connectionStatus}
                          </span>
                        </div>
                        {platform.accountName && (
                          <div className="text-sm text-slate-400">{platform.accountName}</div>
                        )}
                        {platform.cadence && (
                          <div className="text-sm text-cyan-400 mt-2">📅 {platform.cadence}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Marketing Plan */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-white mb-4">📋 Marketing Plan</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-800 rounded-lg p-4">
                      <div className="text-sm text-slate-500 uppercase mb-2">Goals</div>
                      <ul className="space-y-2">
                        {currentProject.marketingPlan.goals.map((goal, i) => (
                          <li key={i} className="text-slate-300 flex items-start gap-2">
                            <span className="text-green-400">✓</span>
                            {goal}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="bg-slate-800 rounded-lg p-4">
                      <div className="text-sm text-slate-500 uppercase mb-2">Target Audience</div>
                      <p className="text-slate-300">{currentProject.marketingPlan.targetAudience}</p>
                    </div>
                    
                    <div className="bg-slate-800 rounded-lg p-4">
                      <div className="text-sm text-slate-500 uppercase mb-2">Content Pillars</div>
                      <div className="flex flex-wrap gap-2">
                        {currentProject.marketingPlan.contentPillars.map((pillar, i) => (
                          <span key={i} className="text-sm bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded">
                            {pillar}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {currentProject.marketingPlan.notes && (
                      <div className="bg-slate-800 rounded-lg p-4">
                        <div className="text-sm text-slate-500 uppercase mb-2">Notes</div>
                        <p className="text-slate-300">{currentProject.marketingPlan.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Settings */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">⚙️ Settings</h3>
                  <div className="bg-slate-800 rounded-lg p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-slate-500">Timezone</div>
                      <div className="text-white">{currentProject.settings.timezone}</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-500">Default Assignee</div>
                      <div className="text-white capitalize">{currentProject.settings.defaultAssignee}</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-500">Auto Schedule</div>
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
    </div>
  )
}
