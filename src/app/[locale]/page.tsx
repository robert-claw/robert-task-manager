'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Task, Assignee } from '@/lib/types';
import { TaskTabs, TaskList, TaskForm, ReviewModal } from '@/components/features/tasks';

export default function TasksPage() {
  const t = useTranslations('common');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Assignee>('leon');
  const [showNewTask, setShowNewTask] = useState(false);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
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

  async function createTask(data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) {
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

  const leonTasks = tasks.filter(t => t.assignedTo === 'leon');
  const robertTasks = tasks.filter(t => t.assignedTo === 'robert');
  const activeTasks = activeTab === 'leon' ? leonTasks : robertTasks;
  const tasksT = useTranslations('tasks');

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <motion.div 
          className="flex items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div 
            className="w-2 h-2 bg-cyan-400 rounded-full"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
          />
          <span className="text-cyan-400 font-mono text-sm tracking-wider">
            {t('loading')}
          </span>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <TaskTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        leonCount={leonTasks.length}
        robertCount={robertTasks.length}
        onNewTask={() => setShowNewTask(true)}
      />

      <TaskList
        tasks={activeTasks}
        expandedTask={expandedTask}
        onToggleExpand={(id) => setExpandedTask(expandedTask === id ? null : id)}
        onUpdate={updateTask}
        onReview={(task) => setReviewTask(task)}
        emptyMessage={activeTab === 'leon' ? tasksT('empty.forLeon') : tasksT('empty.forRobert')}
      />

      {showNewTask && (
        <TaskForm
          defaultAssignee={activeTab}
          onSubmit={createTask}
          onClose={() => setShowNewTask(false)}
        />
      )}

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
        />
      )}
    </>
  );
}
