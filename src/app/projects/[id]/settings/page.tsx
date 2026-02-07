'use client'

import { useState, useEffect, use } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { ToastProvider, useToast } from '@/components/ui/Toast'
import { LoadingPage } from '@/components/ui/Loading'
import {
  PlatformIcon,
  ChevronLeft,
  Settings,
  Radio,
  CheckCircle2,
  AlertCircle,
  Clock,
  Link as LinkIcon,
  Unlink,
  ExternalLink,
  RefreshCw,
  Loader2,
  AlertTriangle,
} from '@/components/ui/Icons'

interface PlatformStatus {
  platform: string
  displayName: string
  description: string
  oauthSupported: boolean
  oauthConfigured: boolean
  connectionStatus: 'connected' | 'pending' | 'disconnected' | 'error' | 'not_configured'
  accountName?: string
  accountId?: string
  connectedAt?: string
  expiresAt?: string
  connectionError?: string
  enabled: boolean
}

interface OAuthStatusResponse {
  projectId: string
  projectName: string
  platforms: PlatformStatus[]
}

function ProjectSettingsContent({ projectId }: { projectId: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [statusData, setStatusData] = useState<OAuthStatusResponse | null>(null)
  const [disconnecting, setDisconnecting] = useState<string | null>(null)
  const toast = useToast()

  // Check for OAuth callback results
  useEffect(() => {
    const oauthSuccess = searchParams.get('oauth_success')
    const oauthError = searchParams.get('oauth_error')

    if (oauthSuccess) {
      toast.success(`Connected to ${oauthSuccess}`, 'Platform connected successfully')
      // Clean URL
      router.replace(`/projects/${projectId}/settings`)
    }
    if (oauthError) {
      toast.error('Connection Failed', decodeURIComponent(oauthError))
      router.replace(`/projects/${projectId}/settings`)
    }
  }, [searchParams, projectId, router, toast])

  useEffect(() => {
    loadStatus()
  }, [projectId])

  async function loadStatus() {
    try {
      const res = await fetch(`/api/oauth/status?projectId=${projectId}`)
      const data = await res.json()
      if (data.error) {
        toast.error('Failed to load settings')
        return
      }
      setStatusData(data)
    } catch (error) {
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  function handleConnect(platform: string) {
    const returnUrl = `/projects/${projectId}/settings`
    window.location.href = `/api/oauth/connect?platform=${platform}&projectId=${projectId}&returnUrl=${encodeURIComponent(returnUrl)}`
  }

  async function handleDisconnect(platform: string) {
    if (!confirm(`Disconnect from ${platform}? You'll need to reconnect to post content.`)) {
      return
    }

    setDisconnecting(platform)
    try {
      const res = await fetch('/api/oauth/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, platform }),
      })

      const data = await res.json()
      if (data.success) {
        toast.success('Disconnected', `${platform} has been disconnected`)
        await loadStatus()
      } else {
        toast.error('Failed to disconnect')
      }
    } catch (error) {
      toast.error('Failed to disconnect')
    } finally {
      setDisconnecting(null)
    }
  }

  function getStatusBadge(status: PlatformStatus) {
    if (status.connectionStatus === 'connected') {
      return (
        <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-green-500/20 text-green-400">
          <CheckCircle2 size={12} />
          Connected
        </span>
      )
    }
    if (status.connectionStatus === 'error') {
      return (
        <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-red-500/20 text-red-400">
          <AlertCircle size={12} />
          Error
        </span>
      )
    }
    if (status.connectionStatus === 'pending') {
      return (
        <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-yellow-500/20 text-yellow-400">
          <Clock size={12} />
          Pending
        </span>
      )
    }
    if (!status.oauthConfigured && status.oauthSupported) {
      return (
        <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-400">
          <AlertTriangle size={12} />
          Not Configured
        </span>
      )
    }
    return (
      <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-slate-500/20 text-slate-400">
        <Unlink size={12} />
        Not Connected
      </span>
    )
  }

  if (loading) {
    return <LoadingPage message="Loading settings..." />
  }

  if (!statusData) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Project not found</h2>
          <Link href="/projects" className="text-cyan-400 hover:text-cyan-300">
            Back to projects
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Sidebar
        projects={[]}
        selectedProject={projectId}
        onProjectChange={() => {}}
      />

      <main className="flex-1 p-6 overflow-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link
            href={`/projects`}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
          >
            <ChevronLeft size={20} />
            Back to Projects
          </Link>

          <header className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Settings size={32} className="text-cyan-400" />
              {statusData.projectName} Settings
            </h1>
            <p className="text-slate-400">
              Connect your social media accounts to enable posting
            </p>
          </header>

          {/* Platform Connections */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Radio size={20} className="text-cyan-400" />
              Platform Connections
            </h2>

            <div className="space-y-4">
              {statusData.platforms.map(platform => (
                <motion.div
                  key={platform.platform}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-slate-800 flex items-center justify-center">
                        <PlatformIcon platform={platform.platform} size={28} className="text-slate-300" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-white">{platform.displayName}</h3>
                          {getStatusBadge(platform)}
                        </div>
                        <p className="text-sm text-slate-400 mt-1">{platform.description}</p>
                        
                        {platform.accountName && (
                          <p className="text-sm text-cyan-400 mt-2 flex items-center gap-1">
                            <LinkIcon size={12} />
                            Connected as: {platform.accountName}
                          </p>
                        )}
                        
                        {platform.connectedAt && (
                          <p className="text-xs text-slate-500 mt-1">
                            Connected: {new Date(platform.connectedAt).toLocaleDateString()}
                            {platform.expiresAt && (
                              <span className="ml-2">
                                • Expires: {new Date(platform.expiresAt).toLocaleDateString()}
                              </span>
                            )}
                          </p>
                        )}

                        {platform.connectionError && (
                          <p className="text-sm text-red-400 mt-2 flex items-center gap-1">
                            <AlertCircle size={12} />
                            {platform.connectionError}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {platform.oauthSupported && (
                        <>
                          {platform.connectionStatus === 'connected' ? (
                            <>
                              <button
                                onClick={() => handleConnect(platform.platform)}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
                              >
                                <RefreshCw size={16} />
                                Reconnect
                              </button>
                              <button
                                onClick={() => handleDisconnect(platform.platform)}
                                disabled={disconnecting === platform.platform}
                                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors disabled:opacity-50"
                              >
                                {disconnecting === platform.platform ? (
                                  <Loader2 size={16} className="animate-spin" />
                                ) : (
                                  <Unlink size={16} />
                                )}
                                Disconnect
                              </button>
                            </>
                          ) : platform.oauthConfigured ? (
                            <button
                              onClick={() => handleConnect(platform.platform)}
                              className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors"
                            >
                              <ExternalLink size={16} />
                              Connect
                            </button>
                          ) : (
                            <div className="text-sm text-slate-500 px-4 py-2 bg-slate-800/50 rounded-lg">
                              OAuth not configured
                              <p className="text-xs mt-1">Contact admin to set up API keys</p>
                            </div>
                          )}
                        </>
                      )}
                      
                      {!platform.oauthSupported && platform.platform === 'blog' && (
                        <span className="text-sm text-slate-400 px-4 py-2 bg-slate-800/50 rounded-lg">
                          No connection needed
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Warning for unconnected platforms */}
          {statusData.platforms.some(p => p.enabled && p.connectionStatus !== 'connected' && p.oauthSupported) && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle size={20} className="text-yellow-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-400">Some platforms are not connected</h4>
                <p className="text-sm text-yellow-400/70 mt-1">
                  Content created for unconnected platforms cannot be published automatically.
                  Connect your accounts above to enable posting.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
}

export default function ProjectSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  
  return (
    <ToastProvider>
      <ProjectSettingsContent projectId={id} />
    </ToastProvider>
  )
}
