import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Task Manager | Robert & Leon',
  description: 'A two-way task management system for AI-human collaboration',
  robots: 'noindex, nofollow',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  )
}
