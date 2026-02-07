'use client'

import { useState, useEffect } from 'react'
import { ArrowRight, TrendingUp, Users, Target, Plus, X } from 'lucide-react'
import { ContentItem, FunnelStage, Project } from '@/lib/types'
import { FUNNEL_STAGE_COLORS, FUNNEL_STAGE_LABELS, getStrategyDefinition } from '@/lib/funnel-strategies'
import { Sidebar } from '@/components/layout/Sidebar'
import Link from 'next/link'

export default function FunnelsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [content, setContent] = useState<ContentItem[]>([])
  const [selectedProject, setSelectedProject] = useState<string>('dandelion-labs')
  const [selectedFunnel, setSelectedFunnel] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
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

  const projectContent = content.filter((c) => c.projectId === selectedProject)
  const funnelContent = {
    TOFU: projectContent.filter((c) => c.funnelStage === 'TOFU'),
    MOFU: projectContent.filter((c) => c.funnelStage === 'MOFU'),
    BOFU: projectContent.filter((c) => c.funnelStage === 'BOFU'),
  }

  // Find all unique funnels (content chains that lead to conversion)
  const detectFunnels = () => {
    const funnels: { id: string; stages: ContentItem[][] }[] = []
    const processed = new Set<string>()

    // Start from BOFU content and work backwards
    funnelContent.BOFU.forEach((bofu) => {
      if (processed.has(bofu.id)) return

      const funnel: ContentItem[][] = [[], [], [bofu]]
      processed.add(bofu.id)

      // Find content that leads to this BOFU
      const findLeadingContent = (target: ContentItem, stage: FunnelStage) => {
        const stageContent = stage === 'TOFU' ? funnelContent.TOFU : funnelContent.MOFU
        return stageContent.filter((c) =>
          c.linkedContent?.some((link) => link.contentId === target.id && link.linkType === 'leads_to')
        )
      }

      // Get MOFU content leading to BOFU
      const mofuLeaders = findLeadingContent(bofu, 'MOFU')
      if (mofuLeaders.length > 0) {
        funnel[1] = mofuLeaders
        mofuLeaders.forEach((m) => processed.add(m.id))

        // Get TOFU content leading to MOFU
        mofuLeaders.forEach((mofu) => {
          const tofuLeaders = findLeadingContent(mofu, 'TOFU')
          funnel[0].push(...tofuLeaders)
          tofuLeaders.forEach((t) => processed.add(t.id))
        })
      }

      if (funnel[0].length > 0 || funnel[1].length > 0) {
        funnels.push({ id: bofu.id, stages: funnel })
      }
    })

    return funnels
  }

  const funnels = detectFunnels()

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-xl">Loading funnels...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Sidebar
        projects={projects}
        selectedProject={selectedProject}
        onProjectChange={setSelectedProject}
        onCreateProject={() => {}}
      />

      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Content Funnels</h1>
              <p className="text-slate-400">Visualize conversion paths from awareness to booking</p>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-blue-400" />
                <span className="text-sm text-slate-400">TOFU Content</span>
              </div>
              <div className="text-3xl font-bold text-white">{funnelContent.TOFU.length}</div>
              <div className="text-sm text-slate-400 mt-1">Awareness posts</div>
            </div>
            <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-amber-400" />
                <span className="text-sm text-slate-400">MOFU Content</span>
              </div>
              <div className="text-3xl font-bold text-white">{funnelContent.MOFU.length}</div>
              <div className="text-sm text-slate-400 mt-1">Consideration posts</div>
            </div>
            <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-5 h-5 text-green-400" />
                <span className="text-sm text-slate-400">BOFU Content</span>
              </div>
              <div className="text-3xl font-bold text-white">{funnelContent.BOFU.length}</div>
              <div className="text-sm text-slate-400 mt-1">Conversion posts</div>
            </div>
          </div>

          {/* Detected Funnels */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Detected Funnels</h2>
            <p className="text-slate-400 mb-6">
              Content chains that lead from awareness to conversion
            </p>

            {funnels.length === 0 ? (
              <div className="bg-slate-900 border border-slate-700 rounded-xl p-12 text-center">
                <Target className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                <h3 className="text-xl font-semibold text-white mb-2">No funnels detected yet</h3>
                <p className="text-slate-400 mb-6">
                  Link your content together to create conversion funnels
                </p>
                <Link
                  href="/content"
                  className="inline-block px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
                >
                  Start Creating Content
                </Link>
              </div>
            ) : (
              <div className="space-y-8">
                {funnels.map((funnel, idx) => (
                  <FunnelVisualization key={funnel.id} funnel={funnel} index={idx} />
                ))}
              </div>
            )}
          </div>

          {/* All Content by Stage */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">All Content by Funnel Stage</h2>
            <div className="grid grid-cols-3 gap-6">
              {(['TOFU', 'MOFU', 'BOFU'] as FunnelStage[]).map((stage) => (
                <div key={stage} className="space-y-3">
                  <div
                    className="px-4 py-2 rounded-lg font-semibold text-sm text-white"
                    style={{ backgroundColor: FUNNEL_STAGE_COLORS[stage] + '40' }}
                  >
                    {FUNNEL_STAGE_LABELS[stage]}
                  </div>
                  <div className="space-y-2">
                    {funnelContent[stage].map((item) => (
                      <Link
                        key={item.id}
                        href={`/content?id=${item.id}`}
                        className="block bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg p-4 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="font-medium text-sm text-white">{item.title}</span>
                          <span className="text-xs text-slate-500 uppercase">{item.platform}</span>
                        </div>
                        {item.strategyType && (
                          <div className="text-xs text-slate-400 mb-2">
                            Strategy: {item.strategyType}
                          </div>
                        )}
                        {item.linkedContent && item.linkedContent.length > 0 && (
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <ArrowRight className="w-3 h-3" />
                            Links to {item.linkedContent.length} content
                          </div>
                        )}
                      </Link>
                    ))}
                    {funnelContent[stage].length === 0 && (
                      <div className="text-sm text-slate-600 italic p-4">No content yet</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function FunnelVisualization({ funnel, index }: { funnel: { id: string; stages: ContentItem[][] }; index: number }) {
  const [tofu, mofu, bofu] = funnel.stages

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-6">Funnel #{index + 1}</h3>

      <div className="flex items-center gap-4">
        {/* TOFU */}
        <div className="flex-1">
          <div
            className="px-3 py-1 rounded-lg text-xs font-semibold mb-3 inline-block"
            style={{ backgroundColor: FUNNEL_STAGE_COLORS.TOFU + '40' }}
          >
            TOFU (Awareness)
          </div>
          <div className="space-y-2">
            {tofu.map((item) => (
              <div key={item.id} className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <div className="text-sm font-medium text-white mb-1">{item.title}</div>
                <div className="text-xs text-slate-400">{item.platform}</div>
              </div>
            ))}
          </div>
        </div>

        <ArrowRight className="w-6 h-6 text-slate-600 flex-shrink-0" />

        {/* MOFU */}
        <div className="flex-1">
          <div
            className="px-3 py-1 rounded-lg text-xs font-semibold text-white mb-3 inline-block"
            style={{ backgroundColor: FUNNEL_STAGE_COLORS.MOFU + '40' }}
          >
            MOFU (Consideration)
          </div>
          <div className="space-y-2">
            {mofu.map((item) => (
              <div key={item.id} className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                <div className="text-sm font-medium text-white mb-1">{item.title}</div>
                <div className="text-xs text-slate-400">{item.platform}</div>
              </div>
            ))}
          </div>
        </div>

        <ArrowRight className="w-6 h-6 text-slate-600 flex-shrink-0" />

        {/* BOFU */}
        <div className="flex-1">
          <div
            className="px-3 py-1 rounded-lg text-xs font-semibold text-white mb-3 inline-block"
            style={{ backgroundColor: FUNNEL_STAGE_COLORS.BOFU + '40' }}
          >
            BOFU (Conversion)
          </div>
          <div className="space-y-2">
            {bofu.map((item) => (
              <div key={item.id} className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                <div className="text-sm font-medium text-white mb-1">{item.title}</div>
                <div className="text-xs text-slate-400">{item.platform}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Conversion Goal */}
      {bofu[0]?.conversionGoals && bofu[0].conversionGoals.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <div className="text-sm text-slate-400 mb-2">Conversion Goal:</div>
          <div className="flex flex-wrap gap-2">
            {bofu[0].conversionGoals.map((goal, idx) => (
              <div key={idx} className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-sm text-white">
                {goal.metric}: {goal.target || goal.description}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
