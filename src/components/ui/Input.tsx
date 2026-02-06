'use client';

import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const baseStyles = `
  w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm
  text-white placeholder:text-slate-500
  focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50
  transition-colors duration-200
`;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`${baseStyles} ${error ? 'border-red-500' : ''} ${className}`}
          {...props}
        />
        {error && (
          <p className="text-[10px] text-red-400 font-mono">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`${baseStyles} resize-none ${error ? 'border-red-500' : ''} ${className}`}
          {...props}
        />
        {error && (
          <p className="text-[10px] text-red-400 font-mono">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Input;
