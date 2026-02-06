'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  useDroppable,
  useDraggable,
} from '@dnd-kit/core'
import {
  PlatformIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit3,
  Eye,
  AlertCircle,
  CheckCircle2,
  Rocket,
  ClipboardList,
  Calendar,
  Check,
  LayoutGrid,
  List,
  CalendarDays,
} from '@/components/ui/Icons'
import { useToast } from '@/components/ui/Toast'

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
  onContentClick?: (contentId: string) => void
}

type ViewMode = 'month' | 'week' | 'day'

const statusConfig: Record<string, { color: string; bgColor: string; icon: React.ElementType }> = {
  draft: { color: 'text-slate-400', bgColor: 'bg-slate-600', icon: Edit3 },
  ready_for_review: { color: 'text-yellow-400', bgColor: 'bg-yellow-500', icon: Eye },
  changes_requested: { color: 'text-orange-400', bgColor: 'bg-orange-500', icon: AlertCircle },
  approved: { color: 'text-green-400', bgColor: 'bg-green-500', icon: CheckCircle2 },
  scheduled: { color: 'text-blue-400', bgColor: 'bg-blue-500', icon: Clock },
  published: { color: 'text-purple-400', bgColor: 'bg-purple-500', icon: Rocket },
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const FULL_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const HOURS = Array.from({ length: 24 }, (_, i) => i)

// Draggable Content Item Component
function DraggableItem({ item, isOverlay = false }: { item: UnscheduledItem | CalendarEvent; isOverlay?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: 'contentId' in item ? item.contentId : item.id,
    data: { item },
  })

  const config = statusConfig[item.status] || statusConfig.draft
  const Icon = config.icon

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined

  if (isOverlay) {
    return (
      <div className="p-3 bg-slate-800 rounded-lg border-2 border-cyan-500 shadow-lg shadow-cyan-500/20 w-64">
        <div className="flex items-start gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center shrink-0">
            <PlatformIcon platform={item.platform} size={16} className="text-slate-300" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">{item.title}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs px-1.5 py-0.5 rounded flex items-center gap-1 ${config.bgColor}/20 ${config.color}`}>
                <Icon size={10} />
                {item.status.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`p-3 bg-slate-800 rounded-lg cursor-grab hover:bg-slate-700 transition-colors touch-none ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-start gap-2">
        <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center shrink-0">
          <PlatformIcon platform={item.platform} size={16} className="text-slate-300" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-white truncate">{item.title}</div>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs px-1.5 py-0.5 rounded flex items-center gap-1 ${config.bgColor}/20 ${config.color}`}>
              <Icon size={10} />
              {item.status.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Droppable Day Cell Component for Month View
function DroppableDay({
  date,
  isCurrentMonth,
  isToday,
  isSelected,
  events,
  onSelect,
  onContentClick,
}: {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  isSelected: boolean
  events: CalendarEvent[]
  onSelect: () => void
  onContentClick?: (contentId: string) => void
}) {
  const dateStr = date.toISOString().split('T')[0]
  const { setNodeRef, isOver } = useDroppable({
    id: `day-${dateStr}`,
    data: { date: dateStr },
  })

  return (
    <div
      ref={setNodeRef}
      onClick={onSelect}
      className={`
        min-h-[100px] p-2 rounded-lg border transition-all text-left cursor-pointer
        ${isCurrentMonth ? 'bg-slate-800/50' : 'bg-slate-900/50'}
        ${isToday ? 'border-cyan-500 border-2' : 'border-slate-700/50'}
        ${isSelected ? 'ring-2 ring-cyan-500' : ''}
        ${isOver ? 'border-cyan-400 border-2 bg-cyan-500/10' : ''}
        ${isCurrentMonth ? 'text-white' : 'text-slate-600'}
        hover:bg-slate-800
      `}
    >
      <span className={`
        text-sm font-medium inline-flex items-center justify-center
        ${isToday ? 'bg-cyan-500 text-black w-7 h-7 rounded-full' : ''}
      `}>
        {date.getDate()}
      </span>

      <div className="mt-1 space-y-1">
        {events.slice(0, 3).map(event => {
          const config = statusConfig[event.status] || statusConfig.draft
          return (
            <div
              key={event.id}
              onClick={(e) => {
                e.stopPropagation()
                onContentClick?.(event.contentId)
              }}
              className={`
                text-xs px-1.5 py-0.5 rounded truncate flex items-center gap-1 cursor-pointer
                ${config.bgColor} text-white hover:opacity-80 transition-opacity
              `}
              title={event.title}
            >
              <PlatformIcon platform={event.platform} size={10} />
              <span className="truncate">{event.title}</span>
            </div>
          )
        })}
        {events.length > 3 && (
          <div className="text-xs text-slate-500 px-1.5">
            +{events.length - 3} more
          </div>
        )}
      </div>
    </div>
  )
}

// Droppable Week Day Column Component
function DroppableWeekDay({
  day,
  events,
  onContentClick,
}: {
  day: Date
  events: CalendarEvent[]
  onContentClick?: (contentId: string) => void
}) {
  const dateStr = day.toISOString().split('T')[0]
  const { setNodeRef, isOver } = useDroppable({
    id: `day-${dateStr}`,
    data: { date: dateStr },
  })

  return (
    <div
      ref={setNodeRef}
      className={`bg-slate-800/30 rounded-lg p-2 min-h-[400px] transition-colors ${
        isOver ? 'bg-cyan-500/10 border-2 border-cyan-400' : 'border border-slate-700/50'
      }`}
    >
      {events.length === 0 ? (
        <div className="text-center text-slate-600 text-sm py-4">
          No content
        </div>
      ) : (
        <div className="space-y-2">
          {events.map(event => {
            const config = statusConfig[event.status] || statusConfig.draft
            return (
              <div
                key={event.id}
                onClick={() => onContentClick?.(event.contentId)}
                className={`p-2 rounded-lg cursor-pointer ${config.bgColor}/30 hover:opacity-80 transition-opacity`}
              >
                <div className="flex items-center gap-1 mb-1">
                  <PlatformIcon platform={event.platform} size={12} className="text-slate-300" />
                  <span className="text-xs text-slate-400">
                    {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="text-sm text-white truncate">{event.title}</div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function CalendarView({ selectedProject, onContentClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [unscheduled, setUnscheduled] = useState<UnscheduledItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [activeItem, setActiveItem] = useState<UnscheduledItem | CalendarEvent | null>(null)

  const toast = useToast()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Load view preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('calendar-view-mode')
    if (saved && ['month', 'week', 'day'].includes(saved)) {
      setViewMode(saved as ViewMode)
    }
  }, [])

  // Save view preference
  useEffect(() => {
    localStorage.setItem('calendar-view-mode', viewMode)
  }, [viewMode])

  // Fetch calendar data
  const fetchCalendarData = useCallback(async () => {
    setLoading(true)
    try {
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth()
      
      // Adjust date range based on view mode
      let start: string, end: string
      if (viewMode === 'month') {
        start = new Date(year, month, 1).toISOString()
        end = new Date(year, month + 1, 0).toISOString()
      } else if (viewMode === 'week') {
        const weekStart = new Date(currentDate)
        weekStart.setDate(currentDate.getDate() - currentDate.getDay())
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)
        start = weekStart.toISOString()
        end = weekEnd.toISOString()
      } else {
        start = new Date(year, month, currentDate.getDate()).toISOString()
        end = new Date(year, month, currentDate.getDate() + 1).toISOString()
      }

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
      toast.error('Failed to load calendar data')
    } finally {
      setLoading(false)
    }
  }, [currentDate, selectedProject, viewMode, toast])

  useEffect(() => {
    fetchCalendarData()
  }, [fetchCalendarData])

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const item = active.data.current?.item
    if (item) {
      setActiveItem(item)
    }
  }

  // Handle drag end - schedule content
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveItem(null)

    if (!over) return

    const overId = over.id as string
    if (!overId.startsWith('day-')) return

    const dateStr = overId.replace('day-', '')
    const contentId = active.id as string

    // Call API to update scheduledFor
    try {
      const res = await fetch(`/api/content/${contentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          scheduledFor: new Date(dateStr + 'T10:00:00').toISOString(),
          status: 'scheduled',
        }),
      })

      if (!res.ok) throw new Error('Failed to schedule')

      toast.success('Content Scheduled', `Scheduled for ${new Date(dateStr).toLocaleDateString()}`)
      fetchCalendarData()
    } catch (error) {
      console.error('Failed to schedule content:', error)
      toast.error('Failed to schedule content')
    }
  }

  // Generate calendar days for month view
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

  // Generate week days
  const generateWeekDays = () => {
    const days: Date[] = []
    const weekStart = new Date(currentDate)
    weekStart.setDate(currentDate.getDate() - currentDate.getDay())

    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart)
      day.setDate(weekStart.getDate() + i)
      days.push(day)
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
  const weekDays = generateWeekDays()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Navigation handlers
  const goToPrev = () => {
    const newDate = new Date(currentDate)
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7)
    } else {
      newDate.setDate(newDate.getDate() - 1)
    }
    setCurrentDate(newDate)
  }

  const goToNext = () => {
    const newDate = new Date(currentDate)
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + 1)
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7)
    } else {
      newDate.setDate(newDate.getDate() + 1)
    }
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Format header based on view mode
  const getHeaderText = () => {
    if (viewMode === 'month') {
      return `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`
    } else if (viewMode === 'week') {
      const weekStart = weekDays[0]
      const weekEnd = weekDays[6]
      if (weekStart.getMonth() === weekEnd.getMonth()) {
        return `${MONTHS[weekStart.getMonth()]} ${weekStart.getDate()} - ${weekEnd.getDate()}, ${weekStart.getFullYear()}`
      }
      return `${MONTHS[weekStart.getMonth()]} ${weekStart.getDate()} - ${MONTHS[weekEnd.getMonth()]} ${weekEnd.getDate()}, ${weekStart.getFullYear()}`
    } else {
      return `${FULL_DAYS[currentDate.getDay()]}, ${MONTHS[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 h-full">
        {/* Calendar Grid */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Calendar size={28} className="text-cyan-400" />
              <h2 className="text-2xl font-bold text-white">
                {getHeaderText()}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex bg-slate-800 rounded-lg p-1 mr-4">
                <button
                  onClick={() => setViewMode('day')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    viewMode === 'day' ? 'bg-cyan-500 text-black' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <List size={14} />
                  Day
                </button>
                <button
                  onClick={() => setViewMode('week')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    viewMode === 'week' ? 'bg-cyan-500 text-black' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <CalendarDays size={14} />
                  Week
                </button>
                <button
                  onClick={() => setViewMode('month')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    viewMode === 'month' ? 'bg-cyan-500 text-black' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LayoutGrid size={14} />
                  Month
                </button>
              </div>

              <button
                onClick={goToPrev}
                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white transition-colors"
                title="Previous"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={goToToday}
                className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-colors text-sm font-medium"
              >
                Today
              </button>
              <button
                onClick={goToNext}
                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white transition-colors"
                title="Next"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Calendar Content */}
          {viewMode === 'month' && (
            <>
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAYS.map(day => (
                  <div key={day} className="text-center text-sm font-medium text-slate-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 flex-1">
                {days.map(({ date, isCurrentMonth }, index) => {
                  const dayEvents = getEventsForDate(date)
                  const isToday = date.getTime() === today.getTime()
                  const isSelected = selectedDate?.getTime() === date.getTime()

                  return (
                    <DroppableDay
                      key={index}
                      date={date}
                      isCurrentMonth={isCurrentMonth}
                      isToday={isToday}
                      isSelected={isSelected}
                      events={dayEvents}
                      onSelect={() => setSelectedDate(date)}
                      onContentClick={onContentClick}
                    />
                  )
                })}
              </div>
            </>
          )}

          {viewMode === 'week' && (
            <>
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {weekDays.map((day, index) => {
                  const isToday = day.toDateString() === today.toDateString()
                  return (
                    <div key={index} className="text-center">
                      <div className="text-sm font-medium text-slate-500">{DAYS[day.getDay()]}</div>
                      <div className={`text-lg font-bold ${isToday ? 'text-cyan-400' : 'text-white'}`}>
                        {day.getDate()}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Week Grid */}
              <div className="flex-1 overflow-auto">
                <div className="grid grid-cols-7 gap-2">
                  {weekDays.map((day, index) => (
                    <DroppableWeekDay
                      key={index}
                      day={day}
                      events={getEventsForDate(day)}
                      onContentClick={onContentClick}
                    />
                  ))}
                </div>
              </div>
            </>
          )}

          {viewMode === 'day' && (
            <div className="flex-1 overflow-auto">
              <div className="space-y-1">
                {HOURS.map(hour => {
                  const hourEvents = events.filter(event => {
                    const eventDate = new Date(event.date)
                    return eventDate.toDateString() === currentDate.toDateString() && eventDate.getHours() === hour
                  })

                  return (
                    <div key={hour} className="flex gap-4">
                      <div className="w-16 text-sm text-slate-500 py-2">
                        {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                      </div>
                      <div className="flex-1 bg-slate-800/30 rounded-lg p-2 min-h-[60px] border border-slate-700/50">
                        {hourEvents.length === 0 ? (
                          <div className="text-slate-600 text-sm">—</div>
                        ) : (
                          <div className="space-y-2">
                            {hourEvents.map(event => {
                              const config = statusConfig[event.status] || statusConfig.draft
                              return (
                                <div
                                  key={event.id}
                                  onClick={() => onContentClick?.(event.contentId)}
                                  className={`p-3 rounded-lg cursor-pointer ${config.bgColor} flex items-center gap-3 hover:opacity-80 transition-opacity`}
                                >
                                  <PlatformIcon platform={event.platform} size={20} className="text-white" />
                                  <div className="flex-1 min-w-0">
                                    <div className="text-white font-medium truncate">{event.title}</div>
                                    <div className="text-xs text-white/70">{event.status.replace('_', ' ')}</div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-6 p-4 bg-slate-800/30 rounded-lg">
            {Object.entries(statusConfig).map(([status, config]) => {
              const Icon = config.icon
              return (
                <div key={status} className="flex items-center gap-1.5">
                  <span className={`w-3 h-3 rounded ${config.bgColor}`}></span>
                  <Icon size={12} className={config.color} />
                  <span className="text-slate-400 text-xs capitalize">{status.replace('_', ' ')}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Sidebar: Unscheduled Content */}
        <div className="w-80 bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList size={20} className="text-cyan-400" />
            <h3 className="text-lg font-semibold text-white">
              Unscheduled Content
            </h3>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-3 bg-slate-800 rounded-lg animate-pulse">
                  <div className="h-4 bg-slate-700 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-slate-700 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : unscheduled.length === 0 ? (
            <div className="text-center py-8 flex-1 flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                <Check size={24} className="text-green-400" />
              </div>
              <p className="text-slate-400">All content is scheduled!</p>
              <p className="text-slate-500 text-sm mt-1">Great job staying on top of things</p>
            </div>
          ) : (
            <div className="space-y-2 flex-1 overflow-y-auto pr-1">
              {unscheduled.map(item => (
                <DraggableItem key={item.id} item={item} />
              ))}
            </div>
          )}

          {unscheduled.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-700">
              <p className="text-xs text-cyan-400 text-center font-medium">
                ↕ Drag content to calendar to schedule
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeItem && <DraggableItem item={activeItem} isOverlay />}
      </DragOverlay>
    </DndContext>
  )
}
