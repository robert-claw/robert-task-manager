'use client';

import { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
}

export function PageContainer({ children }: PageContainerProps) {
  return (
    <main className="flex-1 relative">
      {/* Grid background */}
      <div 
        className="fixed inset-0 opacity-[0.03] pointer-events-none" 
        style={{
          backgroundImage: 'linear-gradient(rgba(6,182,212,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} 
      />
      
      {/* Content */}
      <div className="relative max-w-5xl mx-auto px-4">
        {children}
      </div>
    </main>
  );
}

export default PageContainer;
