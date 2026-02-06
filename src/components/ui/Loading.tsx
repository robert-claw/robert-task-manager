'use client'

import { motion } from 'framer-motion'
import { LoadingSpinner } from './Icons'

interface LoadingPageProps {
  message?: string
}

export function LoadingPage({ message = 'Loading...' }: LoadingPageProps) {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-4"
      >
        <LoadingSpinner size={40} className="text-cyan-400" />
        <p className="text-slate-400 text-lg">{message}</p>
      </motion.div>
    </div>
  )
}

interface LoadingCardProps {
  rows?: number
}

export function LoadingCard({ rows = 3 }: LoadingCardProps) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 animate-pulse">
      <div className="h-4 bg-slate-700 rounded w-1/3 mb-4" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-3 mt-3">
          <div className="h-3 bg-slate-700 rounded w-full" />
          <div className="h-3 bg-slate-700 rounded w-5/6" />
        </div>
      ))}
    </div>
  )
}

interface LoadingListProps {
  items?: number
}

export function LoadingList({ items = 5 }: LoadingListProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 animate-pulse flex items-center gap-4"
        >
          <div className="w-10 h-10 bg-slate-700 rounded-lg" />
          <div className="flex-1">
            <div className="h-4 bg-slate-700 rounded w-1/2 mb-2" />
            <div className="h-3 bg-slate-700 rounded w-3/4" />
          </div>
          <div className="w-20 h-6 bg-slate-700 rounded" />
        </div>
      ))}
    </div>
  )
}

export function LoadingInline() {
  return (
    <div className="flex items-center gap-2 text-slate-400">
      <LoadingSpinner size={16} />
      <span className="text-sm">Loading...</span>
    </div>
  )
}
