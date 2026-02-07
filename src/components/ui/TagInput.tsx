'use client'

import { useState, KeyboardEvent } from 'react'
import { X, Plus, Hash } from 'lucide-react'

interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  maxTags?: number
  className?: string
}

export function TagInput({ 
  tags, 
  onChange, 
  placeholder = "Add tag...", 
  maxTags,
  className = '' 
}: TagInputProps) {
  const [input, setInput] = useState('')

  const addTag = (tag: string) => {
    const trimmed = tag.trim().replace(/^#/, '') // Remove leading # if present
    if (trimmed && !tags.includes(trimmed)) {
      if (!maxTags || tags.length < maxTags) {
        onChange([...tags, trimmed])
        setInput('')
      }
    }
  }

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag(input)
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      removeTag(tags.length - 1)
    }
  }

  return (
    <div className={`${className}`}>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm border border-cyan-500/30 group hover:bg-cyan-500/30 transition-colors"
          >
            <Hash size={12} />
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="ml-1 hover:text-cyan-300 transition-colors"
              aria-label={`Remove ${tag}`}
            >
              <X size={14} />
            </button>
          </span>
        ))}
      </div>
      
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={maxTags && tags.length >= maxTags ? `Max ${maxTags} tags` : placeholder}
          disabled={maxTags !== undefined && tags.length >= maxTags}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        {input && (
          <button
            type="button"
            onClick={() => addTag(input)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-cyan-400 hover:text-cyan-300 transition-colors"
            aria-label="Add tag"
          >
            <Plus size={16} />
          </button>
        )}
      </div>
      
      <p className="text-xs text-slate-500 mt-1">
        Press Enter to add{maxTags && ` • Max ${maxTags} tags`}
      </p>
    </div>
  )
}
