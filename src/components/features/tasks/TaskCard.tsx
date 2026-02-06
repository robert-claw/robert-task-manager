'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Task } from '@/lib/types';
import { statusConfig, typeConfig, formatDate } from '@/lib/utils';
import { Card, CardExpandedContent, Badge } from '@/components/ui';
import { TaskActions } from './TaskActions';

interface TaskCardProps {
  task: Task;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdate: (updates: Partial<Task>) => void;
  onReview: () => void;
}

export function TaskCard({ task, isExpanded, onToggle, onUpdate, onReview }: TaskCardProps) {
  const t = useTranslations('tasks');
  const status = statusConfig[task.status];
  const type = typeConfig[task.type || 'task'];

  return (
    <Card gradient={status.bg} expanded={isExpanded}>
      {/* Main row - clickable */}
      <motion.div 
        className="p-4 cursor-pointer"
        onClick={onToggle}
        whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
      >
        <div className="flex items-start gap-3">
          <motion.span 
            className={`text-xl ${status.color}`}
            animate={isExpanded ? { scale: [1, 1.2, 1] } : {}}
          >
            {status.icon}
          </motion.span>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Badge icon={type.icon}>{type.label}</Badge>
              {task.priority === 'urgent' && (
                <Badge variant="urgent" pulse>{t('priority.urgent')}</Badge>
              )}
              {task.priority === 'high' && (
                <Badge variant="high">{t('priority.high')}</Badge>
              )}
            </div>
            <h3 className="font-semibold text-sm mb-1">{task.title}</h3>
            {task.description && (
              <p className="text-slate-400 text-xs line-clamp-2">{task.description}</p>
            )}
          </div>
          
          <div className="text-right flex-shrink-0">
            <span className={`text-[10px] font-mono ${status.color}`}>
              {t(`status.${task.status}`)}
            </span>
            <p className="text-[10px] text-slate-600 mt-1">
              {formatDate(task.createdAt)}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Expanded content */}
      <CardExpandedContent isOpen={isExpanded}>
        {/* Content preview */}
        {task.content && (
          <div className="bg-slate-900/50 rounded-lg p-3">
            <p className="text-[10px] text-slate-500 font-mono mb-2">{t('content')}</p>
            <p className="text-sm text-slate-300 whitespace-pre-wrap">{task.content}</p>
          </div>
        )}

        {/* Links */}
        {(task.contentUrl || task.previewUrl) && (
          <div className="flex gap-2">
            {task.contentUrl && (
              <a href={task.contentUrl} target="_blank" rel="noopener noreferrer" 
                 className="text-xs text-cyan-400 hover:underline">
                📎 {t('viewContent')}
              </a>
            )}
            {task.previewUrl && (
              <a href={task.previewUrl} target="_blank" rel="noopener noreferrer" 
                 className="text-xs text-violet-400 hover:underline">
                👁 {t('preview')}
              </a>
            )}
          </div>
        )}

        {/* Feedback */}
        {task.feedback && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
            <p className="text-[10px] text-amber-500 font-mono mb-1">{t('feedback')}</p>
            <p className="text-sm text-amber-200">{task.feedback}</p>
          </div>
        )}

        {/* Result */}
        {task.result && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
            <p className="text-[10px] text-emerald-500 font-mono mb-1">{t('result')}</p>
            <p className="text-sm text-emerald-200">{task.result}</p>
          </div>
        )}

        {/* Actions */}
        <TaskActions 
          task={task} 
          onUpdate={onUpdate}
          onReview={onReview}
        />
      </CardExpandedContent>
    </Card>
  );
}

export default TaskCard;
