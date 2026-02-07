'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Modal } from '@/components/ui/Modal'
import { Plus, X } from 'lucide-react'

const ICONS = ['📁', '🌼', '🦞', '🚀', '💡', '🎯', '✨', '🔥', '💎', '🌟']
const COLORS = ['#6b7280', '#f59e0b', '#06b6d4', '#8b5cf6', '#ef4444', '#10b981', '#3b82f6', '#ec4899']

const PLATFORMS = [
  { id: 'twitter', label: 'Twitter/X', icon: '🐦' },
  { id: 'linkedin', label: 'LinkedIn', icon: '💼' },
  { id: 'blog', label: 'Blog', icon: '📝' },
  { id: 'nostr', label: 'Nostr', icon: '⚡' },
  { id: 'medium', label: 'Medium', icon: '✍️' },
]

interface NewProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (project: NewProjectData) => Promise<void>
}

export interface NewProjectData {
  name: string
  description: string
  icon: string
  color: string
  platforms: string[]
}

export function NewProjectModal({ isOpen, onClose, onSave }: NewProjectModalProps) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<NewProjectData>({
    name: '',
    description: '',
    icon: '📁',
    color: '#6b7280',
    platforms: [],
  })

  const togglePlatform = (platformId: string) => {
    setForm(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platformId)
        ? prev.platforms.filter(p => p !== platformId)
        : [...prev.platforms, platformId],
    }))
  }

  const handleSubmit = async () => {
    if (!form.name.trim()) return

    setLoading(true)
    try {
      await onSave(form)
      setForm({ name: '', description: '', icon: '📁', color: '#6b7280', platforms: [] })
      onClose()
    } catch (error) {
      console.error('Failed to create project:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setForm({ name: '', description: '', icon: '📁', color: '#6b7280', platforms: [] })
      onClose()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="New Project" size="md">
      <div className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm text-slate-400 mb-2">Project Name *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g., Dandelion Labs"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            autoFocus
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm text-slate-400 mb-2">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Brief description of this project..."
            rows={2}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
          />
        </div>

        {/* Icon & Color */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Icon</label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setForm({ ...form, icon })}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${
                    form.icon === icon
                      ? 'bg-cyan-500/30 ring-2 ring-cyan-500'
                      : 'bg-slate-800 hover:bg-slate-700'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">Color</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm({ ...form, color })}
                  className={`w-10 h-10 rounded-lg transition-all ${
                    form.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Platforms */}
        <div>
          <label className="block text-sm text-slate-400 mb-2">Platforms</label>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((platform) => (
              <button
                key={platform.id}
                type="button"
                onClick={() => togglePlatform(platform.id)}
                className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-all text-sm ${
                  form.platforms.includes(platform.id)
                    ? 'bg-cyan-500/30 text-cyan-400 ring-1 ring-cyan-500'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>{platform.icon}</span>
                <span>{platform.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-slate-700">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-slate-700 text-white rounded-lg hover:bg-slate-600 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !form.name.trim()}
            className="flex-1 px-4 py-2.5 bg-cyan-500 text-black font-medium rounded-lg hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <>
                <Plus size={18} />
                Create Project
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  )
}
