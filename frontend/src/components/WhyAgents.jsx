import { useRef } from 'react';
import { motion, useMotionTemplate, useMotionValue, useReducedMotion } from 'framer-motion';
import {
  Globe, CheckCheck, ShieldCheck, Radio, FileDown, SlidersHorizontal, ArrowUp, ArrowRight,
  Check, X, Search, MessageSquare, Library, Sparkles, BookOpen,
} from 'lucide-react';
import { BRAND } from '../config/brand';

const EASE = [0.22, 1, 0.36, 1];

const FEATURES = [
  {
    icon: Globe, tag: 'Search', title: 'Grounded in the live web',
    body: 'Reports are built from current search results, not model memory, so topics from this week work as well as the classics.',
    tile: 'bg-sky/10 text-sky', hover: 'group-hover:bg-sky group-hover:text-white',
  },
  {
    icon: CheckCheck, tag: 'Verify', title: 'Claim-level fact checks',
    body: 'Every statement in the draft is tested against the collected evidence, then confirmed, softened or corrected.',
    tile: 'bg-emerald/10 text-emerald', hover: 'group-hover:bg-emerald group-hover:text-white',
  },
  {
    icon: ShieldCheck, tag: 'Review', title: 'Peer-style review',
    body: 'A critic reads the draft for relevance, clarity, structure and evidence, and scores it before you ever see it.',
    tile: 'bg-sun/10 text-sun', hover: 'group-hover:bg-sun group-hover:text-white',
  },
  {
    icon: Radio, tag: 'Transparency', title: 'Every step, streamed live',
    body: 'Progress arrives over Server-Sent Events the moment each stage finishes. No mystery spinner, just a visible hand-off.',
    tile: 'bg-brand/10 text-brand', hover: 'group-hover:bg-brand group-hover:text-white',
  },
  {
    icon: SlidersHorizontal, tag: 'Scope', title: 'Focused, not generic',
    body: 'A refiner turns a broad idea into a clear scope, sharp questions and search queries before any searching starts.',
    tile: 'bg-violet/10 text-violet', hover: 'group-hover:bg-violet group-hover:text-white',
  },
  {
    icon: FileDown, tag: 'Export', title: 'Citable PDF export',
    body: 'Download a clean, research-paper-styled PDF with an abstract, findings and a complete reference list.',
    tile: 'bg-amber/10 text-amber', hover: 'group-hover:bg-amber group-hover:text-white',
  },
];

const FLAGS = ['No sources cited', 'Answers from model memory', 'Claims never verified'];
const WINS = ['Sources linked inline', 'Grounded in live web results', 'Every claim checked, then reviewed'];

/* ------------------------------------------------------------------ */
/* Cursor-follow spotlight card                                        */
/* ------------------------------------------------------------------ */
function SpotlightCard({ children, className = '' }) {
  const x = useMotionValue(-300);
  const y = useMotionValue(-300);
  const glow = useMotionTemplate`radial-gradient(260px circle at ${x}px ${y}px, currentColor, transparent 70%)`;

  return (
    <div
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        x.set(e.clientX - r.left);
        y.set(e.clientY - r.top);
      }}
      className={`group relative overflow-hidden ${className}`}
    >
      <motion.div
        aria-hidden
        style={{ background: glow }}
        className="pointer-events-none absolute inset-0 text-brand opacity-0 transition-opacity duration-300 group-hover:opacity-[0.12]"
      />
      <div className="relative h-full">{children}</div>
    </div>
  );
}

/* Inline citation chip that pops in */
function Cite({ n, delay = 0, reduce }) {
  return (
    <motion.sup
      initial={reduce ? false : { opacity: 0, scale: 0.3 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, type: 'spring', stiffness: 500, damping: 18 }}
      className="mx-0.5 inline-block rounded-md bg-brand/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-brand"
    >
      [{n}]
    </motion.sup>
  );
}


export default function FeaturesSection() {
  const reduce = useReducedMotion();
  const sectionRef = useRef(null);

  return (
    <section
      id="features"
      ref={sectionRef}
      className="relative scroll-mt-20 overflow-hidden border-t border-line bg-canvas"
    >
      {/* ambient background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 text-line opacity-60"
        style={{
          backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
          backgroundSize: '22px 22px',
          maskImage: 'radial-gradient(ellipse 70% 45% at 50% 0%, black, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 45% at 50% 0%, black, transparent 75%)',
        }}
      />
      <motion.div
        aria-hidden
        animate={reduce ? undefined : { x: [0, 40, 0], y: [0, 20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[40rem] max-w-full -translate-x-1/2 rounded-full bg-gradient-to-r from-brand/10 via-sky/10 to-mint/10 blur-3xl"
      />

      <div className="relative mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 lg:py-24">
        {/* ============================ Header ============================ */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mx-auto mb-14 max-w-2xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand shadow-soft backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            Why {BRAND.name}
          </span>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
            Built so every claim{' '}
            <span className="bg-gradient-to-r from-brand via-sky to-mint bg-clip-text text-transparent">
              can be traced.
            </span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-dim sm:text-lg">
            A chat answer asks for your trust. {BRAND.name} earns it by showing the sources, checking the claims and
            letting you watch the work happen.
          </p>
        </motion.div>

        {/* ======================== Before / after ======================== */}
        <div className="grid gap-5 md:grid-cols-2">
          {/* typical */}
          <motion.article
            initial={{ opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease: EASE }}
            className="relative flex flex-col rounded-3xl border border-line bg-white/60 p-6 sm:p-7"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-canvas text-dim">
                  <MessageSquare className="h-4.5 w-4.5" />
                </span>
                <p className="text-sm font-semibold text-dim">A typical AI answer</p>
              </div>
              <span className="rounded-full bg-danger/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-danger">
                Unverified
              </span>
            </div>

            <p className="mt-5 text-[15px] leading-relaxed text-dim">
              Solid-state batteries are{' '}
              <span className="underline decoration-danger/60 decoration-dashed underline-offset-4">widely expected</span>{' '}
              to replace lithium-ion{' '}
              <span className="underline decoration-danger/60 decoration-dashed underline-offset-4">within a few years</span>{' '}
              and will be much cheaper and safer.
            </p>

            <ul className="mt-6 space-y-2.5 border-t border-line pt-5">
              {FLAGS.map((f, i) => (
                <motion.li
                  key={f}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.25 + i * 0.1, duration: 0.4, ease: EASE }}
                  className="flex items-center gap-2.5 text-sm text-dim"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-danger/10 text-danger">
                    <X className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {f}
                </motion.li>
              ))}
            </ul>
          </motion.article>

          {/* product */}
          <motion.article
            initial={{ opacity: 0, x: 28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease: EASE }}
            className="rounded-3xl bg-gradient-to-br from-brand/50 via-sky/40 to-mint/50 p-px shadow-card"
          >
            <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(1.5rem-1px)] bg-white p-6 sm:p-7">
              <span className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-brand/10 blur-3xl" />

              <div className="relative flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white shadow-glow">
                    <Library className="h-4.5 w-4.5" />
                  </span>
                  <p className="text-sm font-semibold">{BRAND.name} report</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-mint/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-mint">
                  <Check className="h-3 w-3" strokeWidth={3} />
                  Verified
                </span>
              </div>

              <p className="relative mt-5 text-[15px] leading-relaxed text-ink">
                Pilot production lines have opened, but cost parity with lithium-ion is still projected to be years away
                <Cite n={1} delay={0.4} reduce={reduce} />
                <Cite n={2} delay={0.52} reduce={reduce} />. Safety gains are supported by controlled cycling tests
                <Cite n={3} delay={0.64} reduce={reduce} />.
              </p>

              <div className="relative mt-4 flex items-center gap-3 rounded-xl border border-line bg-canvas px-3.5 py-2.5">
                <BookOpen className="h-4 w-4 text-brand" />
                <span className="font-mono text-[11px] text-dim">3 sources · 3 of 3 claims verified</span>
                <span className="ml-auto h-1.5 w-16 overflow-hidden rounded-full bg-line">
                  <motion.span
                    className="block h-full rounded-full bg-gradient-to-r from-brand to-mint"
                    initial={{ width: reduce ? '100%' : 0 }}
                    whileInView={{ width: '100%' }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5, duration: 1, ease: EASE }}
                  />
                </span>
              </div>

              <ul className="relative mt-6 space-y-2.5 border-t border-line pt-5">
                {WINS.map((f, i) => (
                  <motion.li
                    key={f}
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.4, ease: EASE }}
                    className="flex items-center gap-2.5 text-sm font-medium"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-mint/10 text-mint">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    {f}
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.article>
        </div>
        <p className="mt-3 text-center text-[11px] text-dim">Illustrative example, not a real report.</p>

        {/* ========================= Feature grid ========================= */}
        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, tag, title, body, tile, hover }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: (i % 3) * 0.08, duration: 0.55, ease: EASE }}
              whileHover={{ y: -6 }}
              className="h-full"
            >
              <SpotlightCard className="h-full rounded-2xl border border-line bg-white p-6 shadow-soft transition-[border-color,box-shadow] duration-300 hover:border-brand/30 hover:shadow-card">
                <span className="absolute inset-x-6 -top-px h-px origin-left scale-x-0 bg-gradient-to-r from-transparent via-brand to-transparent transition-transform duration-500 group-hover:scale-x-100" />

                <div className="flex items-start justify-between">
                  <motion.span
                    whileHover={reduce ? undefined : { rotate: [0, -8, 8, 0], scale: 1.08 }}
                    transition={{ duration: 0.5 }}
                    className={`flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-300 ${tile} ${hover}`}
                  >
                    <Icon className="h-5 w-5" />
                  </motion.span>
                  <span className="rounded-full border border-line bg-canvas px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-dim">
                    {tag}
                  </span>
                </div>

                <h3 className="mt-5 font-body text-base font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-dim">{body}</p>

                <span className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-brand opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
                  Part of every run <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>

       

        {/* ============================ CTA ============================ */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASE }}
          className="mt-16 rounded-[28px] bg-gradient-to-br from-brand/50 via-sky/40 to-mint/50 p-px shadow-card"
        >
          <div className="relative overflow-hidden rounded-[27px] bg-white px-6 py-12 text-center sm:px-12 sm:py-16">
            <div
              aria-hidden
              className="absolute inset-0 text-line opacity-60"
              style={{
                backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
                backgroundSize: '20px 20px',
                maskImage: 'radial-gradient(ellipse at center, black, transparent 70%)',
                WebkitMaskImage: 'radial-gradient(ellipse at center, black, transparent 70%)',
              }}
            />
            <motion.div
              aria-hidden
              animate={reduce ? undefined : { x: [0, 30, 0], y: [0, 20, 0] }}
              transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -left-12 -top-12 h-56 w-56 rounded-full bg-brand/15 blur-3xl"
            />
            <motion.div
              aria-hidden
              animate={reduce ? undefined : { x: [0, -30, 0], y: [0, -20, 0] }}
              transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-16 -right-12 h-64 w-64 rounded-full bg-sky/15 blur-3xl"
            />

            {/* floating icons (desktop) */}
            {[
              { Icon: Search, pos: 'left-[8%] top-[22%]', tone: 'bg-sky/10 text-sky', d: 0 },
              { Icon: CheckCheck, pos: 'right-[9%] top-[18%]', tone: 'bg-emerald/10 text-emerald', d: 0.8 },
              { Icon: FileDown, pos: 'left-[12%] bottom-[18%]', tone: 'bg-amber/10 text-amber', d: 1.4 },
              { Icon: ShieldCheck, pos: 'right-[12%] bottom-[22%]', tone: 'bg-sun/10 text-sun', d: 0.4 },
            ].map(({ Icon, pos, tone, d }) => (
              <motion.span
                key={pos}
                aria-hidden
                animate={reduce ? undefined : { y: [0, -10, 0] }}
                transition={{ duration: 4, delay: d, repeat: Infinity, ease: 'easeInOut' }}
                className={`absolute hidden h-12 w-12 items-center justify-center rounded-2xl border border-line shadow-card lg:flex ${pos} ${tone} bg-white`}
              >
                <Icon className="h-5 w-5" />
              </motion.span>
            ))}

            <div className="relative mx-auto max-w-xl">
              <h3 className="font-display text-2xl font-semibold tracking-tight sm:text-4xl">
                Ready to research{' '}
                <span className="bg-gradient-to-r from-brand via-sky to-mint bg-clip-text text-transparent">
                  something real?
                </span>
              </h3>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-dim sm:text-base">
                Give {BRAND.name} a topic and get a structured, fact-checked, citable paper, with every step in view.
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <motion.a
                  href="#top"
                  whileHover={{ y: -3, scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-brand-dark"
                >
                  {!reduce && (
                    <motion.span
                      aria-hidden
                      className="absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                      animate={{ x: ['0%', '450%'] }}
                      transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 1.2, ease: 'easeInOut' }}
                    />
                  )}
                  <motion.span
                    animate={reduce ? undefined : { y: [0, -3, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                    className="relative"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </motion.span>
                  <span className="relative">Start a new research</span>
                </motion.a>

                <a
                  href="#how-it-works"
                  className="group inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-5 py-3 text-sm font-semibold text-dim shadow-soft transition hover:border-brand/40 hover:text-brand"
                >
                  See how it works
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}