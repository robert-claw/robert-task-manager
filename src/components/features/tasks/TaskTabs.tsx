'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Task, Assignee } from '@/lib/types';
import { getActiveCount } from '@/lib/utils';
import { Button } from '@/components/ui';

interface TaskTabsProps {
  tasks: Task[];
  activeTab: Assignee;
  onTabChange: (tab: Assignee) => void;
}

export function TaskTabs({ tasks, activeTab, onTabChange }: TaskTabsProps) {
  const t = useTranslations('tasks');

  const leonTasks = tasks.filter(t => t.assignedTo === 'leon');
  const robertTasks = tasks.filter(t => t.assignedTo === 'robert');

  const tabs = [
    {
      id: 'leon' as Assignee,
      label: t('tabs.leon'),
      icon: '👤',
      color: 'orange',
      count: getActiveCount(leonTasks),
    },
    {
      id: 'robert' as Assignee,
      label: t('tabs.robert'),
      icon: '🦞',
      color: 'cyan',
      count: getActiveCount(robertTasks),
    },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="border-b border-slate-800 bg-slate-900/50 sticky top-[57px] z-30"
    >
      <div className="max-w-5xl mx-auto px-4 flex">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                relative px-4 py-3 font-mono text-xs flex items-center gap-2 transition
                ${isActive 
                  ? tab.color === 'orange' ? 'text-orange-400' : 'text-cyan-400'
                  : 'text-slate-500 hover:text-slate-300'
                }
              `}
              role="tab"
              aria-selected={isActive}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span 
                className={`
                  px-1.5 py-0.5 rounded text-[10px]
                  ${isActive 
                    ? tab.color === 'orange' ? 'bg-orange-500/20' : 'bg-cyan-500/20'
                    : 'bg-slate-800'
                  }
                `}
              >
                {tab.count}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                    tab.color === 'orange' ? 'bg-orange-500' : 'bg-cyan-500'
                  }`}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

export default TaskTabs;
