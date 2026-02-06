'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface Tab {
  id: string;
  label: string;
  icon?: string;
  count?: number;
  color?: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className = '' }: TabsProps) {
  return (
    <div className={`flex ${className}`}>
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        const colorClass = tab.color || 'cyan';
        
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              relative px-4 py-3 font-mono text-xs flex items-center gap-2 transition
              ${isActive ? `text-${colorClass}-400` : 'text-slate-500 hover:text-slate-300'}
            `}
            role="tab"
            aria-selected={isActive}
          >
            {tab.icon && <span>{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span 
                className={`
                  px-1.5 py-0.5 rounded text-[10px]
                  ${isActive ? `bg-${colorClass}-500/20` : 'bg-slate-800'}
                `}
              >
                {tab.count}
              </span>
            )}
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className={`absolute bottom-0 left-0 right-0 h-0.5 bg-${colorClass}-500`}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;
