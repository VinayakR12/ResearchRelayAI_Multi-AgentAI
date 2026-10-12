import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Atom, Menu, X } from 'lucide-react';
import { BRAND } from '../config/brand';

const LINKS = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Pipeline', href: '#pipeline' },
  { label: 'Report', href: '#report' },
  { label: 'Features', href: '#features' },
];

export default function Navbar({ isRunning }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        scrolled ? 'border-b border-line/80 bg-white/80 shadow-soft backdrop-blur-xl' : 'border-b border-transparent bg-transparent'
      }`}
    >
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
        {/* Logo */}
        <a href="#top" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-sky text-white shadow-glow">
            <Atom className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">
            {BRAND.name}
            <span className="ml-1.5 hidden font-normal text-dim sm:inline">{BRAND.suffix}</span>
          </span>
        </a>

        {/* Desktop links */}
        <ul className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-dim transition hover:bg-brand/5 hover:text-brand"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          {/* Status pill */}
          <span
            className={`hidden items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium sm:inline-flex ${
              isRunning ? 'border-sun/30 bg-sun/10 text-sun' : 'border-mint/30 bg-mint/10 text-mint'
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span
                className={`absolute inline-flex h-full w-full animate-ping2 rounded-full ${isRunning ? 'bg-sun' : 'bg-mint'}`}
              />
              <span className={`relative inline-flex h-2 w-2 rounded-full ${isRunning ? 'bg-sun' : 'bg-mint'}`} />
            </span>
            {isRunning ? 'Agents working' : 'Agents ready'}
          </span>

          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-white text-ink md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-line bg-white md:hidden"
          >
            <ul className="space-y-1 px-5 py-4">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-brand/5 hover:text-brand"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}