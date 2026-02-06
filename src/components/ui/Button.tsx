'use client';

import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';
import { motion } from 'framer-motion';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'cyan' | 'amber' | 'emerald' | 'violet' | 'rose';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  icon?: string;
  children?: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-cyan-500 text-slate-900 font-semibold hover:bg-cyan-400',
  secondary: 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-300',
  danger: 'bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20',
  ghost: 'bg-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-800/50',
  cyan: 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20',
  amber: 'bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20',
  emerald: 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20',
  violet: 'bg-violet-500/10 border border-violet-500/30 text-violet-400 hover:bg-violet-500/20',
  rose: 'bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', icon, children, disabled, onClick, type = 'button' }, ref) => {
    return (
      <motion.button
        ref={ref}
        type={type}
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        className={`
          inline-flex items-center justify-center gap-2 rounded-lg font-mono
          transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `}
        disabled={disabled}
        onClick={onClick}
      >
        {icon && <span>{icon}</span>}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
