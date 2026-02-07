'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sidebar } from '@/components/layout/Sidebar'
import { ToastProvider, useToast } from '@/components/ui/Toast'
import { LoadingPage } from '@/components/ui/Loading'
import {
  PlatformIcon,
  Settings,
  User,
  Bell,
  Link,
  Bot,
  CheckCircle2,
  Clock,
  AlertCircle,
  Save,
  Plus,
  X,
  Copy,
  RefreshCw,
  Zap,
  Trash2,
} from '@/components/ui/Icons'

interface Project {
  id: string
  name: string
  icon: string
  color: string
}

interface NostrConfig {
  configured: boolean
  publicKey?: string
  npub?: string
  relays?: string[]
  nsec?: string
  warning?: string
}

function NostrSettings({ toast }: { toast: ReturnType<typeof useToast> }) {
  const [config, setConfig] = useState<NostrConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSetup, setShowSetup] = useState(false)
  const [privateKeyInput, setPrivateKeyInput] = useState('')
  const [generatedNsec, setGeneratedNsec] = useState<string | null>(null)
  
  useEffect(() => {
    fetchConfig()
  }, [])
  
  async function fetchConfig() {
    try {
      const res = await fetch('/api/nostr')
      const data = await res.json()
      setConfig(data)
    } catch (error) {
      console.error('Failed to fetch Nostr config:', error)
    } finally {
      setLoading(false)
    }
  }
  
  async function handleGenerate() {
    try {
      const res = await fetch('/api/nostr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate' }),
      })
      const data = await res.json()
      if (data.error) {
        toast.error(data.error)
        return
      }
      setGeneratedNsec(data.nsec)
      setConfig({ configured: true, publicKey: data.publicKey, npub: data.npub, relays: data.relays })
      toast.success('Keypair generated! Save your nsec now.')
    } catch (error) {
      toast.error('Failed to generate keypair')
    }
  }
  
  async function handleImport() {
    if (!privateKeyInput.trim()) {
      toast.error('Enter a private key (hex or nsec)')
      return
    }
    try {
      const res = await fetch('/api/nostr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ privateKey: privateKeyInput.trim() }),
      })
      const data = await res.json()
      if (data.error) {
        toast.error(data.error)
        return
      }
      setConfig({ configured: true, publicKey: data.publicKey, npub: data.npub, relays: data.relays })
      setPrivateKeyInput('')
      setShowSetup(false)
      toast.success('Nostr configured successfully')
    } catch (error) {
      toast.error('Failed to import key')
    }
  }
  
  async function handleDisconnect() {
    try {
      await fetch('/api/nostr', { method: 'DELETE' })
      setConfig({ configured: false })
      setGeneratedNsec(null)
      toast.success('Nostr disconnected')
    } catch (error) {
      toast.error('Failed to disconnect')
    }
  }
  
  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }
  
  if (loading) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center gap-2 text-slate-400">
          <RefreshCw size={16} className="animate-spin" />
          Loading Nostr config...
        </div>
      </div>
    )
  }
  
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
      <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
        <Zap size={20} className="text-purple-400" />
        Nostr
      </h2>
      
      {config?.configured ? (
        <div className="space-y-4">
          {/* Show generated nsec warning */}
          {generatedNsec && (
            <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
              <div className="flex items-start gap-2 mb-2">
                <AlertCircle size={18} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-yellow-400 font-medium">Save your private key now!</div>
                  <div className="text-yellow-300/80 text-sm">This will not be shown again.</div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <code className="flex-1 bg-slate-900 text-yellow-300 px-3 py-2 rounded text-sm font-mono overflow-x-auto">
                  {generatedNsec}
                </code>
                <button
                  onClick={() => copyToClipboard(generatedNsec)}
                  className="p-2 bg-yellow-500/30 text-yellow-400 rounded hover:bg-yellow-500/40"
                >
                  <Copy size={16} />
                </button>
              </div>
              <button
                onClick={() => setGeneratedNsec(null)}
                className="mt-3 text-sm text-yellow-400 hover:text-yellow-300"
              >
                I&apos;ve saved it, dismiss this
              </button>
            </div>
          )}
          
          {/* Public key display */}
          <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Zap size={20} className="text-purple-400" />
              </div>
              <div>
                <div className="text-white font-medium">Connected</div>
                <div className="text-xs text-slate-500 font-mono">
                  {config.npub?.slice(0, 20)}...{config.npub?.slice(-8)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => config.npub && copyToClipboard(config.npub)}
                className="p-2 bg-slate-700 text-slate-300 rounded hover:bg-slate-600"
                title="Copy npub"
              >
                <Copy size={16} />
              </button>
              <button
                onClick={handleDisconnect}
                className="p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
                title="Disconnect"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          
          {/* Relays */}
          <div className="text-sm">
            <div className="text-slate-400 mb-2">Connected Relays:</div>
            <div className="flex flex-wrap gap-2">
              {config.relays?.map(relay => (
                <span key={relay} className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs">
                  {relay.replace('wss://', '')}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {!showSetup ? (
            <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg border border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">
                  <Zap size={20} className="text-slate-400" />
                </div>
                <div>
                  <div className="text-white font-medium">Nostr</div>
                  <div className="text-xs text-slate-500">Decentralized social protocol</div>
                </div>
              </div>
              <button
                onClick={() => setShowSetup(true)}
                className="px-3 py-1.5 bg-purple-500 text-white rounded-lg hover:bg-purple-400 flex items-center gap-1 text-sm"
              >
                <Plus size={14} />
                Setup
              </button>
            </div>
          ) : (
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-white font-medium">Configure Nostr</div>
                <button onClick={() => setShowSetup(false)} className="text-slate-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleGenerate}
                  className="p-4 bg-purple-500/20 border border-purple-500/30 rounded-lg hover:bg-purple-500/30 text-left"
                >
                  <div className="text-purple-400 font-medium mb-1">Generate New</div>
                  <div className="text-xs text-slate-400">Create a new keypair</div>
                </button>
                
                <div className="p-4 bg-slate-700/50 border border-slate-600 rounded-lg">
                  <div className="text-slate-300 font-medium mb-2">Import Existing</div>
                  <input
                    type="password"
                    value={privateKeyInput}
                    onChange={(e) => setPrivateKeyInput(e.target.value)}
                    placeholder="nsec1... or hex"
                    className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-1.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                  <button
                    onClick={handleImport}
                    disabled={!privateKeyInput.trim()}
                    className="mt-2 w-full px-3 py-1.5 bg-purple-500 text-white rounded text-sm hover:bg-purple-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Import
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function SettingsPageContent() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const toast = useToast()
  
  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch('/api/projects')
        const data = await res.json()
        setProjects(data.projects || [])
      } catch (error) {
        console.error('Failed to fetch projects:', error)
        toast.error('Failed to load settings')
      } finally {
        setLoading(false)
      }
    }
    
    fetchProjects()
  }, [toast])
  
  const handleSave = async () => {
    setSaving(true)
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSaving(false)
    toast.success('Settings Saved', 'Your preferences have been updated')
  }
  
  if (loading) {
    return <LoadingPage message="Loading settings..." />
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Settings size={32} className="text-cyan-400" />
              Settings
            </h1>
            <p className="text-slate-400">Configure your Community Manager</p>
          </div>
          
          <div className="grid gap-6 max-w-2xl">
            {/* Account Settings */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <User size={20} className="text-cyan-400" />
                Account
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400 block mb-1">Name</label>
                  <input
                    type="text"
                    defaultValue="Leon"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400 block mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="leon@dandelionlabs.io"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                  />
                </div>
              </div>
            </div>
            
            {/* Notification Settings */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Bell size={20} className="text-cyan-400" />
                Notifications
              </h2>
              <div className="space-y-4">
                <label className="flex items-center justify-between p-3 bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                      <Bell size={16} className="text-yellow-400" />
                    </div>
                    <span className="text-slate-300">Content ready for review</span>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 rounded accent-cyan-500" />
                </label>
                <label className="flex items-center justify-between p-3 bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <CheckCircle2 size={16} className="text-purple-400" />
                    </div>
                    <span className="text-slate-300">Content published</span>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 rounded accent-cyan-500" />
                </label>
                <label className="flex items-center justify-between p-3 bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <Clock size={16} className="text-blue-400" />
                    </div>
                    <span className="text-slate-300">Scheduled content reminders</span>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 rounded accent-cyan-500" />
                </label>
              </div>
            </div>
            
            {/* API Connections */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Link size={20} className="text-cyan-400" />
                API Connections
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg border border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">
                      <PlatformIcon platform="linkedin" size={20} className="text-slate-300" />
                    </div>
                    <div>
                      <div className="text-white font-medium">LinkedIn</div>
                      <div className="text-xs text-slate-500">Organization posting pending approval</div>
                    </div>
                  </div>
                  <span className="text-yellow-400 text-sm flex items-center gap-1 bg-yellow-500/20 px-2 py-1 rounded">
                    <Clock size={12} />
                    Pending
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg border border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">
                      <PlatformIcon platform="twitter" size={20} className="text-slate-300" />
                    </div>
                    <div>
                      <div className="text-white font-medium">Twitter/X</div>
                      <div className="text-xs text-slate-500">@dandelionlabsio</div>
                    </div>
                  </div>
                  <span className="text-green-400 text-sm flex items-center gap-1 bg-green-500/20 px-2 py-1 rounded">
                    <CheckCircle2 size={12} />
                    Connected
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg border border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">
                      <PlatformIcon platform="blog" size={20} className="text-slate-300" />
                    </div>
                    <div>
                      <div className="text-white font-medium">GitHub (Blog)</div>
                      <div className="text-xs text-slate-500">dandelionlabs-io/corporate</div>
                    </div>
                  </div>
                  <span className="text-green-400 text-sm flex items-center gap-1 bg-green-500/20 px-2 py-1 rounded">
                    <CheckCircle2 size={12} />
                    Connected
                  </span>
                </div>
              </div>
            </div>
            
            {/* Nostr Configuration */}
            <NostrSettings toast={toast} />
            
            {/* Robert Settings */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Bot size={20} className="text-cyan-400" />
                Robert (AI Assistant)
              </h2>
              <div className="space-y-4">
                <label className="flex items-center justify-between p-3 bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors">
                  <div>
                    <span className="text-slate-300 block">Auto-generate content suggestions</span>
                    <span className="text-xs text-slate-500">Robert will proactively create draft content</span>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 rounded accent-cyan-500" />
                </label>
                <label className="flex items-center justify-between p-3 bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors">
                  <div>
                    <span className="text-slate-300 block">Notify via Telegram</span>
                    <span className="text-xs text-slate-500">Get notified when content needs review</span>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 rounded accent-cyan-500" />
                </label>
                <label className="flex items-center justify-between p-3 bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors">
                  <div>
                    <span className="text-slate-300 block">Auto-publish approved content</span>
                    <span className="text-xs text-slate-500">Automatically publish when scheduled time arrives</span>
                  </div>
                  <input type="checkbox" className="w-5 h-5 rounded accent-cyan-500" />
                </label>
              </div>
            </div>
            
            {/* Danger Zone */}
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <AlertCircle size={20} className="text-red-400" />
                Danger Zone
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-slate-300">Delete all content</div>
                    <div className="text-xs text-slate-500">Permanently remove all content items</div>
                  </div>
                  <button className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors">
                    Delete
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-slate-300">Reset settings</div>
                    <div className="text-xs text-slate-500">Restore all settings to default values</div>
                  </div>
                  <button className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors">
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 max-w-2xl">
            <button 
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 bg-cyan-500 text-black font-medium rounded-lg hover:bg-cyan-400 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={18} />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <ToastProvider>
      <SettingsPageContent />
    </ToastProvider>
  )
}
