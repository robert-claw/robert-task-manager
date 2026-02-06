'use client';

import { useTranslations } from 'next-intl';
import { Task } from '@/lib/types';
import { Button } from '@/components/ui';

interface TaskActionsProps {
  task: Task;
  onUpdate: (updates: Partial<Task>) => void;
  onReview: () => void;
}

export function TaskActions({ task, onUpdate, onReview }: TaskActionsProps) {
  const t = useTranslations('tasks');
  const { status, type } = task;

  return (
    <div className="flex flex-wrap gap-2 pt-2">
      {/* PENDING -> Start working */}
      {status === 'pending' && (
        <Button 
          variant="cyan" 
          size="sm"
          onClick={() => onUpdate({ status: 'in_progress' })}
          icon="▶"
        >
          {t('actions.start')}
        </Button>
      )}

      {/* IN_PROGRESS -> Submit for review (content) or Complete (tasks) */}
      {status === 'in_progress' && (
        <>
          {(type === 'content' || type === 'blog') ? (
            <Button 
              variant="amber" 
              size="sm"
              onClick={() => onUpdate({ status: 'ready_for_review' })}
              icon="📤"
            >
              {t('actions.submitReview')}
            </Button>
          ) : (
            <Button 
              variant="emerald" 
              size="sm"
              onClick={() => onUpdate({ status: 'done' })}
              icon="✓"
            >
              {t('actions.complete')}
            </Button>
          )}
        </>
      )}

      {/* READY_FOR_REVIEW -> Review */}
      {status === 'ready_for_review' && (
        <Button 
          variant="emerald" 
          size="sm"
          onClick={onReview}
          icon="✓"
        >
          {t('actions.review')}
        </Button>
      )}

      {/* CHANGES_REQUESTED -> Revise */}
      {status === 'changes_requested' && (
        <Button 
          variant="cyan" 
          size="sm"
          onClick={() => onUpdate({ status: 'in_progress' })}
          icon="🔄"
        >
          {t('actions.revise')}
        </Button>
      )}

      {/* APPROVED -> Publish */}
      {status === 'approved' && (
        <Button 
          variant="violet" 
          size="sm"
          onClick={() => onUpdate({ 
            status: 'published', 
            publishedAt: new Date().toISOString() 
          })}
          icon="🚀"
        >
          {t('actions.publish')}
        </Button>
      )}

      {/* Terminal states -> Reopen */}
      {['done', 'published', 'rejected'].includes(status) && (
        <Button 
          variant="secondary" 
          size="sm"
          onClick={() => onUpdate({ status: 'pending' })}
          icon="↺"
        >
          {t('actions.reopen')}
        </Button>
      )}

      {/* Cancel (non-terminal states) */}
      {!['done', 'published', 'rejected'].includes(status) && (
        <Button 
          variant="danger" 
          size="sm"
          onClick={() => onUpdate({ status: 'rejected' })}
          icon="✕"
        >
          {t('actions.cancel')}
        </Button>
      )}
    </div>
  );
}

export default TaskActions;
