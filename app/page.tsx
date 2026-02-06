'use client';

import { useEffect, useState } from 'react';
import type { Task, TaskStatus, TaskPriority, TaskType } from '@/lib/tasks';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'leon' | 'robert'>('leon');
  const [showNewTask, setShowNewTask] = useState(false);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [showFeedback, setShowFeedback] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as TaskPriority,
    type: 'task' as TaskType,
    assignedTo: 'leon' as 'robert' | 'leon',
  });

  useEffect(() => { fetchTasks(); }, []);

  async function fetchTasks() {
    try {
      const res = await fetch('/api/tasks');
      if (res.ok) setTasks(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function createTask() {
    if (!newTask.title.trim()) return;
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newTask, status: 'pending', createdBy: 'leon' })
    });
    setNewTask({ title: '', description: '', priority: 'medium', type: 'task', assignedTo: 'leon' });
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

  async function submitFeedback(id: string, approve: boolean) {
    await updateTask(id, {
      status: approve ? 'approved' : 'changes_requested',
      feedback: feedbackText || undefined,
      reviewedAt: new Date().toISOString()
    });
    setShowFeedback(null);
    setFeedbackText('');
  }

  const leonTasks = tasks.filter(t => t.assignedTo === 'leon');
  const robertTasks = tasks.filter(t => t.assignedTo === 'robert');
  const activeTasks = activeTab === 'leon' ? leonTasks : robertTasks;

  const statusConfig: Record<TaskStatus, { icon: string; label: string; color: string; bg: string }> = {
    pending: { icon: '◇', label: 'PENDING', color: 'text-slate-400', bg: 'from-slate-500/20 to-slate-600/20 border-slate-500/40' },
    in_progress: { icon: '◈', label: 'IN PROGRESS', color: 'text-cyan-400', bg: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/40' },
    ready_for_review: { icon: '◉', label: 'READY FOR REVIEW', color: 'text-amber-400', bg: 'from-amber-500/20 to-orange-500/20 border-amber-500/40' },
    changes_requested: { icon: '◈', label: 'CHANGES REQUESTED', color: 'text-rose-400', bg: 'from-rose-500/20 to-red-500/20 border-rose-500/40' },
    approved: { icon: '◆', label: 'APPROVED', color: 'text-emerald-400', bg: 'from-emerald-500/20 to-green-500/20 border-emerald-500/40' },
    published: { icon: '★', label: 'PUBLISHED', color: 'text-violet-400', bg: 'from-violet-500/20 to-purple-500/20 border-violet-500/40' },
    done: { icon: '✓', label: 'DONE', color: 'text-emerald-400', bg: 'from-emerald-500/20 to-green-500/20 border-emerald-500/40' },
    rejected: { icon: '✕', label: 'REJECTED', color: 'text-red-400', bg: 'from-red-500/20 to-rose-500/20 border-red-500/40' },
  };

  const typeConfig: Record<TaskType, { icon: string; label: string }> = {
    task: { icon: '📋', label: 'Task' },
    content: { icon: '📝', label: 'Content' },
    blog: { icon: '📰', label: 'Blog Post' },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
          <span className="text-cyan-400 font-mono text-sm tracking-wider">INITIALIZING...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-16">
      {/* Grid background */}
      <div className="fixed inset-0 opacity-5" style={{
        backgroundImage: 'linear-gradient(rgba(6,182,212,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.3) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />

      {/* Header */}
      <header className="relative border-b border-cyan-500/20 bg-slate-900/90 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🦞</span>
            <div>
              <h1 className="text-lg font-bold">
                <span className="text-cyan-400">ROBERT</span>
                <span className="text-slate-500"> × </span>
                <span className="text-orange-400">LEON</span>
              </h1>
              <p className="text-[10px] text-slate-500 font-mono">COLLABORATION HQ</p>
            </div>
          </div>
          <button
            onClick={() => setShowNewTask(true)}
            className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg font-mono text-sm text-cyan-400 hover:bg-cyan-500/20 transition"
          >
            + NEW
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-slate-800 bg-slate-900/50 sticky top-[57px] z-30">
        <div className="max-w-5xl mx-auto px-4 flex">
          {[
            { id: 'leon', label: 'FOR LEON', icon: '👤', color: 'orange', count: leonTasks.filter(t => !['done', 'published', 'rejected'].includes(t.status)).length },
            { id: 'robert', label: 'FOR ROBERT', icon: '🦞', color: 'cyan', count: robertTasks.filter(t => !['done', 'published', 'rejected'].includes(t.status)).length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'leon' | 'robert')}
              className={`relative px-4 py-3 font-mono text-xs flex items-center gap-2 transition ${
                activeTab === tab.id ? `text-${tab.color}-400` : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] ${activeTab === tab.id ? `bg-${tab.color}-500/20` : 'bg-slate-800'}`}>
                {tab.count}
              </span>
              {activeTab === tab.id && (
                <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-${tab.color}-500`} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <main className="relative max-w-5xl mx-auto px-4 py-6">
        {activeTasks.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3 opacity-30">{activeTab === 'leon' ? '👤' : '🦞'}</div>
            <p className="text-slate-500 font-mono text-sm">NO TASKS</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeTasks.map(task => {
              const status = statusConfig[task.status];
              const type = typeConfig[task.type || 'task'];
              const isExpanded = expandedTask === task.id;
              
              return (
                <div key={task.id} className={`relative bg-gradient-to-r ${status.bg} border rounded-xl backdrop-blur transition-all ${isExpanded ? 'ring-1 ring-white/10' : ''}`}>
                  {/* Main row */}
                  <div className="p-4 cursor-pointer" onClick={() => setExpandedTask(isExpanded ? null : task.id)}>
                    <div className="flex items-start gap-3">
                      <span className={`text-xl ${status.color}`}>{status.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">{type.icon} {type.label}</span>
                          {task.priority === 'urgent' && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 animate-pulse">URGENT</span>}
                          {task.priority === 'high' && <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400">HIGH</span>}
                        </div>
                        <h3 className="font-semibold text-sm mb-1">{task.title}</h3>
                        {task.description && <p className="text-slate-400 text-xs line-clamp-2">{task.description}</p>}
                      </div>
                      <div className="text-right">
                        <span className={`text-[10px] font-mono ${status.color}`}>{status.label}</span>
                        <p className="text-[10px] text-slate-600 mt-1">{new Date(task.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="border-t border-white/5 p-4 space-y-4">
                      {/* Content preview */}
                      {task.content && (
                        <div className="bg-slate-900/50 rounded-lg p-3">
                          <p className="text-[10px] text-slate-500 font-mono mb-2">CONTENT</p>
                          <p className="text-sm text-slate-300 whitespace-pre-wrap">{task.content}</p>
                        </div>
                      )}

                      {/* Links */}
                      {(task.contentUrl || task.previewUrl) && (
                        <div className="flex gap-2">
                          {task.contentUrl && (
                            <a href={task.contentUrl} target="_blank" rel="noopener" className="text-xs text-cyan-400 hover:underline">📎 View Content</a>
                          )}
                          {task.previewUrl && (
                            <a href={task.previewUrl} target="_blank" rel="noopener" className="text-xs text-violet-400 hover:underline">👁 Preview</a>
                          )}
                        </div>
                      )}

                      {/* Feedback display */}
                      {task.feedback && (
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                          <p className="text-[10px] text-amber-500 font-mono mb-1">FEEDBACK</p>
                          <p className="text-sm text-amber-200">{task.feedback}</p>
                        </div>
                      )}

                      {/* Result display */}
                      {task.result && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                          <p className="text-[10px] text-emerald-500 font-mono mb-1">RESULT</p>
                          <p className="text-sm text-emerald-200">{task.result}</p>
                        </div>
                      )}

                      {/* Actions based on status and who's viewing */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        {/* PENDING -> Start working */}
                        {task.status === 'pending' && (
                          <button onClick={() => updateTask(task.id, { status: 'in_progress' })}
                            className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded text-xs font-mono text-cyan-400 hover:bg-cyan-500/20">
                            ▶ START
                          </button>
                        )}

                        {/* IN_PROGRESS -> Submit for review (content tasks) or Complete (regular tasks) */}
                        {task.status === 'in_progress' && (
                          <>
                            {(task.type === 'content' || task.type === 'blog') ? (
                              <button onClick={() => updateTask(task.id, { status: 'ready_for_review' })}
                                className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded text-xs font-mono text-amber-400 hover:bg-amber-500/20">
                                📤 SUBMIT FOR REVIEW
                              </button>
                            ) : (
                              <button onClick={() => updateTask(task.id, { status: 'done' })}
                                className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded text-xs font-mono text-emerald-400 hover:bg-emerald-500/20">
                                ✓ COMPLETE
                              </button>
                            )}
                          </>
                        )}

                        {/* READY_FOR_REVIEW -> Approve or Request Changes (Leon reviews) */}
                        {task.status === 'ready_for_review' && (
                          <>
                            <button onClick={() => setShowFeedback(task.id)}
                              className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded text-xs font-mono text-emerald-400 hover:bg-emerald-500/20">
                              ✓ REVIEW
                            </button>
                          </>
                        )}

                        {/* CHANGES_REQUESTED -> Back to in_progress */}
                        {task.status === 'changes_requested' && (
                          <button onClick={() => updateTask(task.id, { status: 'in_progress' })}
                            className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded text-xs font-mono text-cyan-400 hover:bg-cyan-500/20">
                            🔄 REVISE
                          </button>
                        )}

                        {/* APPROVED -> Publish */}
                        {task.status === 'approved' && (
                          <button onClick={() => updateTask(task.id, { status: 'published', publishedAt: new Date().toISOString() })}
                            className="px-3 py-1.5 bg-violet-500/10 border border-violet-500/30 rounded text-xs font-mono text-violet-400 hover:bg-violet-500/20">
                            🚀 PUBLISH
                          </button>
                        )}

                        {/* Reopen for done/published/rejected */}
                        {['done', 'published', 'rejected'].includes(task.status) && (
                          <button onClick={() => updateTask(task.id, { status: 'pending' })}
                            className="px-3 py-1.5 bg-slate-500/10 border border-slate-500/30 rounded text-xs font-mono text-slate-400 hover:bg-slate-500/20">
                            ↺ REOPEN
                          </button>
                        )}

                        {/* Cancel/Reject (always available except when done) */}
                        {!['done', 'published', 'rejected'].includes(task.status) && (
                          <button onClick={() => updateTask(task.id, { status: 'rejected' })}
                            className="px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded text-xs font-mono text-red-400 hover:bg-red-500/20">
                            ✕ CANCEL
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* New Task Modal */}
      {showNewTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowNewTask(false)} />
          <div className="relative w-full max-w-md bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-2xl">
            <div className="p-4 border-b border-slate-800">
              <h2 className="text-lg font-bold text-cyan-400 font-mono">NEW TASK</h2>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {(['leon', 'robert'] as const).map(who => (
                  <button key={who} onClick={() => setNewTask({ ...newTask, assignedTo: who })}
                    className={`py-2 rounded-lg text-sm font-mono transition ${
                      newTask.assignedTo === who
                        ? who === 'leon' ? 'bg-orange-500/20 border-2 border-orange-500 text-orange-400' : 'bg-cyan-500/20 border-2 border-cyan-500 text-cyan-400'
                        : 'bg-slate-800 border-2 border-slate-700 text-slate-400'
                    }`}>
                    {who === 'leon' ? '👤 LEON' : '🦞 ROBERT'}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(['task', 'content', 'blog'] as TaskType[]).map(t => (
                  <button key={t} onClick={() => setNewTask({ ...newTask, type: t })}
                    className={`py-2 rounded-lg text-xs font-mono transition ${
                      newTask.type === t ? 'bg-cyan-500/20 border-2 border-cyan-500 text-cyan-400' : 'bg-slate-800 border-2 border-slate-700 text-slate-400'
                    }`}>
                    {typeConfig[t].icon} {typeConfig[t].label.toUpperCase()}
                  </button>
                ))}
              </div>
              <input
                type="text" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none"
                placeholder="Title..."
              />
              <textarea
                value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none h-20 resize-none"
                placeholder="Description..."
              />
              <div className="grid grid-cols-4 gap-1">
                {(['low', 'medium', 'high', 'urgent'] as TaskPriority[]).map(p => (
                  <button key={p} onClick={() => setNewTask({ ...newTask, priority: p })}
                    className={`py-1.5 rounded text-[10px] font-mono transition ${
                      newTask.priority === p
                        ? p === 'urgent' ? 'bg-red-500/30 border border-red-500 text-red-400'
                          : p === 'high' ? 'bg-orange-500/30 border border-orange-500 text-orange-400'
                          : p === 'medium' ? 'bg-yellow-500/30 border border-yellow-500 text-yellow-400'
                          : 'bg-slate-500/30 border border-slate-500 text-slate-400'
                        : 'bg-slate-800 border border-slate-700 text-slate-500'
                    }`}>
                    {p.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-4 border-t border-slate-800 flex gap-2">
              <button onClick={() => setShowNewTask(false)} className="flex-1 py-2 bg-slate-800 rounded-lg text-sm text-slate-400">CANCEL</button>
              <button onClick={createTask} disabled={!newTask.title.trim()}
                className="flex-1 py-2 bg-cyan-500 rounded-lg text-sm font-semibold disabled:opacity-50">CREATE</button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback/Review Modal */}
      {showFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowFeedback(null)} />
          <div className="relative w-full max-w-md bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl">
            <div className="p-4 border-b border-slate-800">
              <h2 className="text-lg font-bold text-amber-400 font-mono">REVIEW</h2>
            </div>
            <div className="p-4">
              <textarea
                value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-amber-500 focus:outline-none h-24 resize-none"
                placeholder="Feedback or comments (optional)..."
              />
            </div>
            <div className="p-4 border-t border-slate-800 flex gap-2">
              <button onClick={() => { setShowFeedback(null); setFeedbackText(''); }}
                className="flex-1 py-2 bg-slate-800 rounded-lg text-sm text-slate-400">CANCEL</button>
              <button onClick={() => submitFeedback(showFeedback, false)}
                className="flex-1 py-2 bg-rose-500/20 border border-rose-500 rounded-lg text-sm text-rose-400">REQUEST CHANGES</button>
              <button onClick={() => submitFeedback(showFeedback, true)}
                className="flex-1 py-2 bg-emerald-500 rounded-lg text-sm font-semibold">APPROVE</button>
            </div>
          </div>
        </div>
      )}

      {/* Status bar */}
      <footer className="fixed bottom-0 left-0 right-0 border-t border-slate-800 bg-slate-900/95 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-2 flex items-center justify-between text-[10px] font-mono text-slate-500">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            ONLINE
          </span>
          <span>
            {tasks.filter(t => t.status === 'ready_for_review').length} awaiting review • 
            {tasks.filter(t => t.status === 'approved').length} ready to publish
          </span>
        </div>
      </footer>
    </div>
  );
}
