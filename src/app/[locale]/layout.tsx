import { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import '@/app/globals.css';

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  
  const titles: Record<string, string> = {
    en: 'Robert Task Manager | Collaboration HQ',
    es: 'Gestor de Tareas Robert | Centro de Colaboración',
    de: 'Robert Aufgabenmanager | Kollaborationszentrale',
  };
  
  const descriptions: Record<string, string> = {
    en: 'Collaborative task management application for Robert & Leon. Track tasks, content, and blog posts with a futuristic sci-fi interface.',
    es: 'Aplicación colaborativa de gestión de tareas para Robert y León. Seguimiento de tareas, contenido y publicaciones de blog con una interfaz futurista de ciencia ficción.',
    de: 'Kollaborative Aufgabenverwaltung für Robert & Leon. Verfolgen Sie Aufgaben, Inhalte und Blog-Beiträge mit einer futuristischen Sci-Fi-Oberfläche.',
  };

  return {
    title: titles[locale] || titles.en,
    description: descriptions[locale] || descriptions.en,
    keywords: ['task manager', 'collaboration', 'project management', 'sci-fi', 'futuristic'],
    authors: [{ name: 'Robert & Leon' }],
    openGraph: {
      title: titles[locale] || titles.en,
      description: descriptions[locale] || descriptions.en,
      type: 'website',
      locale: locale,
      siteName: 'Robert Task Manager',
    },
    twitter: {
      card: 'summary_large_image',
      title: titles[locale] || titles.en,
      description: descriptions[locale] || descriptions.en,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  
  // Validate locale
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Load messages
  const messages = await getMessages();

  // JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Robert Task Manager',
    applicationCategory: 'ProjectManagement',
    operatingSystem: 'Web',
    description: 'Collaborative task management application with a futuristic interface',
    author: {
      '@type': 'Organization',
      name: 'Robert & Leon',
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'Task tracking',
      'Content management',
      'Review workflow',
      'Multi-language support',
      'Real-time collaboration',
    ],
  };

  return (
    <html lang={locale}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
