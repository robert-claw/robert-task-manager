'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sidebar } from '@/components/layout/Sidebar'
import { CalendarView } from '@/components/features/calendar/CalendarView'
import { ToastProvider } from '@/components/ui/Toast'
import { LoadingPage } from '@/components/ui/Loading'

interface Project {
  id: string
  name: string
  icon: string
  color: string
}

function CalendarPageContent() {
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
    return <LoadingPage message="Loading calendar..." />
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
          className="h-full"
        >
          <CalendarView selectedProject={selectedProject} />
        </motion.div>
      </main>
    </div>
  )
}

export default function CalendarPage() {
  return (
    <ToastProvider>
      <CalendarPageContent />
    </ToastProvider>
  )
}
