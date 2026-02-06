'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Task, Assignee, NewTaskForm } from '@/lib/types';
import { fetchTasks, createTask, updateTask as apiUpdateTask } from '@/lib/api';
import { PageContainer, Header, Footer } from '@/components/layout';
import { TaskList, TaskForm, TaskTabs, ReviewModal } from '@/components/features/tasks';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Assignee>('leon');
  const [showNewTask, setShowNewTask] = useState(false);
  const [reviewTaskId, setReviewTaskId] = useState<string | null>(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = useCallback(async () => {
    try {
      const data = await fetchTasks();
      setTasks(data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCreateTask = useCallback(async (form: NewTaskForm) => {
    try {
      await createTask(form);
      loadTasks();
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  }, [loadTasks]);

  const handleUpdateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    try {
      await apiUpdateTask(id, updates);
      loadTasks();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  }, [loadTasks]);

  const handleReview = useCallback((approve: boolean, feedback: string) => {
    if (!reviewTaskId) return;
    
    handleUpdateTask(reviewTaskId, {
      status: approve ? 'approved' : 'changes_requested',
      feedback: feedback || undefined,
      reviewedAt: new Date().toISOString(),
    });
    
    setReviewTaskId(null);
  }, [reviewTaskId, handleUpdateTask]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
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
            INITIALIZING...
          </span>
        </motion.div>
      </div>
    );
  }

  return (
    <PageContainer>
      <Header onNewTask={() => setShowNewTask(true)} />
      
      <TaskTabs 
        tasks={tasks}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      <main className="relative max-w-5xl mx-auto px-4 py-6">
        <TaskList
          tasks={tasks}
          activeTab={activeTab}
          onUpdate={handleUpdateTask}
          onReview={setReviewTaskId}
        />
      </main>
      
      <Footer tasks={tasks} />
      
      <TaskForm
        isOpen={showNewTask}
        onClose={() => setShowNewTask(false)}
        onSubmit={handleCreateTask}
      />
      
      <ReviewModal
        isOpen={!!reviewTaskId}
        onClose={() => setReviewTaskId(null)}
        onSubmit={handleReview}
      />
    </PageContainer>
  );
}
