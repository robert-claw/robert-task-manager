'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface Activity {
  id: string
  name: string
  description: string
  interval: string
  status: 'active' | 'pending' | 'paused'
  lastRun: string | null
  nextRun: string | null
  category: string
}

const STATUS_COLORS = {
  active: 'bg-green-600',
  pending: 'bg-yellow-600',
  paused: 'bg-zinc-600',
}

const STATUS_LABELS = {
  active: 'Active',
  pending: 'Pending',
  paused: 'Paused',
}

const CATEGORY_ICONS: Record<string, string> = {
  notifications: '🔔',
  social: '🐦',
  content: '📝',
  system: '⚙️',
}

export default function ActivitiesPage() {
  const router = useRouter()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      router.push('/login')
      return
    }
    loadActivities()
  }, [router])

  const loadActivities = async () => {
    try {
      const res = await fetch('/api/activities')
      if (res.ok) {
        const data = await res.json()
        setActivities(data.activities || [])
      }
    } catch (error) {
      console.error('Failed to load activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleStatus = async (activity: Activity) => {
    const newStatus = activity.status === 'active' ? 'paused' : 'active'
    try {
      const res = await fetch('/api/activities', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: activity.id, status: newStatus }),
      })
      if (res.ok) {
        loadActivities()
      }
    } catch (error) {
      console.error('Failed to toggle activity:', error)
    }
  }

  const groupedActivities = activities.reduce((acc, activity) => {
    if (!acc[activity.category]) {
      acc[activity.category] = []
    }
    acc[activity.category].push(activity)
    return acc
  }, {} as Record<string, Activity[]>)

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-cyan-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800 sticky top-0 bg-zinc-950/80 backdrop-blur-md z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3">
              <span className="text-3xl">🦞</span>
              <span className="text-xl font-bold text-white">Task Manager</span>
            </Link>
            <nav className="flex items-center gap-4">
              <Link 
                href="/dashboard" 
                className="text-zinc-400 hover:text-white transition-colors"
              >
                Tasks
              </Link>
              <Link 
                href="/activities" 
                className="text-cyan-400 font-medium"
              >
                Activities
              </Link>
            </nav>
          </div>
          <Link
            href="/dashboard"
            className="text-zinc-400 hover:text-white transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">🤖 Robert's Activities</h1>
          <p className="text-zinc-400">
            Automated tasks and monitoring activities running in the background.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
            <p className="text-zinc-400 text-sm">Total Activities</p>
            <p className="text-2xl font-bold text-white">{activities.length}</p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
            <p className="text-zinc-400 text-sm">Active</p>
            <p className="text-2xl font-bold text-green-400">
              {activities.filter(a => a.status === 'active').length}
            </p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
            <p className="text-zinc-400 text-sm">Paused</p>
            <p className="text-2xl font-bold text-zinc-400">
              {activities.filter(a => a.status === 'paused').length}
            </p>
          </div>
        </div>

        {/* Activities by Category */}
        <div className="space-y-8">
          {Object.entries(groupedActivities).map(([category, categoryActivities]) => (
            <div key={category}>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>{CATEGORY_ICONS[category] || '📋'}</span>
                <span className="capitalize">{category}</span>
              </h2>
              <div className="space-y-3">
                {categoryActivities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">{activity.name}</h3>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium text-white ${STATUS_COLORS[activity.status]}`}>
                            {STATUS_LABELS[activity.status]}
                          </span>
                        </div>
                        <p className="text-zinc-400 text-sm mb-3">{activity.description}</p>
                        <div className="flex items-center gap-6 text-sm">
                          <div>
                            <span className="text-zinc-500">Interval: </span>
                            <span className="text-cyan-400">{activity.interval}</span>
                          </div>
                          {activity.lastRun && (
                            <div>
                              <span className="text-zinc-500">Last run: </span>
                              <span className="text-zinc-300">
                                {new Date(activity.lastRun).toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => toggleStatus(activity)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          activity.status === 'active'
                            ? 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                            : 'bg-green-600 text-white hover:bg-green-500'
                        }`}
                      >
                        {activity.status === 'active' ? 'Pause' : 'Activate'}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className="mt-8 p-4 bg-cyan-900/20 border border-cyan-800/30 rounded-xl">
          <h3 className="text-cyan-400 font-medium mb-2">ℹ️ How Activities Work</h3>
          <p className="text-zinc-400 text-sm">
            These activities run automatically during Robert's heartbeat cycles (approximately every hour). 
            You can pause any activity if you don't want it running. Last run times update automatically 
            when each activity executes.
          </p>
        </div>
      </main>
    </div>
  )
}
