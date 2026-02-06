'use client';

import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '@/lib/types';
import { TaskCard } from './TaskCard';

interface TaskListProps {
  tasks: Task[];
  expandedTask: string | null;
  onToggleExpand: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onReview: (task: Task) => void;
  emptyMessage: string;
}

export function TaskList({ 
  tasks, 
  expandedTask, 
  onToggleExpand, 
  onUpdate, 
  onReview,
  emptyMessage 
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-16"
      >
        <motion.div 
          className="text-5xl mb-4 opacity-30"
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
        >
          📋
        </motion.div>
        <p className="text-slate-500 font-mono text-sm">{emptyMessage}</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3 py-4">
      <AnimatePresence mode="popLayout">
        {tasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
          >
            <TaskCard
              task={task}
              isExpanded={expandedTask === task.id}
              onToggle={() => onToggleExpand(task.id)}
              onUpdate={(updates) => onUpdate(task.id, updates)}
              onReview={() => onReview(task)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default TaskList;
