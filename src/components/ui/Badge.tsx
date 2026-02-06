'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

type BadgeVariant = 'default' | 'urgent' | 'high' | 'medium' | 'low' | 'custom';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
  pulse?: boolean;
  icon?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-slate-800 text-slate-400',
  urgent: 'bg-red-500/20 text-red-400',
  high: 'bg-orange-500/20 text-orange-400',
  medium: 'bg-yellow-500/20 text-yellow-400',
  low: 'bg-slate-500/20 text-slate-400',
  custom: '',
};

export function Badge({ children, variant = 'default', className = '', pulse, icon }: BadgeProps) {
  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`
        inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono
        ${variantStyles[variant]}
        ${pulse ? 'animate-pulse' : ''}
        ${className}
      `}
    >
      {icon && <span>{icon}</span>}
      {children}
    </motion.span>
  );
}

export default Badge;
