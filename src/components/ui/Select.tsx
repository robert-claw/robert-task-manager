'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface SelectOption<T extends string> {
  value: T;
  label: string;
  icon?: string;
}

interface SelectProps<T extends string> {
  options: SelectOption<T>[];
  value: T;
  onChange: (value: T) => void;
  columns?: number;
  getStyle?: (value: T, isSelected: boolean) => string;
  className?: string;
}

export function Select<T extends string>({ 
  options, 
  value, 
  onChange, 
  columns = options.length,
  getStyle,
  className = '' 
}: SelectProps<T>) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  }[columns] || 'grid-cols-2';

  return (
    <div className={`grid ${gridCols} gap-2 ${className}`}>
      {options.map(option => {
        const isSelected = value === option.value;
        const customStyle = getStyle?.(option.value, isSelected);
        
        return (
          <motion.button
            key={option.value}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onChange(option.value)}
            className={
              customStyle || `
                py-2 rounded-lg text-sm font-mono transition
                ${isSelected 
                  ? 'bg-cyan-500/20 border-2 border-cyan-500 text-cyan-400'
                  : 'bg-slate-800 border-2 border-slate-700 text-slate-400 hover:border-slate-600'
                }
              `
            }
            type="button"
          >
            {option.icon && <span className="mr-1">{option.icon}</span>}
            {option.label}
          </motion.button>
        );
      })}
    </div>
  );
}

export default Select;
