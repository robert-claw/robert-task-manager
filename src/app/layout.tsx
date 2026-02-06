import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Community Manager | Content Management Platform',
  description: 'A professional content management platform for multi-project social media and blog management',
  robots: 'noindex, nofollow',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-slate-950 text-white">
        {children}
      </body>
    </html>
  )
}
