'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Task, TaskType, TaskPriority, Assignee } from '@/lib/types';

interface TaskFormProps {
  defaultAssignee: Assignee;
  onSubmit: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}

const typeOptions: { value: TaskType; label: string; icon: string }[] = [
  { value: 'task', label: 'TASK', icon: '📋' },
  { value: 'content', label: 'CONTENT', icon: '📝' },
  { value: 'blog', label: 'BLOG', icon: '📰' },
];

const priorityOptions: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'low', label: 'LOW', color: 'bg-slate-600' },
  { value: 'medium', label: 'MEDIUM', color: 'bg-blue-600' },
  { value: 'high', label: 'HIGH', color: 'bg-orange-600' },
  { value: 'urgent', label: 'URGENT', color: 'bg-red-600' },
];

export function TaskForm({ defaultAssignee, onSubmit, onClose }: TaskFormProps) {
  const t = useTranslations('tasks');
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium' as TaskPriority,
    type: 'task' as TaskType,
    assignedTo: defaultAssignee,
  });

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    onSubmit({
      ...form,
      status: 'pending',
      createdBy: defaultAssignee === 'leon' ? 'robert' : 'leon',
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-cyan-400">{t('newTask')}</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-4">
            {/* Assignee */}
            <div className="grid grid-cols-2 gap-2">
              {(['leon', 'robert'] as Assignee[]).map((assignee) => (
                <button
                  key={assignee}
                  onClick={() => setForm({ ...form, assignedTo: assignee })}
                  className={`
                    py-2 rounded-lg text-sm font-mono transition
                    ${form.assignedTo === assignee
                      ? assignee === 'leon'
                        ? 'bg-orange-500/20 border-2 border-orange-500 text-orange-400'
                        : 'bg-cyan-500/20 border-2 border-cyan-500 text-cyan-400'
                      : 'bg-slate-800 border-2 border-slate-700 text-slate-400'
                    }
                  `}
                >
                  {assignee === 'leon' ? '👤 LEON' : '🦞 ROBERT'}
                </button>
              ))}
            </div>

            {/* Type */}
            <div className="grid grid-cols-3 gap-2">
              {typeOptions.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setForm({ ...form, type: type.value })}
                  className={`
                    py-2 rounded-lg text-xs font-mono transition
                    ${form.type === type.value
                      ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-400'
                      : 'bg-slate-800 border border-slate-700 text-slate-400'
                    }
                  `}
                >
                  {type.icon} {type.label}
                </button>
              ))}
            </div>

            {/* Title */}
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder={t('titlePlaceholder')}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />

            {/* Description */}
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder={t('descriptionPlaceholder')}
              rows={3}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
            />

            {/* Priority */}
            <div className="grid grid-cols-4 gap-2">
              {priorityOptions.map((priority) => (
                <button
                  key={priority.value}
                  onClick={() => setForm({ ...form, priority: priority.value })}
                  className={`
                    py-1.5 rounded text-[10px] font-mono transition
                    ${form.priority === priority.value
                      ? `${priority.color} text-white`
                      : 'bg-slate-800 border border-slate-700 text-slate-500'
                    }
                  `}
                >
                  {priority.label}
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-700 flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700 transition text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!form.title.trim()}
              className="flex-1 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium"
            >
              {t('createTask')}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default TaskForm;
