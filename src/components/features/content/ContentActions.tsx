'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap,
  Calendar,
  CheckCircle2,
  Eye,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Clock,
  Sparkles,
  BarChart3,
} from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/Icons'

interface ContentItem {
  id: string
  projectId: string
  platform: string
  title: string
  status: string
  scheduledFor?: string
}

interface ContentActionsProps {
  content: ContentItem[]
  onAutoDistribute: (cadenceDays: number) => Promise<void>
  onScheduleApproved: () => Promise<void>
  onBulkApprove: (ids: string[]) => Promise<void>
  onPreviewSchedule: () => void
  selectedIds: string[]
  onSelectedIdsChange: (ids: string[]) => void
}

export function ContentActions({
  content,
  onAutoDistribute,
  onScheduleApproved,
  onBulkApprove,
  onPreviewSchedule,
  selectedIds,
  onSelectedIdsChange,
}: ContentActionsProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [loading, setLoading] = useState<string | null>(null)
  const [cadenceDays, setCadenceDays] = useState(2)
  const [showWarning, setShowWarning] = useState<string | null>(null)

  // Content stats
  const unscheduled = content.filter(c => !c.scheduledFor && c.status !== 'published')
  const unapproved = content.filter(c => ['draft', 'ready_for_review', 'changes_requested'].includes(c.status))
  const approved = content.filter(c => c.status === 'approved')
  const readyForReview = content.filter(c => c.status === 'ready_for_review')

  const handleAutoDistribute = async () => {
    if (unapproved.length > 0) {
      setShowWarning('auto-distribute')
      return
    }
    await executeAutoDistribute()
  }

  const executeAutoDistribute = async () => {
    setLoading('auto-distribute')
    setShowWarning(null)
    try {
      await onAutoDistribute(cadenceDays)
    } finally {
      setLoading(null)
    }
  }

  const handleScheduleApproved = async () => {
    if (approved.length === 0) return
    setLoading('schedule-approved')
    try {
      await onScheduleApproved()
    } finally {
      setLoading(null)
    }
  }

  const handleBulkApprove = async () => {
    const idsToApprove = selectedIds.length > 0 ? selectedIds : readyForReview.map(c => c.id)
    if (idsToApprove.length === 0) return
    setLoading('bulk-approve')
    try {
      await onBulkApprove(idsToApprove)
      onSelectedIdsChange([])
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
            <Zap size={20} className="text-cyan-400" />
          </div>
          <div className="text-left">
            <h3 className="text-white font-semibold">Quick Actions</h3>
            <p className="text-slate-400 text-sm">Bulk operations for content management</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp size={20} className="text-slate-400" />
        ) : (
          <ChevronDown size={20} className="text-slate-400" />
        )}
      </button>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 space-y-4">
              {/* Stats Row */}
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-slate-800 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-white">{unscheduled.length}</div>
                  <div className="text-xs text-slate-400">Unscheduled</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-yellow-400">{readyForReview.length}</div>
                  <div className="text-xs text-slate-400">Pending Review</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-green-400">{approved.length}</div>
                  <div className="text-xs text-slate-400">Approved</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-slate-400">{unapproved.length}</div>
                  <div className="text-xs text-slate-400">Unapproved</div>
                </div>
              </div>

              {/* Warning Banner */}
              <AnimatePresence>
                {showWarning && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4"
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle size={20} className="text-yellow-400 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="text-yellow-400 font-medium mb-1">
                          Warning: Includes Unapproved Content
                        </div>
                        <div className="text-slate-400 text-sm mb-3">
                          {unapproved.length} items haven't been approved yet. Proceed anyway?
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setShowWarning(null)}
                            className="px-3 py-1.5 text-sm bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={executeAutoDistribute}
                            className="px-3 py-1.5 text-sm bg-yellow-500 text-black font-medium rounded hover:bg-yellow-400 transition-colors"
                          >
                            Proceed Anyway
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                {/* Auto-Distribute */}
                <div className="bg-slate-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={16} className="text-purple-400" />
                    <span className="text-white font-medium text-sm">Auto-Distribute</span>
                  </div>
                  <p className="text-slate-400 text-xs mb-3">
                    Spread unscheduled content across dates
                  </p>
                  <div className="flex items-center gap-2 mb-3">
                    <label className="text-xs text-slate-400">Every</label>
                    <select
                      value={cadenceDays}
                      onChange={(e) => setCadenceDays(Number(e.target.value))}
                      className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value={1}>1 day</option>
                      <option value={2}>2 days</option>
                      <option value={3}>3 days</option>
                      <option value={7}>1 week</option>
                    </select>
                  </div>
                  <button
                    onClick={handleAutoDistribute}
                    disabled={loading === 'auto-distribute' || unscheduled.length === 0}
                    className="w-full px-3 py-2 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg hover:bg-purple-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    {loading === 'auto-distribute' ? (
                      <LoadingSpinner size={14} />
                    ) : (
                      <Calendar size={14} />
                    )}
                    Distribute ({unscheduled.length})
                  </button>
                </div>

                {/* Schedule All Approved */}
                <div className="bg-slate-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock size={16} className="text-blue-400" />
                    <span className="text-white font-medium text-sm">Schedule Approved</span>
                  </div>
                  <p className="text-slate-400 text-xs mb-3">
                    Auto-schedule all approved content
                  </p>
                  <button
                    onClick={handleScheduleApproved}
                    disabled={loading === 'schedule-approved' || approved.length === 0}
                    className="w-full px-3 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    {loading === 'schedule-approved' ? (
                      <LoadingSpinner size={14} />
                    ) : (
                      <Clock size={14} />
                    )}
                    Schedule ({approved.length})
                  </button>
                </div>

                {/* Bulk Approve */}
                <div className="bg-slate-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 size={16} className="text-green-400" />
                    <span className="text-white font-medium text-sm">Bulk Approve</span>
                  </div>
                  <p className="text-slate-400 text-xs mb-3">
                    {selectedIds.length > 0 
                      ? `Approve ${selectedIds.length} selected items`
                      : 'Approve all pending review items'}
                  </p>
                  <button
                    onClick={handleBulkApprove}
                    disabled={loading === 'bulk-approve' || (selectedIds.length === 0 && readyForReview.length === 0)}
                    className="w-full px-3 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    {loading === 'bulk-approve' ? (
                      <LoadingSpinner size={14} />
                    ) : (
                      <CheckCircle2 size={14} />
                    )}
                    Approve ({selectedIds.length || readyForReview.length})
                  </button>
                </div>

                {/* Preview Schedule */}
                <div className="bg-slate-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 size={16} className="text-cyan-400" />
                    <span className="text-white font-medium text-sm">Preview Schedule</span>
                  </div>
                  <p className="text-slate-400 text-xs mb-3">
                    See what publishing would look like
                  </p>
                  <button
                    onClick={onPreviewSchedule}
                    className="w-full px-3 py-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/30 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <Eye size={14} />
                    Preview
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
