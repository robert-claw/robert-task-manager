'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Assignee } from '@/lib/types';
import { Button } from '@/components/ui';

interface TaskTabsProps {
  activeTab: Assignee;
  onTabChange: (tab: Assignee) => void;
  leonCount: number;
  robertCount: number;
  onNewTask: () => void;
}

export function TaskTabs({ 
  activeTab, 
  onTabChange, 
  leonCount, 
  robertCount, 
  onNewTask 
}: TaskTabsProps) {
  const t = useTranslations('tasks');

  const tabs = [
    {
      id: 'leon' as Assignee,
      label: t('tabs.forLeon'),
      icon: '👤',
      count: leonCount,
      color: 'orange',
    },
    {
      id: 'robert' as Assignee,
      label: t('tabs.forRobert'),
      icon: '🦞',
      count: robertCount,
      color: 'cyan',
    },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-b border-slate-800 bg-slate-900/50 sticky top-0 z-30"
    >
      <div className="max-w-5xl mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                relative px-4 py-2 rounded-lg font-medium text-sm transition-all
                flex items-center gap-2
                ${activeTab === tab.id 
                  ? tab.color === 'orange'
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                    : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }
              `}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className={`
                  text-xs px-1.5 py-0.5 rounded-full
                  ${activeTab === tab.id
                    ? tab.color === 'orange' 
                      ? 'bg-orange-500/30' 
                      : 'bg-cyan-500/30'
                    : 'bg-slate-700'
                  }
                `}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
        
        <Button onClick={onNewTask} variant="primary" size="sm">
          + {t('newTask')}
        </Button>
      </div>
    </motion.div>
  );
}

export default TaskTabs;
