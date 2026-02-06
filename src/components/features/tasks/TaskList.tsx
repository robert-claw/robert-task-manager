'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Task, Assignee } from '@/lib/types';
import { TaskCard } from './TaskCard';

interface TaskListProps {
  tasks: Task[];
  activeTab: Assignee;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onReview: (taskId: string) => void;
}

export function TaskList({ tasks, activeTab, onUpdate, onReview }: TaskListProps) {
  const t = useTranslations('tasks');
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  const filteredTasks = tasks.filter(task => task.assignedTo === activeTab);

  if (filteredTasks.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-16"
      >
        <motion.div 
          className="text-4xl mb-3 opacity-30"
          animate={{ y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          {activeTab === 'leon' ? '👤' : '🦞'}
        </motion.div>
        <p className="text-slate-500 font-mono text-sm">{t('noTasks')}</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {filteredTasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ delay: index * 0.05 }}
          >
            <TaskCard
              task={task}
              isExpanded={expandedTask === task.id}
              onToggle={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
              onUpdate={(updates) => onUpdate(task.id, updates)}
              onReview={() => onReview(task.id)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default TaskList;
