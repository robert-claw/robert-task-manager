'use client';

import { motion } from 'framer-motion';

export function Footer() {
  return (
    <motion.footer 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="border-t border-slate-800 bg-slate-900/95 backdrop-blur mt-auto"
    >
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between text-xs font-mono text-slate-500">
        <span className="flex items-center gap-2">
          <motion.span 
            className="w-1.5 h-1.5 bg-emerald-400 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
          ONLINE
        </span>
        <a 
          href="https://robert-claw.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-cyan-400 transition"
        >
          robert-claw.com
        </a>
      </div>
    </motion.footer>
  );
}

export default Footer;
