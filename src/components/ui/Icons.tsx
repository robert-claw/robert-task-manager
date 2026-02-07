'use client'

import {
  LayoutDashboard,
  Calendar,
  CalendarDays,
  FileText,
  FolderOpen,
  Settings,
  Linkedin,
  Twitter,
  BookOpen,
  Instagram,
  Users,
  Bell,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Send,
  Edit3,
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  Check,
  Rocket,
  Target,
  TrendingUp,
  BarChart3,
  PenTool,
  Zap,
  Radio,
  ClipboardList,
  Cog,
  User,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeft,
  Filter,
  Search,
  MoreHorizontal,
  ExternalLink,
  Trash2,
  Copy,
  RefreshCw,
  Download,
  Upload,
  Image as ImageIcon,
  Video,
  File,
  Link,
  Link2Off,
  Hash,
  AtSign,
  MessageSquare,
  ThumbsUp,
  Share2,
  Bookmark,
  Star,
  Heart,
  Activity,
  Loader2,
  Info,
  HelpCircle,
  Sparkles,
  Bot,
  Save,
  LayoutGrid,
  List,
  GripVertical,
  AlertTriangle,
  Archive,
  Lightbulb,
  Play,
  Pause,
  Tag,
  type LucideIcon,
} from 'lucide-react'

// Platform Icons mapping
export const PlatformIcons: Record<string, LucideIcon> = {
  linkedin: Linkedin,
  twitter: Twitter,
  blog: BookOpen,
  instagram: Instagram,
  facebook: Users,
  nostr: Zap,
  medium: PenTool,
}

// Navigation Icons mapping
export const NavIcons: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  calendar: Calendar,
  content: FileText,
  projects: FolderOpen,
  settings: Settings,
}

// Status Icons mapping
export const StatusIcons: Record<string, LucideIcon> = {
  draft: Edit3,
  ready_for_review: Eye,
  changes_requested: AlertCircle,
  approved: CheckCircle2,
  scheduled: Clock,
  published: Send,
}

// Export individual icons for direct use
export {
  LayoutDashboard,
  Calendar,
  CalendarDays,
  FileText,
  FolderOpen,
  Settings,
  Linkedin,
  Twitter,
  BookOpen,
  Instagram,
  Users,
  Bell,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Send,
  Edit3,
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  Check,
  Rocket,
  Target,
  TrendingUp,
  BarChart3,
  PenTool,
  Zap,
  Radio,
  ClipboardList,
  Cog,
  User,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeft,
  Filter,
  Search,
  MoreHorizontal,
  ExternalLink,
  Trash2,
  Copy,
  RefreshCw,
  Download,
  Upload,
  ImageIcon,
  Video,
  File,
  Link,
  Link2Off,
  Link2Off as Unlink,
  Hash,
  AtSign,
  MessageSquare,
  ThumbsUp,
  Share2,
  Bookmark,
  Star,
  Heart,
  Activity,
  Loader2,
  Info,
  HelpCircle,
  Sparkles,
  Bot,
  Save,
  LayoutGrid,
  List,
  GripVertical,
  AlertTriangle,
  Archive,
  Lightbulb,
  Play,
  Pause,
  Tag,
}

// Helper component for platform icon with consistent styling
interface PlatformIconProps {
  platform: string
  size?: number
  className?: string
}

export function PlatformIcon({ platform, size = 20, className = '' }: PlatformIconProps) {
  const Icon = PlatformIcons[platform.toLowerCase()] || FileText
  return <Icon size={size} className={className} />
}

// Helper component for status icon
interface StatusIconProps {
  status: string
  size?: number
  className?: string
}

export function StatusIcon({ status, size = 16, className = '' }: StatusIconProps) {
  const Icon = StatusIcons[status] || Edit3
  return <Icon size={size} className={className} />
}

// Loading spinner component
export function LoadingSpinner({ size = 24, className = '' }: { size?: number; className?: string }) {
  return <Loader2 size={size} className={`animate-spin ${className}`} />
}
