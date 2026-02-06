'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';
import Link from 'next/link';

export function Header() {
  const t = useTranslations('common');
  const locale = useLocale();

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="relative border-b border-cyan-500/20 bg-slate-900/90 backdrop-blur-xl sticky top-0 z-40"
    >
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href={`/${locale}`} className="flex items-center gap-3 group">
          <motion.span 
            className="text-3xl"
            whileHover={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.5 }}
          >
            🦞
          </motion.span>
          <div>
            <h1 className="text-lg font-bold">
              <span className="text-cyan-400">ROBERT</span>
              <span className="text-slate-500"> × </span>
              <span className="text-orange-400">LEON</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-mono tracking-wider">
              {t('appSubtitle')}
            </p>
          </div>
        </Link>
        
        {/* Language Switcher */}
        <div className="flex items-center gap-1 text-xs font-mono">
          <Link 
            href="/en" 
            className={`px-2 py-1 transition rounded ${locale === 'en' ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            EN
          </Link>
          <Link 
            href="/es" 
            className={`px-2 py-1 transition rounded ${locale === 'es' ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            ES
          </Link>
          <Link 
            href="/de" 
            className={`px-2 py-1 transition rounded ${locale === 'de' ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            DE
          </Link>
        </div>
      </div>
    </motion.header>
  );
}

export default Header;
