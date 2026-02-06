'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sidebar } from '@/components/layout/Sidebar'
import { ToastProvider, useToast } from '@/components/ui/Toast'
import { LoadingPage } from '@/components/ui/Loading'
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
  Cog,
  Clock,
  CheckCircle2,
  AlertCircle,
  Settings,
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

function ProjectsPageContent() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const toast = useToast()
  
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
      toast.error('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }
  
  const currentProject = selectedProject 
    ? projects.find(p => p.id === selectedProject) 
    : null
  
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
              {projects.map(project => (
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
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs text-slate-500 uppercase mb-2 flex items-center gap-1">
                        <Target size={12} />
                        Goals
                      </div>
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
                className="bg-slate-800/30 border-2 border-dashed border-slate-700 rounded-xl p-6 flex items-center justify-center cursor-pointer hover:border-cyan-500/50 transition-all min-h-[200px]"
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
                  <button className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors flex items-center gap-2">
                    <Edit3 size={16} />
                    Edit Project
                  </button>
                </div>
                
                {/* Platforms */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Radio size={20} className="text-cyan-400" />
                    Connected Platforms
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentProject.platforms.map(platform => (
                      <div 
                        key={platform.platform}
                        className="bg-slate-800 rounded-lg p-4 border border-slate-700"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">
                              <PlatformIcon platform={platform.platform} size={20} className="text-slate-300" />
                            </div>
                            <span className="text-white font-medium capitalize">{platform.platform}</span>
                          </div>
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
                        </div>
                        {platform.accountName && (
                          <div className="text-sm text-slate-400 mb-2">{platform.accountName}</div>
                        )}
                        {platform.cadence && (
                          <div className="text-sm text-cyan-400 flex items-center gap-1">
                            <Clock size={14} />
                            {platform.cadence}
                          </div>
                        )}
                      </div>
                    ))}
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
                      <ul className="space-y-2">
                        {currentProject.marketingPlan.goals.map((goal, i) => (
                          <li key={i} className="text-slate-300 flex items-start gap-2">
                            <CheckCircle2 size={16} className="text-green-400 mt-0.5 shrink-0" />
                            {goal}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                      <div className="text-sm text-slate-500 uppercase mb-3 flex items-center gap-1">
                        <Users size={14} />
                        Target Audience
                      </div>
                      <p className="text-slate-300">{currentProject.marketingPlan.targetAudience}</p>
                    </div>
                    
                    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                      <div className="text-sm text-slate-500 uppercase mb-3">Content Pillars</div>
                      <div className="flex flex-wrap gap-2">
                        {currentProject.marketingPlan.contentPillars.map((pillar, i) => (
                          <span key={i} className="text-sm bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-lg">
                            {pillar}
                          </span>
                        ))}
                      </div>
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
