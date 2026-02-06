'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '@/lib/types';

interface ReviewModalProps {
  task: Task;
  onSubmit: (approve: boolean, feedback: string) => void;
  onClose: () => void;
}

export function ReviewModal({ task, onSubmit, onClose }: ReviewModalProps) {
  const t = useTranslations('tasks');
  const [feedback, setFeedback] = useState('');

  const handleSubmit = (approve: boolean) => {
    onSubmit(approve, feedback);
    setFeedback('');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-amber-400">{t('review.title')}</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-4">
            {/* Task info */}
            <div className="bg-slate-800/50 rounded-lg p-3">
              <h3 className="font-medium text-sm mb-1">{task.title}</h3>
              {task.description && (
                <p className="text-slate-400 text-xs">{task.description}</p>
              )}
            </div>

            {/* Feedback */}
            <div>
              <label className="text-xs text-slate-400 font-mono mb-2 block">
                {t('feedback')}
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder={t('review.feedbackPlaceholder')}
                rows={3}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-700 flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700 transition text-sm"
            >
              Cancel
            </button>
            <button
              onClick={() => handleSubmit(false)}
              className="flex-1 py-2 rounded-lg bg-rose-600/20 border border-rose-500/50 text-rose-400 hover:bg-rose-600/30 transition text-sm"
            >
              {t('review.requestChanges')}
            </button>
            <button
              onClick={() => handleSubmit(true)}
              className="flex-1 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition text-sm font-medium"
            >
              {t('review.approve')}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default ReviewModal;
