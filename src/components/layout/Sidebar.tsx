'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

interface Project {
  id: string
  name: string
  icon: string
  color: string
}

interface SidebarProps {
  projects: Project[]
  selectedProject: string | null
  onProjectChange: (projectId: string | null) => void
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/calendar', label: 'Calendar', icon: '📅' },
  { href: '/content', label: 'Content', icon: '📝' },
  { href: '/projects', label: 'Projects', icon: '📁' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
]

export function Sidebar({ projects, selectedProject, onProjectChange }: SidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  return (
    <motion.aside
      initial={{ width: 256 }}
      animate={{ width: isCollapsed ? 64 : 256 }}
      className="h-screen bg-slate-900 border-r border-slate-800 flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-lg font-bold text-cyan-400"
            >
              🦞 Community Manager
            </motion.h1>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            {isCollapsed ? '→' : '←'}
          </button>
        </div>
      </div>
      
      {/* Project Selector */}
      {!isCollapsed && (
        <div className="p-4 border-b border-slate-800">
          <label className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">
            Project
          </label>
          <select
            value={selectedProject || ''}
            onChange={(e) => onProjectChange(e.target.value || null)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="">All Projects</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.icon} {project.name}
              </option>
            ))}
          </select>
        </div>
      )}
      
      {/* Navigation */}
      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-cyan-500/20 text-cyan-400' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  {!isCollapsed && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      
      {/* Projects Quick Access */}
      {!isCollapsed && projects.length > 0 && (
        <div className="p-4 border-t border-slate-800">
          <label className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">
            Quick Access
          </label>
          <ul className="space-y-1">
            {projects.slice(0, 3).map((project) => (
              <li key={project.id}>
                <button
                  onClick={() => onProjectChange(project.id)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors ${
                    selectedProject === project.id
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <span>{project.icon}</span>
                  <span className="truncate">{project.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* User */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">
            L
          </div>
          {!isCollapsed && (
            <div>
              <div className="text-sm font-medium text-white">Leon</div>
              <div className="text-xs text-slate-500">Admin</div>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  )
}
