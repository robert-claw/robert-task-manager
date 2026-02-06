'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sidebar } from '@/components/layout/Sidebar'

interface Project {
  id: string
  name: string
  icon: string
  color: string
}

export default function SettingsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
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
    
    fetchProjects()
  }, [])
  
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
            <p className="text-slate-400">Configure your Community Manager</p>
          </div>
          
          <div className="grid gap-6 max-w-2xl">
            {/* Account Settings */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">👤 Account</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400 block mb-1">Name</label>
                  <input
                    type="text"
                    defaultValue="Leon"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400 block mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="leon@dandelionlabs.io"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>
            </div>
            
            {/* Notification Settings */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">🔔 Notifications</h2>
              <div className="space-y-4">
                <label className="flex items-center justify-between">
                  <span className="text-slate-300">Content ready for review</span>
                  <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-slate-300">Content published</span>
                  <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-slate-300">Scheduled content reminders</span>
                  <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
                </label>
              </div>
            </div>
            
            {/* API Connections */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">🔌 API Connections</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">💼</span>
                    <div>
                      <div className="text-white">LinkedIn</div>
                      <div className="text-xs text-slate-500">Organization posting pending approval</div>
                    </div>
                  </div>
                  <span className="text-yellow-400 text-sm">Pending</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🐦</span>
                    <div>
                      <div className="text-white">Twitter/X</div>
                      <div className="text-xs text-slate-500">@dandelionlabsio</div>
                    </div>
                  </div>
                  <span className="text-green-400 text-sm">Connected</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📝</span>
                    <div>
                      <div className="text-white">GitHub (Blog)</div>
                      <div className="text-xs text-slate-500">dandelionlabs-io/corporate</div>
                    </div>
                  </div>
                  <span className="text-green-400 text-sm">Connected</span>
                </div>
              </div>
            </div>
            
            {/* Robert Settings */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">🦞 Robert (AI Assistant)</h2>
              <div className="space-y-4">
                <label className="flex items-center justify-between">
                  <span className="text-slate-300">Auto-generate content suggestions</span>
                  <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-slate-300">Notify via Telegram</span>
                  <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-slate-300">Auto-publish approved content</span>
                  <input type="checkbox" className="w-5 h-5 rounded" />
                </label>
              </div>
            </div>
          </div>
          
          <div className="mt-6 max-w-2xl">
            <button className="px-6 py-2 bg-cyan-500 text-black font-medium rounded-lg hover:bg-cyan-400 transition-colors">
              Save Settings
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
