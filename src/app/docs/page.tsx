'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sidebar } from '@/components/layout/Sidebar'
import { ToastProvider, useToast } from '@/components/ui/Toast'
import { LoadingPage } from '@/components/ui/Loading'
import { NewProjectModal, NewProjectData } from '@/components/features/projects/NewProjectModal'
import {
  FileText,
  Plus,
  X,
  Clock,
  Search,
  ChevronRight,
  Edit3,
  Trash2,
  Save,
  Eye,
  RefreshCw,
  FolderOpen,
} from '@/components/ui/Icons'
import { ConfirmModal } from '@/components/ui/ConfirmModal'

interface Project {
  id: string
  name: string
  icon: string
  color: string
}

interface DocFile {
  name: string
  path: string
  size: number
  modifiedAt: string
  projectId?: string
}

interface DocContent {
  name: string
  content: string
  size: number
  modifiedAt: string
  projectId?: string
}

function DocsContent() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [docs, setDocs] = useState<DocFile[]>([])
  const [selectedDoc, setSelectedDoc] = useState<DocContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingDoc, setLoadingDoc] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState('')
  const [showNewModal, setShowNewModal] = useState(false)
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)
  const [newDocName, setNewDocName] = useState('')
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; doc: DocFile | null }>({ isOpen: false, doc: null })
  const toast = useToast()
  
  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch('/api/projects')
      const data = await res.json()
      setProjects(data.projects || [])
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    }
  }, [])
  
  const fetchDocs = useCallback(async () => {
    try {
      const url = selectedProject 
        ? `/api/docs?projectId=${selectedProject}`
        : '/api/docs'
      const res = await fetch(url)
      const data = await res.json()
      setDocs(data.docs || [])
    } catch (error) {
      console.error('Failed to fetch docs:', error)
      toast.error('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }, [selectedProject, toast])
  
  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])
  
  useEffect(() => {
    setLoading(true)
    setSelectedDoc(null)
    fetchDocs()
  }, [fetchDocs, selectedProject])
  
  async function loadDoc(fileName: string) {
    setLoadingDoc(true)
    try {
      const url = selectedProject
        ? `/api/docs?file=${encodeURIComponent(fileName)}&projectId=${selectedProject}`
        : `/api/docs?file=${encodeURIComponent(fileName)}`
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to load document')
      const data = await res.json()
      setSelectedDoc(data)
      setEditContent(data.content)
      setIsEditing(false)
    } catch (error) {
      toast.error('Failed to load document')
    } finally {
      setLoadingDoc(false)
    }
  }
  
  async function saveDoc() {
    if (!selectedDoc) return
    
    try {
      const res = await fetch('/api/docs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: selectedDoc.name, 
          content: editContent,
          projectId: selectedProject,
        }),
      })
      
      if (!res.ok) throw new Error('Failed to save')
      
      setSelectedDoc({ ...selectedDoc, content: editContent })
      setIsEditing(false)
      toast.success('Document saved')
      fetchDocs()
    } catch (error) {
      toast.error('Failed to save document')
    }
  }
  
  async function createDoc() {
    if (!newDocName.trim()) {
      toast.error('Please enter a document name')
      return
    }
    
    try {
      const res = await fetch('/api/docs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newDocName.trim(),
          content: `# ${newDocName.trim()}\n\nStart writing here...`,
          projectId: selectedProject,
        }),
      })
      
      if (!res.ok) throw new Error('Failed to create')
      
      const data = await res.json()
      toast.success('Document created')
      setShowNewModal(false)
      setNewDocName('')
      fetchDocs()
      loadDoc(data.name)
    } catch (error) {
      toast.error('Failed to create document')
    }
  }
  
  async function deleteDoc() {
    if (!deleteModal.doc) return
    
    try {
      const url = selectedProject
        ? `/api/docs?file=${encodeURIComponent(deleteModal.doc.name)}&projectId=${selectedProject}`
        : `/api/docs?file=${encodeURIComponent(deleteModal.doc.name)}`
      const res = await fetch(url, { method: 'DELETE' })
      
      if (!res.ok) throw new Error('Failed to delete')
      
      toast.success('Document deleted')
      setDeleteModal({ isOpen: false, doc: null })
      if (selectedDoc?.name === deleteModal.doc.name) {
        setSelectedDoc(null)
      }
      fetchDocs()
    } catch (error) {
      toast.error('Failed to delete document')
    }
  }
  
  async function handleCreateProject(data: NewProjectData) {
    try {
      const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          slug,
          description: data.description,
          icon: data.icon,
          color: data.color,
          platforms: data.platforms.map(p => ({
            platform: p,
            enabled: true,
            connectionStatus: 'pending',
            cadence: '3x/week',
          })),
          marketingPlan: { goals: [], targetAudience: '', contentPillars: [], notes: '' },
          settings: { timezone: 'UTC', defaultAssignee: 'leon', autoSchedule: false },
        }),
      })

      if (!res.ok) throw new Error('Failed to create project')

      const newProject = await res.json()
      toast.success('Project Created', `${data.name} is ready to use`)
      await fetchProjects()
      setSelectedProject(newProject.id)
    } catch (error) {
      toast.error('Failed to create project')
      throw error
    }
  }
  
  const filteredDocs = docs.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  const currentProject = projects.find(p => p.id === selectedProject)
  
  function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }
  
  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  
  // Simple markdown renderer
  function renderMarkdown(content: string) {
    const lines = content.split('\n')
    const elements: React.ReactNode[] = []
    let inCodeBlock = false
    let codeContent: string[] = []
    
    lines.forEach((line, index) => {
      // Code blocks
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <pre key={index} className="bg-slate-900 rounded-lg p-4 overflow-x-auto my-4">
              <code className="text-sm text-slate-300">{codeContent.join('\n')}</code>
            </pre>
          )
          codeContent = []
          inCodeBlock = false
        } else {
          inCodeBlock = true
        }
        return
      }
      
      if (inCodeBlock) {
        codeContent.push(line)
        return
      }
      
      // Headers
      if (line.startsWith('# ')) {
        elements.push(<h1 key={index} className="text-3xl font-bold text-white mt-6 mb-4">{line.slice(2)}</h1>)
        return
      }
      if (line.startsWith('## ')) {
        elements.push(<h2 key={index} className="text-2xl font-semibold text-white mt-5 mb-3">{line.slice(3)}</h2>)
        return
      }
      if (line.startsWith('### ')) {
        elements.push(<h3 key={index} className="text-xl font-medium text-white mt-4 mb-2">{line.slice(4)}</h3>)
        return
      }
      
      // Horizontal rule
      if (line.match(/^---+$/)) {
        elements.push(<hr key={index} className="border-slate-700 my-6" />)
        return
      }
      
      // Lists
      if (line.match(/^[-*]\s/)) {
        elements.push(
          <li key={index} className="text-slate-300 ml-4 list-disc">{line.slice(2)}</li>
        )
        return
      }
      
      // Numbered lists
      if (line.match(/^\d+\.\s/)) {
        elements.push(
          <li key={index} className="text-slate-300 ml-4 list-decimal">{line.replace(/^\d+\.\s/, '')}</li>
        )
        return
      }
      
      // Bold
      let processedLine = line.replace(/\*\*([^*]+)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
      
      // Empty lines
      if (line.trim() === '') {
        elements.push(<div key={index} className="h-4" />)
        return
      }
      
      // Regular paragraph
      elements.push(
        <p 
          key={index} 
          className="text-slate-300 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: processedLine }}
        />
      )
    })
    
    return elements
  }
  
  if (loading && projects.length === 0) {
    return <LoadingPage message="Loading documents..." />
  }
  
  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Sidebar 
        projects={projects}
        selectedProject={selectedProject}
        onProjectChange={setSelectedProject}
        onCreateProject={() => setShowNewProjectModal(true)}
      />
      
      <div className="flex-1 flex">
        {/* Docs List */}
        <div className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col">
          <div className="p-4 border-b border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <FileText size={20} className="text-cyan-400" />
                  Documents
                </h2>
                {currentProject ? (
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <span>{currentProject.icon}</span>
                    {currentProject.name}
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 mt-1">Global docs</p>
                )}
              </div>
              <button
                onClick={() => setShowNewModal(true)}
                className="p-2 bg-cyan-500 text-black rounded-lg hover:bg-cyan-400"
                title="New document"
              >
                <Plus size={16} />
              </button>
            </div>
            
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search docs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw size={20} className="text-cyan-400 animate-spin" />
              </div>
            ) : filteredDocs.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <FolderOpen size={32} className="mx-auto mb-2 opacity-50" />
                <p>{docs.length === 0 ? 'No documents yet' : 'No matches found'}</p>
                {currentProject && docs.length === 0 && (
                  <p className="text-xs mt-1">Create docs for {currentProject.name}</p>
                )}
              </div>
            ) : (
              <ul className="space-y-1">
                {filteredDocs.map((doc) => (
                  <li key={doc.name}>
                    <button
                      onClick={() => loadDoc(doc.name)}
                      className={`w-full text-left p-3 rounded-lg transition-colors group ${
                        selectedDoc?.name === doc.name
                          ? 'bg-cyan-500/20 text-cyan-400'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{doc.name.replace('.md', '')}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                            <Clock size={10} />
                            {formatDate(doc.modifiedAt)}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeleteModal({ isOpen: true, doc })
                          }}
                          className="p-1 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        {/* Doc Viewer */}
        <div className="flex-1 flex flex-col">
          {loadingDoc ? (
            <div className="flex-1 flex items-center justify-center">
              <RefreshCw size={24} className="text-cyan-400 animate-spin" />
            </div>
          ) : selectedDoc ? (
            <>
              {/* Doc Header */}
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-white">{selectedDoc.name.replace('.md', '')}</h1>
                  <div className="text-sm text-slate-500 flex items-center gap-4 mt-1">
                    <span>{formatBytes(selectedDoc.size)}</span>
                    <span>Updated {formatDate(selectedDoc.modifiedAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => {
                          setEditContent(selectedDoc.content)
                          setIsEditing(false)
                        }}
                        className="px-3 py-1.5 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 flex items-center gap-1"
                      >
                        <X size={14} />
                        Cancel
                      </button>
                      <button
                        onClick={saveDoc}
                        className="px-3 py-1.5 bg-cyan-500 text-black rounded-lg hover:bg-cyan-400 flex items-center gap-1"
                      >
                        <Save size={14} />
                        Save
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-3 py-1.5 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 flex items-center gap-1"
                    >
                      <Edit3 size={14} />
                      Edit
                    </button>
                  )}
                </div>
              </div>
              
              {/* Doc Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {isEditing ? (
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full h-full min-h-[500px] bg-slate-900 border border-slate-700 rounded-lg p-4 text-slate-300 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                ) : (
                  <div className="prose prose-invert max-w-none">
                    {renderMarkdown(selectedDoc.content)}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              <div className="text-center">
                <FileText size={48} className="mx-auto mb-4 opacity-50" />
                <p>Select a document to view</p>
                {currentProject && (
                  <p className="text-sm mt-1">or create a new doc for {currentProject.name}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* New Doc Modal */}
      <AnimatePresence>
        {showNewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setShowNewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6"
            >
              <h2 className="text-xl font-bold text-white mb-2">New Document</h2>
              {currentProject && (
                <p className="text-sm text-slate-400 mb-4">
                  For: {currentProject.icon} {currentProject.name}
                </p>
              )}
              <input
                type="text"
                value={newDocName}
                onChange={(e) => setNewDocName(e.target.value)}
                placeholder="Document name"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 mb-4"
                onKeyDown={(e) => e.key === 'Enter' && createDoc()}
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowNewModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
                >
                  Cancel
                </button>
                <button
                  onClick={createDoc}
                  className="flex-1 px-4 py-2 bg-cyan-500 text-black font-medium rounded-lg hover:bg-cyan-400"
                >
                  Create
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, doc: null })}
        onConfirm={deleteDoc}
        title="Delete Document"
        message={`Are you sure you want to delete "${deleteModal.doc?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
      
      {/* New Project Modal */}
      <NewProjectModal
        isOpen={showNewProjectModal}
        onClose={() => setShowNewProjectModal(false)}
        onSave={handleCreateProject}
      />
    </div>
  )
}

export default function DocsPage() {
  return (
    <ToastProvider>
      <DocsContent />
    </ToastProvider>
  )
}
