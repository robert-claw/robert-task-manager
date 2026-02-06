'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { TaskType, TaskPriority, Assignee, NewTaskForm } from '@/lib/types';
import { priorityStyles } from '@/lib/utils';
import { Modal, Button, Input, Textarea } from '@/components/ui';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: NewTaskForm) => void;
}

export function TaskForm({ isOpen, onClose, onSubmit }: TaskFormProps) {
  const t = useTranslations('tasks');
  const [form, setForm] = useState<NewTaskForm>({
    title: '',
    description: '',
    priority: 'medium',
    type: 'task',
    assignedTo: 'leon',
  });

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    onSubmit(form);
    setForm({
      title: '',
      description: '',
      priority: 'medium',
      type: 'task',
      assignedTo: 'leon',
    });
    onClose();
  };

  const assigneeOptions: { value: Assignee; label: string; icon: string }[] = [
    { value: 'leon', label: 'LEON', icon: '👤' },
    { value: 'robert', label: 'ROBERT', icon: '🦞' },
  ];

  const typeOptions: { value: TaskType; label: string; icon: string }[] = [
    { value: 'task', label: 'TASK', icon: '📋' },
    { value: 'content', label: 'CONTENT', icon: '📝' },
    { value: 'blog', label: 'BLOG', icon: '📰' },
  ];

  const priorityOptions: TaskPriority[] = ['low', 'medium', 'high', 'urgent'];

  const getAssigneeStyle = (value: Assignee, isSelected: boolean) => {
    if (!isSelected) return 'py-2 rounded-lg text-sm font-mono bg-slate-800 border-2 border-slate-700 text-slate-400 hover:border-slate-600';
    return value === 'leon' 
      ? 'py-2 rounded-lg text-sm font-mono bg-orange-500/20 border-2 border-orange-500 text-orange-400'
      : 'py-2 rounded-lg text-sm font-mono bg-cyan-500/20 border-2 border-cyan-500 text-cyan-400';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('newTask')}
      footer={
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            {t('cancel')}
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit} 
            disabled={!form.title.trim()}
            className="flex-1"
          >
            {t('create')}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Assignee selection */}
        <div className="grid grid-cols-2 gap-2">
          {assigneeOptions.map(option => (
            <motion.button
              key={option.value}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setForm({ ...form, assignedTo: option.value })}
              className={getAssigneeStyle(option.value, form.assignedTo === option.value)}
            >
              {option.icon} {option.label}
            </motion.button>
          ))}
        </div>

        {/* Type selection */}
        <div className="grid grid-cols-3 gap-2">
          {typeOptions.map(option => (
            <motion.button
              key={option.value}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setForm({ ...form, type: option.value })}
              className={`
                py-2 rounded-lg text-xs font-mono transition
                ${form.type === option.value 
                  ? 'bg-cyan-500/20 border-2 border-cyan-500 text-cyan-400'
                  : 'bg-slate-800 border-2 border-slate-700 text-slate-400 hover:border-slate-600'
                }
              `}
            >
              {option.icon} {option.label}
            </motion.button>
          ))}
        </div>

        {/* Title */}
        <Input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder={t('titlePlaceholder')}
        />

        {/* Description */}
        <Textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder={t('descriptionPlaceholder')}
          className="h-20"
        />

        {/* Priority selection */}
        <div className="grid grid-cols-4 gap-1">
          {priorityOptions.map(p => (
            <motion.button
              key={p}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setForm({ ...form, priority: p })}
              className={`
                py-1.5 rounded text-[10px] font-mono transition
                ${form.priority === p
                  ? priorityStyles[p]
                  : 'bg-slate-800 border border-slate-700 text-slate-500'
                }
              `}
            >
              {p.toUpperCase()}
            </motion.button>
          ))}
        </div>
      </div>
    </Modal>
  );
}

export default TaskForm;
