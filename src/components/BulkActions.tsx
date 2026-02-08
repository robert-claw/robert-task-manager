'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Calendar, Trash2, Send, FileEdit } from 'lucide-react'

interface BulkActionsProps {
  selectedIds: string[]
  onClearSelection: () => void
  onActionComplete: () => void
}

export function BulkActions({ selectedIds, onClearSelection, onActionComplete }: BulkActionsProps) {
  const [loading, setLoading] = useState(false)
  const [showSchedule, setShowSchedule] = useState(false)
  const [scheduleDate, setScheduleDate] = useState('')

  const handleAction = async (action: string, updates?: any) => {
    setLoading(true)
    try {
      const res = await fetch('/api/content/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          contentIds: selectedIds,
          updates,
        }),
      })

      if (res.ok) {
        onActionComplete()
        onClearSelection()
        setShowSchedule(false)
      } else {
        const error = await res.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Bulk action failed:', error)
      alert('Action failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSchedule = () => {
    if (!scheduleDate) {
      alert('Please select a date and time')
      return
    }
    handleAction('schedule', { scheduledFor: scheduleDate })
  }

  if (selectedIds.length === 0) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
      >
        <div className="bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl p-4">
          <div className="flex items-center gap-4">
            {/* Selection count */}
            <div className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <Check className="h-4 w-4 text-cyan-400" />
              <span className="text-sm font-medium text-white">
                {selectedIds.length} selected
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleAction('approve')}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Approve all selected"
              >
                <Check className="h-4 w-4" />
                Approve
              </button>

              <button
                onClick={() => handleAction('publish')}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Publish all selected"
              >
                <Send className="h-4 w-4" />
                Publish
              </button>

              <button
                onClick={() => setShowSchedule(!showSchedule)}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-400 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Schedule all selected"
              >
                <Calendar className="h-4 w-4" />
                Schedule
              </button>

              <button
                onClick={() => handleAction('draft')}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-700/50 hover:bg-zinc-700 border border-zinc-600 rounded-lg text-zinc-300 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Move to draft"
              >
                <FileEdit className="h-4 w-4" />
                Draft
              </button>

              <button
                onClick={() => {
                  if (confirm(`Delete ${selectedIds.length} items? This cannot be undone.`)) {
                    handleAction('delete')
                  }
                }}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Delete all selected"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>

            {/* Clear selection */}
            <button
              onClick={onClearSelection}
              className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
              title="Clear selection"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Schedule date picker */}
          {showSchedule && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-3 pt-3 border-t border-zinc-700"
            >
              <div className="flex items-center gap-3">
                <input
                  type="datetime-local"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={handleSchedule}
                  disabled={loading || !scheduleDate}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Confirm Schedule
                </button>
              </div>
            </motion.div>
          )}

          {loading && (
            <div className="mt-3 pt-3 border-t border-zinc-700">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <div className="h-4 w-4 border-2 border-zinc-600 border-t-cyan-500 rounded-full animate-spin" />
                Processing...
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
