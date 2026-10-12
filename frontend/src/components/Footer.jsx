import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUp, Atom } from 'lucide-react';
import { BRAND } from '../config/brand';

const LINKS = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
  { label: 'Start research', href: '#top' },
];

export default function Footer() {
  const reduce = useReducedMotion();
  const year = new Date().getFullYear();

  return (
    <footer className="relative isolate overflow-hidden bg-gradient-to-b from-canvas via-canvas to-sky/10">
      {/* gradient hairline */}
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/50 to-transparent" />

      {/* soft background glows */}
      <motion.div
        aria-hidden
        animate={reduce ? undefined : { x: [0, 30, 0], y: [0, 16, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute -left-24 top-0 -z-10 h-72 w-72 rounded-full bg-brand/15 blur-[100px]"
      />
      <motion.div
        aria-hidden
        animate={reduce ? undefined : { x: [0, -30, 0], y: [0, -16, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute -right-24 bottom-10 -z-10 h-72 w-72 rounded-full bg-sky/15 blur-[100px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 -z-10 h-56 w-[36rem] max-w-full -translate-x-1/2 rounded-full bg-mint/10 blur-[100px]"
      />

      <div className="mx-auto w-full max-w-6xl px-5 pt-14 sm:px-8">
      

        {/* Brand + links */}
        <div className="mt-12 flex flex-col items-center gap-8 text-center md:flex-row md:items-start md:justify-between md:text-left">
          <div className="max-w-xs">
            <a href="#top" className="inline-flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-sky text-white shadow-soft">
                <Atom className="h-[18px] w-[18px]" />
              </span>
              <span className="font-display text-lg font-semibold tracking-tight">
                {BRAND.name}
                <span className="ml-1.5 font-normal text-dim">{BRAND.suffix}</span>
              </span>
            </a>
            <p className="mt-3 text-sm leading-relaxed text-dim">
              Research that is written, fact-checked and cited, with every step in view.
            </p>
          </div>

          <nav aria-label="Footer">
            <ul className="flex flex-wrap items-center justify-center gap-2 md:justify-end">
              {LINKS.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="inline-block rounded-full border border-line bg-white/70 px-4 py-2 text-sm font-medium text-dim shadow-soft backdrop-blur transition hover:-translate-y-0.5 hover:border-brand/40 hover:text-brand"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-line pt-6 text-center sm:flex-row sm:text-left">
          <p className="text-xs leading-relaxed text-dim">
            © {year} {BRAND.name}. AI-generated research can contain errors, so check key claims against the sources.
          </p>
          <a
            href="#top"
            className="group inline-flex items-center gap-2 text-xs font-semibold text-dim transition-colors hover:text-brand"
          >
            Back to top
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-line bg-white shadow-soft transition group-hover:border-brand/40">
              <ArrowUp className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5" />
            </span>
          </a>
        </div>
      </div>

      {/* Gradient wordmark */}
      <div aria-hidden className="pointer-events-none mt-6 select-none overflow-hidden">
        <p className="-mb-[0.18em] whitespace-nowrap bg-gradient-to-b from-brand/25 via-sky/15 to-transparent bg-clip-text text-center font-display text-[18vw] font-semibold leading-[0.9] tracking-tight text-transparent sm:text-[14vw] lg:text-[11rem]">
          {BRAND.name}
        </p>
      </div>
    </footer>
  );
}