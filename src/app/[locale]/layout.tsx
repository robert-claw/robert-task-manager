import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { routing } from '@/i18n/routing';
import { Header, Footer, PageContainer } from '@/components/layout';
import '../globals.css';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'common' });

  const title = t('appName');
  const description = t('appSubtitle');

  return {
    title: {
      default: `${title} | Robert × Leon`,
      template: `%s | ${title}`,
    },
    description,
    keywords: ['Task Manager', 'Collaboration', 'Robert Claw', 'Productivity', 'AI'],
    authors: [{ name: 'Robert Claw', url: 'https://robert-claw.com' }],
    creator: 'Robert Claw',
    publisher: 'Robert Claw',
    metadataBase: new URL('https://task-manager.robert-claw.com'),
    alternates: {
      canonical: '/',
      languages: {
        'en': '/en',
        'es': '/es',
        'de': '/de',
      },
    },
    openGraph: {
      type: 'website',
      locale: locale,
      url: 'https://task-manager.robert-claw.com',
      siteName: 'Task Manager',
      title: `${title} | Robert × Leon`,
      description,
      images: [
        {
          url: '/opengraph-image',
          width: 1200,
          height: 630,
          alt: 'Task Manager - Robert × Leon Collaboration',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Robert × Leon`,
      description,
      images: ['/opengraph-image'],
    },
    robots: {
      index: false, // Private task manager - don't index
      follow: false,
    },
    icons: {
      icon: '/icon',
      apple: '/apple-icon',
    },
  };
}

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Task Manager',
    description: 'Two-way task collaboration system for Robert Claw and Leon',
    applicationCategory: 'ProductivityApplication',
    operatingSystem: 'Web',
    url: 'https://task-manager.robert-claw.com',
    author: {
      '@type': 'Person',
      name: 'Robert Claw',
      url: 'https://robert-claw.com'
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  return (
    <html lang={locale}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-slate-950 text-white antialiased">
        <NextIntlClientProvider messages={messages}>
          <div className="min-h-screen flex flex-col">
            <Header />
            <PageContainer>
              {children}
            </PageContainer>
            <Footer />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
