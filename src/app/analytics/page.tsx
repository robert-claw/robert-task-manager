'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Sidebar } from '@/components/layout/Sidebar'
import { ToastProvider, useToast } from '@/components/ui/Toast'
import { LoadingPage } from '@/components/ui/Loading'
import {
  BarChart3,
  TrendingUp,
  Calendar,
  FileText,
  Clock,
  CheckCircle2,
  RefreshCw,
  Target,
  Zap,
  PlatformIcon,
} from '@/components/ui/Icons'

interface Project {
  id: string
  name: string
  icon: string
  color: string
  platforms: { platform: string; cadence: string }[]
}

interface Analytics {
  lastUpdated: string
  projectMetrics: Record<string, ProjectMetrics>
  globalMetrics: {
    totalContent: number
    totalPublished: number
    totalDrafts: number
    avgContentPerWeek: number
    contentByType: Record<string, number>
  }
}

interface ProjectMetrics {
  postingCadence: Record<string, { target: number; actual: number; period: string }>
  contentMix: Record<string, number>
  statusBreakdown: Record<string, number>
  platformBreakdown: Record<string, number>
  weeklyStats: { week: string; drafted: number; published: number; engagement: number }[]
  topPerformingContent: string[]
  contentVelocity: {
    avgDaysToPublish: number
    avgDaysInReview: number
  }
}

function AnalyticsContent() {
  const [projects, setProjects] = useState<Project[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const toast = useToast()
  
  const fetchData = useCallback(async (refresh = false) => {
    try {
      if (refresh) setRefreshing(true)
      
      const [projectsRes, analyticsRes] = await Promise.all([
        fetch('/api/projects'),
        fetch(`/api/analytics${refresh ? '?refresh=true' : ''}`),
      ])
      
      const projectsData = await projectsRes.json()
      const analyticsData = await analyticsRes.json()
      
      setProjects(projectsData.projects || [])
      setAnalytics(analyticsData.analytics || null)
    } catch (error) {
      console.error('Failed to fetch data:', error)
      toast.error('Failed to load analytics')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [toast])
  
  useEffect(() => {
    fetchData()
  }, [fetchData])
  
  if (loading) {
    return <LoadingPage message="Loading analytics..." />
  }
  
  const globalMetrics = analytics?.globalMetrics
  const projectMetrics = selectedProject && analytics?.projectMetrics[selectedProject]
  const activeProject = projects.find(p => p.id === selectedProject)
  
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
                <BarChart3 size={32} className="text-cyan-400" />
                Analytics
              </h1>
              <p className="text-slate-400">
                {selectedProject ? `Metrics for ${activeProject?.name}` : 'Overview of all projects'}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {analytics?.lastUpdated && (
                <span className="text-slate-500 text-sm">
                  Updated: {new Date(analytics.lastUpdated).toLocaleString()}
                </span>
              )}
              <button
                onClick={() => fetchData(true)}
                disabled={refreshing}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>
          </div>
          
          {/* Global Stats */}
          {!selectedProject && globalMetrics && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                  icon={FileText}
                  label="Total Content"
                  value={globalMetrics.totalContent}
                  color="cyan"
                />
                <StatCard
                  icon={Zap}
                  label="Published"
                  value={globalMetrics.totalPublished}
                  color="purple"
                />
                <StatCard
                  icon={Clock}
                  label="Drafts"
                  value={globalMetrics.totalDrafts}
                  color="slate"
                />
                <StatCard
                  icon={TrendingUp}
                  label="Avg/Week"
                  value={globalMetrics.avgContentPerWeek}
                  color="green"
                />
              </div>
              
              {/* Content by Type */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-white mb-4">Content by Type</h2>
                  <div className="space-y-4">
                    {Object.entries(globalMetrics.contentByType).map(([type, count]) => (
                      <div key={type}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-300 capitalize">{type}s</span>
                          <span className="text-white">{count}</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div 
                            className="bg-cyan-500 h-2 rounded-full"
                            style={{ width: `${(count / globalMetrics.totalContent) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-white mb-4">Project Distribution</h2>
                  <div className="space-y-4">
                    {projects.map(project => {
                      const metrics = analytics?.projectMetrics[project.id]
                      const total = metrics ? Object.values(metrics.statusBreakdown || {}).reduce((a, b) => a + b, 0) : 0
                      return (
                        <div key={project.id}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-300 flex items-center gap-2">
                              <span>{project.icon}</span>
                              {project.name}
                            </span>
                            <span className="text-white">{total}</span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-2">
                            <div 
                              className="bg-cyan-500 h-2 rounded-full"
                              style={{ 
                                width: `${globalMetrics.totalContent > 0 ? (total / globalMetrics.totalContent) * 100 : 0}%`,
                                backgroundColor: project.color
                              }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
          
          {/* Project-specific metrics */}
          {selectedProject && projectMetrics && (
            <>
              {/* Status Breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                {Object.entries(projectMetrics.statusBreakdown || {}).map(([status, count]) => (
                  <div 
                    key={status}
                    className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center"
                  >
                    <div className="text-2xl font-bold text-white mb-1">{count}</div>
                    <div className="text-slate-400 text-sm capitalize">{status.replace(/_/g, ' ')}</div>
                  </div>
                ))}
              </div>
              
              {/* Platform Breakdown & Cadence */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-white mb-4">Platform Breakdown</h2>
                  <div className="space-y-4">
                    {Object.entries(projectMetrics.platformBreakdown || {}).map(([platform, count]) => {
                      const total = Object.values(projectMetrics.platformBreakdown || {}).reduce((a, b) => a + b, 0)
                      return (
                        <div key={platform}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-300 capitalize flex items-center gap-2">
                              <PlatformIcon platform={platform} size={16} />
                              {platform}
                            </span>
                            <span className="text-white">{count} items</span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-2">
                            <div 
                              className="bg-cyan-500 h-2 rounded-full"
                              style={{ width: `${total > 0 ? (count / total) * 100 : 0}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-white mb-4">Posting Cadence Goals</h2>
                  {activeProject?.platforms.map(p => (
                    <div key={p.platform} className="mb-4 last:mb-0">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-300 capitalize flex items-center gap-2">
                          <PlatformIcon platform={p.platform} size={16} />
                          {p.platform}
                        </span>
                        <span className="text-slate-400">{p.cadence}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Target size={16} className="text-cyan-400" />
                        <span className="text-white text-sm">Target: {p.cadence}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Weekly Activity */}
              {projectMetrics.weeklyStats && projectMetrics.weeklyStats.length > 0 && (
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
                  <h2 className="text-lg font-semibold text-white mb-4">Weekly Activity</h2>
                  <div className="grid grid-cols-4 gap-4">
                    {projectMetrics.weeklyStats.map((week, i) => (
                      <div key={week.week} className="text-center">
                        <div className="text-slate-500 text-xs mb-2">{week.week}</div>
                        <div className="bg-slate-700 rounded-lg p-3">
                          <div className="text-xl font-bold text-white mb-1">{week.drafted}</div>
                          <div className="text-slate-400 text-xs">Drafted</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Content Velocity */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Content Velocity</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-slate-400 text-sm mb-1">Avg. Days to Publish</div>
                    <div className="text-3xl font-bold text-white">
                      {projectMetrics.contentVelocity.avgDaysToPublish || '-'}
                    </div>
                    <div className="text-slate-500 text-xs mt-1">From draft to published</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-sm mb-1">Avg. Days in Review</div>
                    <div className="text-3xl font-bold text-white">
                      {projectMetrics.contentVelocity.avgDaysInReview || '-'}
                    </div>
                    <div className="text-slate-500 text-xs mt-1">Time spent in review</div>
                  </div>
                </div>
              </div>
            </>
          )}
          
          {!selectedProject && !globalMetrics && (
            <div className="bg-slate-800/50 rounded-xl p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center mx-auto mb-4">
                <BarChart3 size={32} className="text-slate-500" />
              </div>
              <p className="text-slate-400 text-lg mb-2">No analytics data yet</p>
              <p className="text-slate-500 text-sm">Create some content to see analytics</p>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
}

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ElementType
  label: string
  value: number
  color: 'cyan' | 'purple' | 'slate' | 'green'
}) {
  const colorClasses = {
    cyan: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
    purple: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
    slate: 'bg-slate-600/10 border-slate-600/30 text-slate-400',
    green: 'bg-green-500/10 border-green-500/30 text-green-400',
  }
  
  return (
    <div className={`rounded-xl p-5 border ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm">{label}</span>
        <Icon size={18} />
      </div>
      <div className="text-3xl font-bold text-white">{value}</div>
    </div>
  )
}

export default function AnalyticsPage() {
  return (
    <ToastProvider>
      <AnalyticsContent />
    </ToastProvider>
  )
}
