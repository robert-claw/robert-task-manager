'use client'

import { useState, useRef, useEffect, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check, Plus } from 'lucide-react'

export interface DropdownOption {
  value: string
  label: string
  icon?: ReactNode
  color?: string
}

interface DropdownProps {
  options: DropdownOption[]
  value: string | null
  onChange: (value: string | null) => void
  placeholder?: string
  showAllOption?: boolean
  allOptionLabel?: string
  showCreateOption?: boolean
  createOptionLabel?: string
  onCreateClick?: () => void
  disabled?: boolean
  className?: string
}

export function Dropdown({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  showAllOption = false,
  allOptionLabel = 'All',
  showCreateOption = false,
  createOptionLabel = 'Create New',
  onCreateClick,
  disabled = false,
  className = '',
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  // Close on escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }
    
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])
  
  const selectedOption = options.find(opt => opt.value === value)
  const displayLabel = selectedOption?.label || (showAllOption && !value ? allOptionLabel : placeholder)
  
  function handleSelect(optionValue: string | null) {
    onChange(optionValue)
    setIsOpen(false)
  }
  
  function handleCreateClick() {
    setIsOpen(false)
    onCreateClick?.()
  }
  
  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between gap-2 px-3 py-2.5
          bg-slate-800 border border-slate-700 rounded-lg
          text-sm text-left transition-all
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-slate-600 hover:bg-slate-750'}
          ${isOpen ? 'ring-2 ring-cyan-500 border-cyan-500' : ''}
        `}
      >
        <div className="flex items-center gap-2 min-w-0">
          {selectedOption?.icon && (
            <span className="flex-shrink-0">{selectedOption.icon}</span>
          )}
          {selectedOption?.color && !selectedOption?.icon && (
            <span 
              className="w-3 h-3 rounded-full flex-shrink-0" 
              style={{ backgroundColor: selectedOption.color }}
            />
          )}
          <span className={`truncate ${selectedOption ? 'text-white' : 'text-slate-400'}`}>
            {displayLabel}
          </span>
        </div>
        <ChevronDown 
          size={16} 
          className={`text-slate-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      
      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-1 py-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden"
          >
            <div className="max-h-64 overflow-y-auto">
              {/* All Option */}
              {showAllOption && (
                <button
                  type="button"
                  onClick={() => handleSelect(null)}
                  className={`
                    w-full flex items-center justify-between px-3 py-2 text-sm
                    transition-colors
                    ${!value ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-300 hover:bg-slate-700'}
                  `}
                >
                  <span>{allOptionLabel}</span>
                  {!value && <Check size={14} className="text-cyan-400" />}
                </button>
              )}
              
              {/* Options */}
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`
                    w-full flex items-center justify-between px-3 py-2 text-sm
                    transition-colors
                    ${value === option.value ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-300 hover:bg-slate-700'}
                  `}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {option.icon && (
                      <span className="flex-shrink-0">{option.icon}</span>
                    )}
                    {option.color && !option.icon && (
                      <span 
                        className="w-3 h-3 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: option.color }}
                      />
                    )}
                    <span className="truncate">{option.label}</span>
                  </div>
                  {value === option.value && <Check size={14} className="text-cyan-400 flex-shrink-0" />}
                </button>
              ))}
              
              {/* Create Option */}
              {showCreateOption && (
                <>
                  <div className="border-t border-slate-700 my-1" />
                  <button
                    type="button"
                    onClick={handleCreateClick}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-cyan-400 hover:bg-slate-700 transition-colors"
                  >
                    <Plus size={14} />
                    <span>{createOptionLabel}</span>
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Project-specific dropdown with built-in styling
interface ProjectDropdownProps {
  projects: { id: string; name: string; icon?: string; color?: string }[]
  selectedProject: string | null
  onProjectChange: (projectId: string | null) => void
  onCreateProject?: () => void
  showAllOption?: boolean
  className?: string
}

export function ProjectDropdown({
  projects,
  selectedProject,
  onProjectChange,
  onCreateProject,
  showAllOption = true,
  className = '',
}: ProjectDropdownProps) {
  const options: DropdownOption[] = projects.map(project => ({
    value: project.id,
    label: project.name,
    icon: project.icon ? <span className="text-sm">{project.icon}</span> : undefined,
    color: project.color,
  }))
  
  return (
    <Dropdown
      options={options}
      value={selectedProject}
      onChange={onProjectChange}
      placeholder="Select Project"
      showAllOption={showAllOption}
      allOptionLabel="All Projects"
      showCreateOption={!!onCreateProject}
      createOptionLabel="New Project"
      onCreateClick={onCreateProject}
      className={className}
    />
  )
}
