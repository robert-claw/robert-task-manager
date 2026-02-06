'use client';

import { useEffect, useState } from 'react';
import type { Task, TaskStatus, TaskPriority } from '@/lib/tasks';

type TaskAssignee = 'robert' | 'leon';

interface ExtendedTask extends Task {
  assignedTo: TaskAssignee;
  result?: string;
}

export default function Home() {
  const [tasks, setTasks] = useState<ExtendedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'leon' | 'robert'>('leon');
  const [showNewTask, setShowNewTask] = useState(false);
  const [showResult, setShowResult] = useState<string | null>(null);
  const [resultText, setResultText] = useState('');
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as TaskPriority,
    assignedTo: 'leon' as TaskAssignee,
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    try {
      const res = await fetch('/api/tasks');
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTask,
          status: 'pending',
          createdBy: 'robert', // Tasks created via UI are from Robert for now
        })
      });
      
      if (res.ok) {
        await fetchTasks();
        setNewTask({ title: '', description: '', priority: 'medium', assignedTo: 'leon' });
        setShowNewTask(false);
      }
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  }

  async function updateTask(id: string, updates: Partial<ExtendedTask>) {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) await fetchTasks();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  }

  async function submitResult(id: string) {
    await updateTask(id, { result: resultText, status: 'done' });
    setShowResult(null);
    setResultText('');
  }

  const leonTasks = tasks.filter(t => t.assignedTo === 'leon' || (!t.assignedTo && t.createdBy === 'robert'));
  const robertTasks = tasks.filter(t => t.assignedTo === 'robert' || (!t.assignedTo && t.createdBy === 'leon'));

  const getStatusConfig = (status: TaskStatus) => {
    const configs = {
      pending: { bg: 'from-amber-500/20 to-orange-500/20', border: 'border-amber-500/50', glow: 'shadow-amber-500/20', icon: '◇', label: 'PENDING' },
      in_progress: { bg: 'from-cyan-500/20 to-blue-500/20', border: 'border-cyan-500/50', glow: 'shadow-cyan-500/20', icon: '◈', label: 'IN PROGRESS' },
      done: { bg: 'from-emerald-500/20 to-green-500/20', border: 'border-emerald-500/50', glow: 'shadow-emerald-500/20', icon: '◆', label: 'COMPLETE' },
      rejected: { bg: 'from-red-500/20 to-rose-500/20', border: 'border-red-500/50', glow: 'shadow-red-500/20', icon: '◇', label: 'REJECTED' },
    };
    return configs[status] || configs.pending;
  };

  const getPriorityConfig = (priority: TaskPriority) => {
    const configs = {
      urgent: { color: 'text-red-400', bg: 'bg-red-500/20', pulse: true },
      high: { color: 'text-orange-400', bg: 'bg-orange-500/20', pulse: false },
      medium: { color: 'text-yellow-400', bg: 'bg-yellow-500/20', pulse: false },
      low: { color: 'text-slate-400', bg: 'bg-slate-500/20', pulse: false },
    };
    return configs[priority] || configs.medium;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
          <span className="text-cyan-400 font-mono text-sm tracking-wider">INITIALIZING SYSTEMS...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* Animated background grid */}
      <div className="fixed inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }} />
      </div>

      {/* Header */}
      <header className="relative border-b border-cyan-500/20 bg-slate-900/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <span className="text-4xl">🦞</span>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">
                  <span className="text-cyan-400">ROBERT</span>
                  <span className="text-slate-400"> × </span>
                  <span className="text-orange-400">LEON</span>
                </h1>
                <p className="text-xs text-slate-500 font-mono tracking-wider">TASK SYNCHRONIZATION INTERFACE v1.0</p>
              </div>
            </div>
            <button
              onClick={() => setShowNewTask(true)}
              className="group relative px-4 py-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-lg font-mono text-sm text-cyan-400 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20 transition-all"
            >
              <span className="relative z-10">+ NEW TASK</span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
            </button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="relative border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('leon')}
              className={`relative px-6 py-4 font-mono text-sm tracking-wider transition-all ${
                activeTab === 'leon'
                  ? 'text-orange-400'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <span>👤</span>
                <span>TASKS FOR LEON</span>
                <span className={`px-2 py-0.5 rounded text-xs ${activeTab === 'leon' ? 'bg-orange-500/20' : 'bg-slate-800'}`}>
                  {leonTasks.filter(t => t.status !== 'done').length}
                </span>
              </span>
              {activeTab === 'leon' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-amber-500" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('robert')}
              className={`relative px-6 py-4 font-mono text-sm tracking-wider transition-all ${
                activeTab === 'robert'
                  ? 'text-cyan-400'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <span>🦞</span>
                <span>TASKS FOR ROBERT</span>
                <span className={`px-2 py-0.5 rounded text-xs ${activeTab === 'robert' ? 'bg-cyan-500/20' : 'bg-slate-800'}`}>
                  {robertTasks.filter(t => t.status !== 'done').length}
                </span>
              </span>
              {activeTab === 'robert' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative max-w-6xl mx-auto px-6 py-8">
        <div className="space-y-4">
          {(activeTab === 'leon' ? leonTasks : robertTasks).length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-slate-800/50 border border-slate-700 mb-4">
                <span className="text-4xl opacity-50">{activeTab === 'leon' ? '👤' : '🦞'}</span>
              </div>
              <p className="text-slate-500 font-mono text-sm">NO ACTIVE TASKS</p>
              <p className="text-slate-600 text-xs mt-2">
                {activeTab === 'leon' ? 'Robert will assign tasks here when needed' : 'Leon will assign tasks here for Robert'}
              </p>
            </div>
          ) : (
            (activeTab === 'leon' ? leonTasks : robertTasks).map((task) => {
              const statusConfig = getStatusConfig(task.status);
              const priorityConfig = getPriorityConfig(task.priority);
              
              return (
                <div
                  key={task.id}
                  className={`group relative bg-gradient-to-r ${statusConfig.bg} border ${statusConfig.border} rounded-xl p-6 backdrop-blur-sm hover:shadow-xl ${statusConfig.glow} transition-all duration-300`}
                >
                  {/* Priority indicator */}
                  {task.priority === 'urgent' && (
                    <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden rounded-tr-xl">
                      <div className="absolute top-2 -right-6 rotate-45 bg-red-500 text-white text-[10px] font-bold px-6 py-0.5 shadow-lg">
                        URGENT
                      </div>
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`text-lg ${statusConfig.border.replace('border-', 'text-').replace('/50', '')}`}>
                          {statusConfig.icon}
                        </span>
                        <h3 className="text-lg font-semibold truncate">{task.title}</h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-mono ${priorityConfig.bg} ${priorityConfig.color}`}>
                          {task.priority.toUpperCase()}
                        </span>
                      </div>

                      {/* Description */}
                      {task.description && (
                        <p className="text-slate-400 text-sm mb-4 leading-relaxed">{task.description}</p>
                      )}

                      {/* Result display */}
                      {task.result && (
                        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 mb-4">
                          <p className="text-xs text-slate-500 font-mono mb-1">RESULT:</p>
                          <p className="text-emerald-400 text-sm">{task.result}</p>
                        </div>
                      )}

                      {/* Meta */}
                      <div className="flex items-center gap-4 text-xs text-slate-500 font-mono">
                        <span>ID: {task.id.slice(-6)}</span>
                        <span>•</span>
                        <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className={statusConfig.border.replace('border-', 'text-').replace('/50', '')}>
                          {statusConfig.label}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      {task.status === 'pending' && (
                        <button
                          onClick={() => updateTask(task.id, { status: 'in_progress' })}
                          className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded text-xs font-mono text-cyan-400 hover:bg-cyan-500/20 transition-colors"
                        >
                          START
                        </button>
                      )}
                      {task.status === 'in_progress' && (
                        <>
                          <button
                            onClick={() => setShowResult(task.id)}
                            className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded text-xs font-mono text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                          >
                            COMPLETE
                          </button>
                          <button
                            onClick={() => updateTask(task.id, { status: 'rejected' })}
                            className="px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded text-xs font-mono text-red-400 hover:bg-red-500/20 transition-colors"
                          >
                            REJECT
                          </button>
                        </>
                      )}
                      {(task.status === 'done' || task.status === 'rejected') && (
                        <button
                          onClick={() => updateTask(task.id, { status: 'pending', result: undefined })}
                          className="px-3 py-1.5 bg-slate-500/10 border border-slate-500/30 rounded text-xs font-mono text-slate-400 hover:bg-slate-500/20 transition-colors"
                        >
                          REOPEN
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* New Task Modal */}
      {showNewTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowNewTask(false)} />
          <div className="relative w-full max-w-lg bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-500/10">
            <div className="p-6 border-b border-slate-800">
              <h2 className="text-xl font-bold text-cyan-400 font-mono">NEW TASK</h2>
              <p className="text-xs text-slate-500 mt-1">Create a task for collaboration</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs text-slate-400 font-mono mb-2">ASSIGN TO</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setNewTask({ ...newTask, assignedTo: 'leon' })}
                    className={`flex-1 py-3 rounded-lg font-mono text-sm transition-all ${
                      newTask.assignedTo === 'leon'
                        ? 'bg-orange-500/20 border-2 border-orange-500 text-orange-400'
                        : 'bg-slate-800 border-2 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    👤 LEON
                  </button>
                  <button
                    onClick={() => setNewTask({ ...newTask, assignedTo: 'robert' })}
                    className={`flex-1 py-3 rounded-lg font-mono text-sm transition-all ${
                      newTask.assignedTo === 'robert'
                        ? 'bg-cyan-500/20 border-2 border-cyan-500 text-cyan-400'
                        : 'bg-slate-800 border-2 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    🦞 ROBERT
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 font-mono mb-2">TITLE</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all"
                  placeholder="Enter task title..."
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 font-mono mb-2">DESCRIPTION</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all h-24 resize-none"
                  placeholder="Describe the task..."
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 font-mono mb-2">PRIORITY</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['low', 'medium', 'high', 'urgent'] as TaskPriority[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => setNewTask({ ...newTask, priority: p })}
                      className={`py-2 rounded-lg text-xs font-mono transition-all ${
                        newTask.priority === p
                          ? p === 'urgent' ? 'bg-red-500/30 border-2 border-red-500 text-red-400'
                            : p === 'high' ? 'bg-orange-500/30 border-2 border-orange-500 text-orange-400'
                            : p === 'medium' ? 'bg-yellow-500/30 border-2 border-yellow-500 text-yellow-400'
                            : 'bg-slate-500/30 border-2 border-slate-500 text-slate-400'
                          : 'bg-slate-800 border-2 border-slate-700 text-slate-500 hover:border-slate-600'
                      }`}
                    >
                      {p.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-800 flex gap-3">
              <button
                onClick={() => setShowNewTask(false)}
                className="flex-1 py-3 bg-slate-800 border border-slate-700 rounded-lg font-mono text-sm text-slate-400 hover:bg-slate-700 transition-colors"
              >
                CANCEL
              </button>
              <button
                onClick={createNewTask}
                disabled={!newTask.title.trim()}
                className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg font-mono text-sm text-white font-semibold hover:from-cyan-400 hover:to-blue-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                CREATE TASK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Result Modal */}
      {showResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowResult(null)} />
          <div className="relative w-full max-w-lg bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl shadow-emerald-500/10">
            <div className="p-6 border-b border-slate-800">
              <h2 className="text-xl font-bold text-emerald-400 font-mono">SUBMIT RESULT</h2>
              <p className="text-xs text-slate-500 mt-1">Describe what was accomplished</p>
            </div>
            <div className="p-6">
              <textarea
                value={resultText}
                onChange={(e) => setResultText(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all h-32 resize-none"
                placeholder="Describe the result or what was done..."
                autoFocus
              />
            </div>
            <div className="p-6 border-t border-slate-800 flex gap-3">
              <button
                onClick={() => { setShowResult(null); setResultText(''); }}
                className="flex-1 py-3 bg-slate-800 border border-slate-700 rounded-lg font-mono text-sm text-slate-400 hover:bg-slate-700 transition-colors"
              >
                CANCEL
              </button>
              <button
                onClick={() => submitResult(showResult)}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg font-mono text-sm text-white font-semibold hover:from-emerald-400 hover:to-green-400 transition-all"
              >
                SUBMIT & COMPLETE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer status bar */}
      <footer className="fixed bottom-0 left-0 right-0 border-t border-slate-800 bg-slate-900/90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between text-xs font-mono text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              SYSTEM ONLINE
            </span>
            <span>•</span>
            <span>{tasks.length} TOTAL TASKS</span>
          </div>
          <div className="flex items-center gap-4">
            <span>{tasks.filter(t => t.status === 'done').length} COMPLETED</span>
            <span>•</span>
            <span>{tasks.filter(t => t.status === 'in_progress').length} IN PROGRESS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
