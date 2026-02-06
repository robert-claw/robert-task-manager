'use client';

import { useEffect, useState } from 'react';
import type { Task, TaskStatus, TaskPriority } from '@/lib/tasks';

const AUTH_TOKEN = 'robert-secret-token'; // Will be configurable via env

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as TaskPriority,
    status: 'pending' as TaskStatus,
    createdBy: 'robert' as 'robert' | 'user',
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    try {
      const res = await fetch('/api/tasks', {
        headers: { 'Authorization': `Bearer ${AUTH_TOKEN}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  }

  async function createNewTask() {
    if (!newTask.title.trim()) return;
    
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AUTH_TOKEN}`
        },
        body: JSON.stringify(newTask)
      });
      
      if (res.ok) {
        await fetchTasks();
        setNewTask({
          title: '',
          description: '',
          priority: 'medium',
          status: 'pending',
          createdBy: 'robert',
        });
        setShowNewTask(false);
      }
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  }

  async function updateTaskStatus(id: string, status: TaskStatus) {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AUTH_TOKEN}`
        },
        body: JSON.stringify({ status })
      });
      
      if (res.ok) {
        await fetchTasks();
      }
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  }

  async function deleteTaskById(id: string) {
    if (!confirm('Delete this task?')) return;
    
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${AUTH_TOKEN}` }
      });
      
      if (res.ok) {
        await fetchTasks();
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  }

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'done': return 'bg-green-900/50 border-green-500';
      case 'in_progress': return 'bg-blue-900/50 border-blue-500';
      case 'rejected': return 'bg-red-900/50 border-red-500';
      default: return 'bg-gray-900/50 border-gray-500';
    }
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    const colors = {
      urgent: 'bg-red-500',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-gray-500',
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-bold ${colors[priority]} text-white`}>
        {priority.toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">🔧 Robert Task Manager</h1>
          <button
            onClick={() => setShowNewTask(!showNewTask)}
            className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded font-semibold"
          >
            + New Task
          </button>
        </div>

        {showNewTask && (
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Create New Task</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2"
                  placeholder="Task title..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 h-24"
                  placeholder="Task description..."
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-semibold mb-2">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as TaskPriority })}
                    className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold mb-2">Created By</label>
                  <select
                    value={newTask.createdBy}
                    onChange={(e) => setNewTask({ ...newTask, createdBy: e.target.value as 'robert' | 'user' })}
                    className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2"
                  >
                    <option value="robert">Robert (AI)</option>
                    <option value="user">User</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={createNewTask}
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-semibold"
                >
                  Create Task
                </button>
                <button
                  onClick={() => setShowNewTask(false)}
                  className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {tasks.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              No tasks yet. Create one to get started!
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className={`border-2 rounded-lg p-6 ${getStatusColor(task.status)}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold">{task.title}</h3>
                      {getPriorityBadge(task.priority)}
                      <span className="text-xs text-gray-400">
                        by {task.createdBy === 'robert' ? '🔧 Robert' : '👤 User'}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-gray-300 mb-3">{task.description}</p>
                    )}
                    <div className="text-xs text-gray-400">
                      Created: {new Date(task.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteTaskById(task.id)}
                    className="text-red-400 hover:text-red-300 text-sm ml-4"
                  >
                    🗑️ Delete
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateTaskStatus(task.id, 'in_progress')}
                    className={`px-3 py-1 rounded text-sm ${task.status === 'in_progress' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                  >
                    In Progress
                  </button>
                  <button
                    onClick={() => updateTaskStatus(task.id, 'done')}
                    className={`px-3 py-1 rounded text-sm ${task.status === 'done' ? 'bg-green-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                  >
                    Done
                  </button>
                  <button
                    onClick={() => updateTaskStatus(task.id, 'rejected')}
                    className={`px-3 py-1 rounded text-sm ${task.status === 'rejected' ? 'bg-red-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                  >
                    Rejected
                  </button>
                  <button
                    onClick={() => updateTaskStatus(task.id, 'pending')}
                    className={`px-3 py-1 rounded text-sm ${task.status === 'pending' ? 'bg-gray-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                  >
                    Pending
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
