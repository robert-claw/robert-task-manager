'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Sidebar } from '@/components/layout/Sidebar'
import { CalendarView } from '@/components/features/calendar/CalendarView'
import { ContentDetailModal } from '@/components/features/content/ContentDetailModal'
import { ToastProvider, useToast } from '@/components/ui/Toast'
import { LoadingPage } from '@/components/ui/Loading'

interface Project {
  id: string
  name: string
  icon: string
  color: string
}

interface ContentItem {
  id: string
  projectId: string
  type: string
  platform: string
  title: string
  content: string
  status: string
  priority: string
  scheduledFor?: string
  createdBy: string
  assignee: string
  createdAt: string
}

function CalendarPageContent() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null)
  const [contentLoading, setContentLoading] = useState(false)

  const toast = useToast()

  useEffect(() => {
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

    fetchProjects()
  }, [toast])

  // Handle content click - load full content details
  const handleContentClick = useCallback(async (contentId: string) => {
    setContentLoading(true)
    try {
      const res = await fetch(`/api/content/${contentId}`)
      if (!res.ok) throw new Error('Failed to fetch content')
      const data = await res.json()
      setSelectedContent(data.content)
    } catch (error) {
      console.error('Failed to fetch content:', error)
      toast.error('Failed to load content details')
    } finally {
      setContentLoading(false)
    }
  }, [toast])

  // Handle status change
  const handleStatusChange = async (contentId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/content/${contentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) throw new Error('Failed to update')

      toast.success('Status Updated')
      
      // Refresh the content
      if (selectedContent?.id === contentId) {
        setSelectedContent(prev => prev ? { ...prev, status: newStatus } : null)
      }
    } catch (error) {
      console.error('Failed to update status:', error)
      toast.error('Update Failed')
      throw error
    }
  }

  // Handle content update
  const handleUpdateContent = async (contentId: string, updates: Partial<ContentItem>) => {
    try {
      const res = await fetch(`/api/content/${contentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (!res.ok) throw new Error('Failed to update')

      toast.success('Content Updated')
      
      if (selectedContent?.id === contentId) {
        setSelectedContent(prev => prev ? { ...prev, ...updates } : null)
      }
    } catch (error) {
      console.error('Failed to update content:', error)
      toast.error('Update Failed')
      throw error
    }
  }

  // Handle content delete
  const handleDeleteContent = async (contentId: string) => {
    try {
      const res = await fetch(`/api/content/${contentId}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete')

      toast.success('Content Deleted')
      setSelectedContent(null)
    } catch (error) {
      console.error('Failed to delete content:', error)
      toast.error('Delete Failed')
      throw error
    }
  }

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
          <CalendarView
            selectedProject={selectedProject}
            onContentClick={handleContentClick}
          />
        </motion.div>
      </main>

      {/* Content Detail Modal */}
      <ContentDetailModal
        isOpen={!!selectedContent}
        onClose={() => setSelectedContent(null)}
        content={selectedContent}
        projects={projects}
        onStatusChange={handleStatusChange}
        onUpdate={handleUpdateContent}
        onDelete={handleDeleteContent}
      />
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
