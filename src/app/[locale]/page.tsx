'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Task, Assignee, TaskStatus, TaskPriority} from '@/lib/types';
import { statusConfig, typeConfig } from '@/lib/utils';

type FilterStatus = TaskStatus | 'all' | 'active';

export default function TasksPage() {
  const t = useTranslations('tasks');
  const tc = useTranslations('common');
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Assignee>('leon');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [showNewTask, setShowNewTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [reviewTask, setReviewTask] = useState<Task | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    try {
      const res = await fetch('/api/tasks');
      if (res.ok) setTasks(await res.json());
    } catch (e) {
      console.error('Failed to fetch tasks:', e);
    } finally {
      setLoading(false);
    }
  }

  async function createTask(data: Partial<Task>) {
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    setShowNewTask(false);
    fetchTasks();
  }

  async function updateTask(id: string, updates: Partial<Task>) {
    await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    fetchTasks();
  }

  // Filter tasks
  const filteredTasks = useMemo(() => {
    let filtered = tasks.filter(task => task.assignedTo === activeTab);
    
    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        filtered = filtered.filter(t => !['done', 'published', 'rejected'].includes(t.status));
      } else {
        filtered = filtered.filter(t => t.status === statusFilter);
      }
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(query) || 
        t.description?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [tasks, activeTab, statusFilter, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const tabTasks = tasks.filter(t => t.assignedTo === activeTab);
    return {
      total: tabTasks.length,
      pending: tabTasks.filter(t => t.status === 'pending').length,
      inProgress: tabTasks.filter(t => t.status === 'in_progress').length,
      review: tabTasks.filter(t => t.status === 'ready_for_review').length,
      approved: tabTasks.filter(t => t.status === 'approved').length,
      done: tabTasks.filter(t => ['done', 'published'].includes(t.status)).length,
    };
  }, [tasks, activeTab]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div 
          className="flex items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div 
            className="w-3 h-3 bg-cyan-400 rounded-full"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
          />
          <span className="text-cyan-400 font-mono text-sm tracking-wider">
            {tc('loading')}
          </span>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="py-6 space-y-6">
      {/* Header with tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex gap-2">
          {(['leon', 'robert'] as Assignee[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                px-5 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center gap-2
                ${activeTab === tab 
                  ? tab === 'leon'
                    ? 'bg-orange-500/20 text-orange-400 border-2 border-orange-500/50 shadow-lg shadow-orange-500/10'
                    : 'bg-cyan-500/20 text-cyan-400 border-2 border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                  : 'bg-slate-800/50 text-slate-400 border-2 border-transparent hover:border-slate-700'
                }
              `}
            >
              <span className="text-lg">{tab === 'leon' ? '👤' : '🦞'}</span>
              <span>{tab === 'leon' ? t('tabs.forLeon') : t('tabs.forRobert')}</span>
              <span className={`
                ml-1 px-2 py-0.5 text-xs rounded-full
                ${activeTab === tab 
                  ? tab === 'leon' ? 'bg-orange-500/30' : 'bg-cyan-500/30'
                  : 'bg-slate-700'
                }
              `}>
                {tasks.filter(t => t.assignedTo === tab).length}
              </span>
            </button>
          ))}
        </div>
        
        <button
          onClick={() => setShowNewTask(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-medium rounded-xl hover:from-cyan-400 hover:to-cyan-500 transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-2"
        >
          <span className="text-lg">+</span>
          {t('newTask')}
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { key: 'total', label: 'Total', value: stats.total, color: 'slate' },
          { key: 'pending', label: t('status.pending'), value: stats.pending, color: 'slate' },
          { key: 'inProgress', label: t('status.in_progress'), value: stats.inProgress, color: 'cyan' },
          { key: 'review', label: t('status.ready_for_review'), value: stats.review, color: 'amber' },
          { key: 'approved', label: t('status.approved'), value: stats.approved, color: 'emerald' },
          { key: 'done', label: t('status.done'), value: stats.done, color: 'violet' },
        ].map(stat => (
          <div 
            key={stat.key}
            className={`
              p-3 rounded-xl border transition-all cursor-pointer
              ${stat.color === 'slate' ? 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600' : ''}
              ${stat.color === 'cyan' ? 'bg-cyan-500/10 border-cyan-500/30 hover:border-cyan-500/50' : ''}
              ${stat.color === 'amber' ? 'bg-amber-500/10 border-amber-500/30 hover:border-amber-500/50' : ''}
              ${stat.color === 'emerald' ? 'bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/50' : ''}
              ${stat.color === 'violet' ? 'bg-violet-500/10 border-violet-500/30 hover:border-violet-500/50' : ''}
            `}
          >
            <div className={`text-2xl font-bold ${
              stat.color === 'slate' ? 'text-slate-200' :
              stat.color === 'cyan' ? 'text-cyan-400' :
              stat.color === 'amber' ? 'text-amber-400' :
              stat.color === 'emerald' ? 'text-emerald-400' :
              'text-violet-400'
            }`}>
              {stat.value}
            </div>
            <div className="text-xs text-slate-500 font-mono truncate">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Search tasks..."
            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
          />
        </div>
        
        {/* Status filter */}
        <div className="flex gap-2 flex-wrap">
          {[
            { value: 'all', label: 'All' },
            { value: 'active', label: 'Active' },
            { value: 'ready_for_review', label: '📋 Review' },
            { value: 'approved', label: '✓ Approved' },
          ].map(filter => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value as FilterStatus)}
              className={`
                px-3 py-2 rounded-lg text-xs font-mono transition-all
                ${statusFilter === filter.value
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                  : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:border-slate-600'
                }
              `}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Task list */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredTasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="text-5xl mb-4 opacity-30">📋</div>
              <p className="text-slate-500 font-mono text-sm">
                {searchQuery ? 'No tasks match your search' : activeTab === 'leon' ? t('empty.forLeon') : t('empty.forRobert')}
              </p>
            </motion.div>
          ) : (
            filteredTasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                onView={() => setSelectedTask(task)}
                onReview={() => setReviewTask(task)}
                onStatusChange={(status) => updateTask(task.id, { status })}
                t={t}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* New Task Modal */}
      <AnimatePresence>
        {showNewTask && (
          <NewTaskModal
            defaultAssignee={activeTab}
            onSubmit={createTask}
            onClose={() => setShowNewTask(false)}
            t={t}
          />
        )}
      </AnimatePresence>

      {/* Task Detail Modal */}
      <AnimatePresence>
        {selectedTask && (
          <TaskDetailModal
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onStatusChange={(status) => {
              updateTask(selectedTask.id, { status });
              setSelectedTask(null);
            }}
            onReview={() => {
              setReviewTask(selectedTask);
              setSelectedTask(null);
            }}
            t={t}
          />
        )}
      </AnimatePresence>

      {/* Review Modal */}
      <AnimatePresence>
        {reviewTask && (
          <ReviewModal
            task={reviewTask}
            onSubmit={(approve, feedback) => {
              updateTask(reviewTask.id, {
                status: approve ? 'approved' : 'changes_requested',
                feedback: feedback || undefined,
                reviewedAt: new Date().toISOString()
              });
              setReviewTask(null);
            }}
            onClose={() => setReviewTask(null)}
            t={t}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Task Card Component
function TaskCard({ task, index, onView, onReview, onStatusChange, t }: {
  task: Task;
  index: number;
  onView: () => void;
  onReview: () => void;
  onStatusChange: (status: TaskStatus) => void;
  t: ReturnType<typeof useTranslations>;
}) {
  const status = statusConfig[task.status];
  const type = typeConfig[task.type || 'task'];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ delay: index * 0.03 }}
      className={`
        p-4 rounded-xl border bg-gradient-to-r ${status.bg}
        hover:scale-[1.01] transition-transform cursor-pointer
      `}
      onClick={onView}
    >
      <div className="flex items-start gap-4">
        {/* Status icon */}
        <div className={`text-2xl ${status.color}`}>{status.icon}</div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-300">
              {type.icon} {type.label}
            </span>
            {task.priority === 'urgent' && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 animate-pulse">
                🔴 {t('priority.urgent')}
              </span>
            )}
            {task.priority === 'high' && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400">
                {t('priority.high')}
              </span>
            )}
          </div>
          
          <h3 className="font-semibold text-white mb-1">{task.title}</h3>
          {task.description && (
            <p className="text-sm text-slate-400 line-clamp-2">{task.description}</p>
          )}
          
          {task.feedback && (
            <div className="mt-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <p className="text-xs text-amber-400">💬 {task.feedback}</p>
            </div>
          )}
        </div>
        
        {/* Right side: status & actions */}
        <div className="flex flex-col items-end gap-2">
          <span className={`text-xs font-mono px-2 py-1 rounded-lg ${status.color} bg-slate-900/50`}>
            {t(`status.${task.status}`)}
          </span>
          
          {/* Quick actions */}
          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
            {task.status === 'ready_for_review' && (
              <button
                onClick={onReview}
                className="px-3 py-1.5 text-xs rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition"
              >
                {t('review.title')}
              </button>
            )}
            {task.status === 'pending' && (
              <button
                onClick={() => onStatusChange('in_progress')}
                className="px-3 py-1.5 text-xs rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition"
              >
                {t('actions.start')}
              </button>
            )}
            {task.status === 'approved' && (
              <button
                onClick={() => onStatusChange('published')}
                className="px-3 py-1.5 text-xs rounded-lg bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 transition"
              >
                {t('actions.publish')}
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// New Task Modal
function NewTaskModal({ defaultAssignee, onSubmit, onClose, t }: {
  defaultAssignee: Assignee;
  onSubmit: (data: Partial<Task>) => void;
  onClose: () => void;
  t: ReturnType<typeof useTranslations>;
}) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium' as TaskPriority,
    type: 'task' as Task['type'],
    assignedTo: defaultAssignee,
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-cyan-400">{t('newTask')}</h2>
        </div>
        
        <div className="p-6 space-y-5">
          {/* Assignee */}
          <div className="grid grid-cols-2 gap-3">
            {(['leon', 'robert'] as Assignee[]).map((assignee) => (
              <button
                key={assignee}
                onClick={() => setForm({ ...form, assignedTo: assignee })}
                className={`
                  py-3 rounded-xl text-sm font-medium transition-all
                  ${form.assignedTo === assignee
                    ? assignee === 'leon'
                      ? 'bg-orange-500/20 border-2 border-orange-500 text-orange-400'
                      : 'bg-cyan-500/20 border-2 border-cyan-500 text-cyan-400'
                    : 'bg-slate-800 border-2 border-slate-700 text-slate-400 hover:border-slate-600'
                  }
                `}
              >
                {assignee === 'leon' ? '👤 Leon' : '🦞 Robert'}
              </button>
            ))}
          </div>

          {/* Type */}
          <div className="grid grid-cols-3 gap-2">
            {(['task', 'content', 'blog'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setForm({ ...form, type })}
                className={`
                  py-2.5 rounded-xl text-xs font-mono transition-all
                  ${form.type === type
                    ? 'bg-cyan-500/20 border-2 border-cyan-500/50 text-cyan-400'
                    : 'bg-slate-800 border-2 border-slate-700 text-slate-400 hover:border-slate-600'
                  }
                `}
              >
                {typeConfig[type].icon} {typeConfig[type].label}
              </button>
            ))}
          </div>

          {/* Title */}
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder={t('titlePlaceholder')}
            className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
          />

          {/* Description */}
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder={t('descriptionPlaceholder')}
            rows={3}
            className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition resize-none"
          />

          {/* Priority */}
          <div className="grid grid-cols-4 gap-2">
            {(['low', 'medium', 'high', 'urgent'] as TaskPriority[]).map((priority) => (
              <button
                key={priority}
                onClick={() => setForm({ ...form, priority })}
                className={`
                  py-2 rounded-xl text-xs font-mono transition-all
                  ${form.priority === priority
                    ? priority === 'urgent' ? 'bg-red-500 text-white' :
                      priority === 'high' ? 'bg-orange-500 text-white' :
                      priority === 'medium' ? 'bg-blue-500 text-white' :
                      'bg-slate-500 text-white'
                    : 'bg-slate-800 border border-slate-700 text-slate-500 hover:border-slate-600'
                  }
                `}
              >
                {t(`priority.${priority}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-slate-700 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-400 hover:bg-slate-700 transition font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => form.title.trim() && onSubmit({ ...form, status: 'pending', createdBy: form.assignedTo === 'leon' ? 'robert' : 'leon' })}
            disabled={!form.title.trim()}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-medium hover:from-cyan-400 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {t('createTask')}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Task Detail Modal
function TaskDetailModal({ task, onClose, onStatusChange, onReview, t }: {
  task: Task;
  onClose: () => void;
  onStatusChange: (status: TaskStatus) => void;
  onReview: () => void;
  t: ReturnType<typeof useTranslations>;
}) {
  const status = statusConfig[task.status];
  const type = typeConfig[task.type || 'task'];
  
  const statuses: TaskStatus[] = ['pending', 'in_progress', 'ready_for_review', 'changes_requested', 'approved', 'published', 'done', 'rejected'];
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-700 flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-2xl ${status.color}`}>{status.icon}</span>
              <span className="text-xs px-2 py-1 rounded-full bg-slate-700/50 text-slate-300">
                {type.icon} {type.label}
              </span>
              <span className={`text-xs font-mono px-2 py-1 rounded-lg ${status.color} bg-slate-800`}>
                {t(`status.${task.status}`)}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white">{task.title}</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">×</button>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          {task.description && (
            <div>
              <h3 className="text-xs font-mono text-slate-500 mb-2">{t('description')}</h3>
              <p className="text-slate-300 whitespace-pre-wrap">{task.description}</p>
            </div>
          )}
          
          {/* Feedback */}
          {task.feedback && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <h3 className="text-xs font-mono text-amber-500 mb-2">{t('feedback')}</h3>
              <p className="text-amber-200">{task.feedback}</p>
            </div>
          )}
          
          {/* Result */}
          {task.result && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <h3 className="text-xs font-mono text-emerald-500 mb-2">{t('result')}</h3>
              <p className="text-emerald-200">{task.result}</p>
            </div>
          )}
          
          {/* Links */}
          {(task.contentUrl || task.previewUrl) && (
            <div className="flex gap-3">
              {task.contentUrl && (
                <a 
                  href={task.contentUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg bg-slate-800 text-cyan-400 hover:bg-slate-700 transition text-sm"
                >
                  📎 {t('viewContent')}
                </a>
              )}
              {task.previewUrl && (
                <a 
                  href={task.previewUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg bg-slate-800 text-violet-400 hover:bg-slate-700 transition text-sm"
                >
                  👁 {t('preview')}
                </a>
              )}
            </div>
          )}
          
          {/* Status selector */}
          <div>
            <h3 className="text-xs font-mono text-slate-500 mb-3">Change Status</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {statuses.map((s) => {
                const sConfig = statusConfig[s];
                return (
                  <button
                    key={s}
                    onClick={() => onStatusChange(s)}
                    className={`
                      p-2 rounded-lg text-xs font-mono transition-all flex items-center gap-1 justify-center
                      ${task.status === s
                        ? `bg-gradient-to-r ${sConfig.bg} ${sConfig.color} border-2`
                        : 'bg-slate-800/50 text-slate-500 hover:bg-slate-800 border border-slate-700'
                      }
                    `}
                  >
                    <span>{sConfig.icon}</span>
                    <span className="truncate">{t(`status.${s}`)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Footer with actions */}
        <div className="p-6 border-t border-slate-700 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-400 hover:bg-slate-700 transition font-medium"
          >
            Close
          </button>
          {task.status === 'ready_for_review' && (
            <button
              onClick={onReview}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium hover:from-amber-400 hover:to-orange-400 transition"
            >
              {t('review.title')}
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// Review Modal
function ReviewModal({ task, onSubmit, onClose, t }: {
  task: Task;
  onSubmit: (approve: boolean, feedback: string) => void;
  onClose: () => void;
  t: ReturnType<typeof useTranslations>;
}) {
  const [feedback, setFeedback] = useState('');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-amber-400">{t('review.title')}</h2>
        </div>
        
        <div className="p-6 space-y-5">
          {/* Task summary */}
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
            <h3 className="font-semibold text-white mb-1">{task.title}</h3>
            {task.description && (
              <p className="text-sm text-slate-400">{task.description}</p>
            )}
          </div>
          
          {/* Feedback input */}
          <div>
            <label className="text-xs font-mono text-slate-500 mb-2 block">
              {t('feedback')} (optional)
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder={t('review.feedbackPlaceholder')}
              rows={4}
              className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition resize-none"
            />
          </div>
        </div>
        
        <div className="p-6 border-t border-slate-700 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-400 hover:bg-slate-700 transition font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(false, feedback)}
            className="flex-1 py-3 rounded-xl bg-rose-500/20 border-2 border-rose-500/50 text-rose-400 hover:bg-rose-500/30 transition font-medium"
          >
            {t('review.requestChanges')}
          </button>
          <button
            onClick={() => onSubmit(true, feedback)}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-medium hover:from-emerald-400 hover:to-green-400 transition"
          >
            ✓ {t('review.approve')}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
