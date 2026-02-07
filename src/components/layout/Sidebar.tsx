'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Calendar,
  FileText,
  FolderOpen,
  Settings,
  PanelLeftClose,
  PanelLeft,
  Sparkles,
  Target,
  BarChart3,
  BookOpen,
  Lightbulb,
} from 'lucide-react'
import { ProjectDropdown } from '@/components/ui/Dropdown'

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
  onCreateProject?: () => void
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/content', label: 'Content', icon: FileText },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/campaigns', label: 'Campaigns', icon: Target },
  { href: '/ideas', label: 'Ideas', icon: Lightbulb },
  { href: '/templates', label: 'Library', icon: BookOpen },
  { href: '/docs', label: 'Docs', icon: FileText },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/projects', label: 'Projects', icon: FolderOpen },
  { href: '/settings', label: 'Settings', icon: Settings },
]

// Map project icons to colors (simplified from emoji)
const projectIconColors: Record<string, string> = {
  '🌼': 'bg-amber-500',
  '🦞': 'bg-cyan-500',
  '🚀': 'bg-purple-500',
  '💡': 'bg-yellow-500',
  '🎯': 'bg-red-500',
}

function ProjectIcon({ icon, className = '' }: { icon: string; className?: string }) {
  const bgColor = projectIconColors[icon] || 'bg-slate-600'
  // Use first letter as fallback if we need to
  const letter = icon.length > 2 ? icon[0].toUpperCase() : icon
  
  return (
    <span 
      className={`inline-flex items-center justify-center rounded-md text-sm ${className}`}
      title={icon}
    >
      {letter}
    </span>
  )
}

export function Sidebar({ projects, selectedProject, onProjectChange, onCreateProject }: SidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  return (
    <motion.aside
      initial={{ width: 256 }}
      animate={{ width: isCollapsed ? 72 : 256 }}
      className="h-screen bg-slate-900 border-r border-slate-800 flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                <Sparkles size={18} className="text-cyan-400" />
              </div>
              <h1 className="text-lg font-bold text-cyan-400">
                Community Manager
              </h1>
            </motion.div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
          </button>
        </div>
      </div>
      
      {/* Project Selector */}
      {!isCollapsed && (
        <div className="p-4 border-b border-slate-800">
          <label className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">
            Project
          </label>
          <ProjectDropdown
            projects={projects}
            selectedProject={selectedProject}
            onProjectChange={onProjectChange}
            onCreateProject={onCreateProject}
            showAllOption={true}
          />
        </div>
      )}
      
      {/* Navigation */}
      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-cyan-500/20 text-cyan-400' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon size={20} />
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
                  <ProjectIcon icon={project.icon} />
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
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-medium">
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
