'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CalendarEvent {
  id: string
  contentId: string
  projectId: string
  title: string
  platform: string
  status: string
  date: string
}

interface UnscheduledItem {
  id: string
  title: string
  platform: string
  status: string
  projectId: string
}

interface CalendarViewProps {
  selectedProject: string | null
}

const platformIcons: Record<string, string> = {
  linkedin: '💼',
  twitter: '🐦',
  blog: '📝',
  instagram: '📸',
  facebook: '👥',
}

const statusColors: Record<string, string> = {
  draft: 'bg-slate-600',
  ready_for_review: 'bg-yellow-500',
  changes_requested: 'bg-orange-500',
  approved: 'bg-green-500',
  scheduled: 'bg-blue-500',
  published: 'bg-purple-500',
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export function CalendarView({ selectedProject }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [unscheduled, setUnscheduled] = useState<UnscheduledItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  
  // Get calendar data
  useEffect(() => {
    async function fetchCalendarData() {
      setLoading(true)
      try {
        const year = currentDate.getFullYear()
        const month = currentDate.getMonth()
        const start = new Date(year, month, 1).toISOString()
        const end = new Date(year, month + 1, 0).toISOString()
        
        let url = `/api/calendar?start=${start}&end=${end}`
        if (selectedProject) {
          url += `&projects=${selectedProject}`
        }
        
        const res = await fetch(url)
        const data = await res.json()
        
        setEvents(data.events || [])
        setUnscheduled(data.unscheduled || [])
      } catch (error) {
        console.error('Failed to fetch calendar data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchCalendarData()
  }, [currentDate, selectedProject])
  
  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const daysInPrevMonth = new Date(year, month, 0).getDate()
    
    const days: { date: Date; isCurrentMonth: boolean }[] = []
    
    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, daysInPrevMonth - i),
        isCurrentMonth: false,
      })
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      })
    }
    
    // Next month days
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      })
    }
    
    return days
  }
  
  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return events.filter(event => {
      const eventDate = new Date(event.date).toISOString().split('T')[0]
      return eventDate === dateStr
    })
  }
  
  const days = generateCalendarDays()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  return (
    <div className="flex gap-6 h-full">
      {/* Calendar Grid */}
      <div className="flex-1">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white transition-colors"
            >
              ← Prev
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
        
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAYS.map(day => (
            <div key={day} className="text-center text-sm font-medium text-slate-500 py-2">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map(({ date, isCurrentMonth }, index) => {
            const dayEvents = getEventsForDate(date)
            const isToday = date.getTime() === today.getTime()
            const isSelected = selectedDate?.getTime() === date.getTime()
            
            return (
              <motion.button
                key={index}
                onClick={() => setSelectedDate(date)}
                whileHover={{ scale: 1.02 }}
                className={`
                  min-h-[100px] p-2 rounded-lg border transition-colors text-left
                  ${isCurrentMonth ? 'bg-slate-800/50' : 'bg-slate-900/50'}
                  ${isToday ? 'border-cyan-500' : 'border-slate-700/50'}
                  ${isSelected ? 'ring-2 ring-cyan-500' : ''}
                  ${isCurrentMonth ? 'text-white' : 'text-slate-600'}
                  hover:bg-slate-800
                `}
              >
                <span className={`
                  text-sm font-medium
                  ${isToday ? 'bg-cyan-500 text-black px-2 py-0.5 rounded-full' : ''}
                `}>
                  {date.getDate()}
                </span>
                
                {/* Events for this day */}
                <div className="mt-1 space-y-1">
                  {dayEvents.slice(0, 3).map(event => (
                    <div
                      key={event.id}
                      className={`
                        text-xs px-1.5 py-0.5 rounded truncate
                        ${statusColors[event.status] || 'bg-slate-600'}
                      `}
                      title={event.title}
                    >
                      {platformIcons[event.platform]} {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-slate-500 px-1.5">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </motion.button>
            )
          })}
        </div>
        
        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 text-xs">
          {Object.entries(statusColors).map(([status, color]) => (
            <div key={status} className="flex items-center gap-1.5">
              <span className={`w-3 h-3 rounded ${color}`}></span>
              <span className="text-slate-400 capitalize">{status.replace('_', ' ')}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Sidebar: Unscheduled Content */}
      <div className="w-80 bg-slate-800/50 rounded-xl p-4">
        <h3 className="text-lg font-semibold text-white mb-4">
          📋 Unscheduled Content
        </h3>
        
        {loading ? (
          <div className="text-slate-500 text-center py-8">Loading...</div>
        ) : unscheduled.length === 0 ? (
          <div className="text-slate-500 text-center py-8">
            All content is scheduled! 🎉
          </div>
        ) : (
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {unscheduled.map(item => (
              <motion.div
                key={item.id}
                whileHover={{ x: 4 }}
                className="p-3 bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-start gap-2">
                  <span className="text-lg">{platformIcons[item.platform]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">
                      {item.title}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${statusColors[item.status]}`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
