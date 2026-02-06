'use client';

import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CardProps {
  children: ReactNode;
  className?: string;
  gradient?: string;
  onClick?: () => void;
  expanded?: boolean;
}

export function Card({ children, className = '', gradient, onClick, expanded }: CardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`
        relative bg-gradient-to-r ${gradient || 'from-slate-800/50 to-slate-900/50'} 
        border rounded-xl backdrop-blur transition-all
        ${expanded ? 'ring-1 ring-white/10' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}

interface CardSectionProps {
  children: ReactNode;
  className?: string;
  border?: boolean;
}

export function CardSection({ children, className = '', border = false }: CardSectionProps) {
  return (
    <div className={`p-4 ${border ? 'border-t border-white/5' : ''} ${className}`}>
      {children}
    </div>
  );
}

interface CardExpandedContentProps {
  children: ReactNode;
  isOpen: boolean;
}

export function CardExpandedContent({ children, isOpen }: CardExpandedContentProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="border-t border-white/5 p-4 space-y-4">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Card;
