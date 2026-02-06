'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Task } from '@/lib/types';

interface FooterProps {
  tasks: Task[];
}

export function Footer({ tasks }: FooterProps) {
  const t = useTranslations('common');
  
  const awaitingReview = tasks.filter(t => t.status === 'ready_for_review').length;
  const readyToPublish = tasks.filter(t => t.status === 'approved').length;

  return (
    <motion.footer 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-0 left-0 right-0 border-t border-slate-800 bg-slate-900/95 backdrop-blur"
    >
      <div className="max-w-5xl mx-auto px-4 py-2 flex items-center justify-between text-[10px] font-mono text-slate-500">
        <span className="flex items-center gap-2">
          <motion.span 
            className="w-1.5 h-1.5 bg-emerald-400 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
          {t('online')}
        </span>
        <span>
          {t('awaitingReview', { count: awaitingReview })} • {t('readyToPublish', { count: readyToPublish })}
        </span>
      </div>
    </motion.footer>
  );
}

export default Footer;
