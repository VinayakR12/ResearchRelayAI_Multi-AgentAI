import { useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
} from 'framer-motion';
import {
  Search, BookOpen, PenLine, ShieldCheck, Radio, Globe, FileDown, ArrowUp,
  CheckCheck, Check, SlidersHorizontal, ArrowRight, Play, Pause,
} from 'lucide-react';
import { BRAND } from '../config/brand';

const STEP_DURATION = 4; 

const STEPS = [
  {
    icon: SlidersHorizontal, tile: 'bg-sky text-sky/10', solid: 'bg-sky', text: 'text-sky',
    title: 'Topic Refiner', output: 'Scope · Questions · Queries',
    body: 'Turns a broad idea into a focused research scope, useful questions, keywords, and search queries.',
  },
  {
    icon: Search, tile: 'bg-brand text-brand', solid: 'bg-brand', text: 'text-brand',
    title: 'Search Agent', output: 'Titles · URLs · Snippets',
    body: 'Searches the live web for relevant sources and metadata instead of relying on model memory.',
  },
  {
    icon: BookOpen, tile: 'bg-mint text-mint', solid: 'bg-mint', text: 'text-mint',
    title: 'Reader Agent', output: 'Evidence · Passages · Findings',
    body: 'Reads the strongest sources, extracts useful passages, and prepares evidence for the writing stage.',
  },
  {
    icon: PenLine, tile: 'bg-sun text-sun', solid: 'bg-sun', text: 'text-sun',
    title: 'Writer Agent', output: 'Academic report',
    body: 'Transforms the evidence into a clear report with findings, discussion, limitations, and source citations.',
  },
  {
    icon: ShieldCheck, tile: 'bg-mint text-mint', solid: 'bg-mint', text: 'text-mint',
    title: 'Critic Agent', output: 'Review · Score · Improvements',
    body: 'Reviews the draft for relevance, clarity, structure, accuracy, and evidence support.',
  },
  {
    icon: CheckCheck, tile: 'bg-sky text-sky', solid: 'bg-sky', text: 'text-sky',
    title: 'Fact Checker', output: 'Claim status · Sources',
    body: 'Breaks the report into checkable claims and tests each claim against the collected evidence.',
  },
  {
    icon: Check, tile: 'bg-brand text-brand', solid: 'bg-brand', text: 'text-brand/10',
    title: 'Cross-Reference', output: 'Titles · Abstract · References',
    body: 'Cross-validates the findings and assembles the final academic paper package for reading or PDF export.',
  },
];

const FEATURES = [
  { icon: Radio, title: 'Truly live', body: 'Every step streams over Server-Sent Events the moment it finishes.' },
  { icon: Globe, title: 'Grounded in the web', body: 'Reports are built from real, current search results — not model memory.' },
  { icon: ShieldCheck, title: 'Built-in review', body: 'A critic agent reads the draft like a peer reviewer and scores it.' },
  { icon: FileDown, title: 'One-click PDF', body: 'Export a clean, research-paper-styled PDF when you are done.' },
];

const STACK = ['FastAPI', 'LangChain', 'Tavily', 'Groq', 'Server-Sent Events', 'React'];

const EASE = [0.22, 1, 0.36, 1];

function SpotlightCard({ children, className = '' }) {
  const x = useMotionValue(-300);
  const y = useMotionValue(-300);
  const glow = useMotionTemplate`radial-gradient(240px circle at ${x}px ${y}px, currentColor, transparent 70%)`;

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
        className="pointer-events-none absolute inset-0 text-brand opacity-0 transition-opacity duration-300 group-hover:opacity-[0.14]"
      />
      <div className="relative">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main section                                                        */
/* ------------------------------------------------------------------ */
export default function InfoSection() {
  const reduce = useReducedMotion();
  const pipelineRef = useRef(null);
  const inView = useInView(pipelineRef, { amount: 0.35 });

  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);
  const playing = auto && inView && !reduce;

  const step = STEPS[active];
  const next = STEPS[(active + 1) % STEPS.length];
  const StepIcon = step.icon;
  const outputs = step.output.split(' · ');
  const fillPct = (active / (STEPS.length - 1)) * 100;

  return (
    <>
      {/* ============================ How it works ============================ */}
      <section id="how-it-works" className="relative scroll-mt-20 overflow-hidden border-t border-line bg-white">
        {/* ambient background */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.35] text-line"
          style={{
            backgroundImage:
              'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)',
            backgroundSize: '44px 44px',
            maskImage: 'radial-gradient(ellipse 70% 60% at 50% 30%, black, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 30%, black, transparent 75%)',
          }}
        />
        <motion.div
          aria-hidden
          animate={reduce ? undefined : { x: [0, 40, 0], y: [0, 20, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-brand/10 blur-3xl"
        />

        <div ref={pipelineRef} className="relative mx-auto w-full max-w-6xl px-5 py-20 sm:px-8">
          {/* heading */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: EASE }}
            className="mx-auto mb-14 max-w-2xl text-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
              </span>
              How it works
            </span>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Seven agents.{' '}
              <span className="bg-gradient-to-r from-brand via-sky to-mint bg-clip-text text-transparent">
                One connected research relay.
              </span>
            </h2>
            <p className="mt-3 text-dim">
              {BRAND.name} hands your question through seven specialised stages: refine, search, read, write, critique, verify, and cross-reference.
            </p>
          </motion.div>

          {/* stepper */}
          <div className="relative">
            {/* track */}
            <div className="absolute left-[calc(100%/14)] right-[calc(100%/14)] top-6 h-0.5 -translate-y-1/2 rounded-full bg-line sm:top-7">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-sky via-brand to-mint"
                animate={{ width: `${fillPct}%` }}
                transition={{ duration: 0.6, ease: EASE }}
              />
            </div>

            <div className="relative grid grid-cols-7">
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                const isActive = i === active;
                const isDone = i < active;
                return (
                  <motion.button
                    key={s.title}
                    type="button"
                    aria-label={s.title}
                    aria-current={isActive ? 'step' : undefined}
                    onClick={() => { setActive(i); setAuto(false); }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07, duration: 0.5, ease: EASE }}
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.95 }}
                    className="group flex flex-col items-center gap-2 focus:outline-none"
                  >
                    <span className="relative flex h-12 w-12 items-center  justify-center sm:h-14 sm:w-14">
                      {isActive && (
                        <motion.span
                          layoutId="step-halo"
                          className={`absolute inset-0 rounded-2xl opacity-25 blur-md ${s.solid}`}
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                      <span
                        className={`relative z-10 flex h-full w-full items-center justify-center rounded-2xl border-4 border-white shadow-soft transition-colors duration-300 group-focus-visible:ring-2 group-focus-visible:ring-brand ${
                          isActive ? `${s.solid} text-white shadow-glow` : isDone ? `${s.tile} text-white` : 'bg-white text-dim'
                        }`}
                      >
                        <Icon className="h-5 w-5 sm:h-6 sm:w-6 " />
                      </span>
                    </span>
                    <span className="font-mono text-[10px] font-semibold tracking-[0.14em] text-dim">0{i + 1}</span>
                    <span
                      className={`hidden text-center font-body text-[11px] font-semibold leading-tight transition-colors sm:block ${
                        isActive ? s.text : 'text-dim group-hover:text-ink'
                      }`}
                    >
                      {s.title}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* detail panel */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
            className="relative mt-10 overflow-hidden rounded-3xl border border-line bg-white shadow-card"
          >
            {/* autoplay progress */}
            <div className="h-1 w-full bg-line/60">
              {playing ? (
                <motion.div
                  key={active}
                  className={`h-full origin-left ${step.solid}`}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: STEP_DURATION, ease: 'linear' }}
                  onAnimationComplete={() => setActive((a) => (a + 1) % STEPS.length)}
                />
              ) : (
                <div className={`h-full w-full ${step.solid} opacity-40`} />
              )}
            </div>

            <div className="grid gap-8 p-6 sm:p-8 md:grid-cols-[1.2fr_1fr]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`left-${active}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.35, ease: EASE }}
                >
                  <div className="flex items-center gap-4">
                    <span className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-soft ${step.tile}`}>
                      <StepIcon className="h-7 w-7 text-white" />
                    </span>
                    <div>
                      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-dim">
                        Stage 0{active + 1} / 0{STEPS.length}
                      </p>
                      <h3 className="font-display text-2xl font-semibold tracking-tight">{step.title}</h3>
                    </div>
                  </div>
                  <p className="mt-5 max-w-lg text-base leading-relaxed text-dim">{step.body}</p>

                  <div className="mt-6 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setAuto((v) => !v)}
                      className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3.5 py-1.5 text-xs font-semibold text-dim transition hover:border-brand/30 hover:text-brand"
                    >
                      {auto ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                      {auto ? 'Pause tour' : 'Play tour'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setActive((a) => (a + 1) % STEPS.length); setAuto(false); }}
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold transition hover:gap-2.5 ${next.text}`}
                    >
                      Next: {next.title}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* output "stream" mock */}
              <div className="rounded-2xl border border-line bg-canvas p-5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-dim">
                    Output stream
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald opacity-70" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald" />
                    </span>
                    LIVE
                  </span>
                </div>

                <AnimatePresence mode="wait">
                  <motion.ul
                    key={`out-${active}`}
                    initial="hidden"
                    animate="show"
                    exit={{ opacity: 0 }}
                    variants={{ show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } } }}
                    className="mt-4 space-y-2.5"
                  >
                    {outputs.map((o) => (
                      <motion.li
                        key={o}
                        variants={{ hidden: { opacity: 0, x: 16 }, show: { opacity: 1, x: 0 } }}
                        transition={{ duration: 0.4, ease: EASE }}
                        className="flex items-center gap-3 rounded-xl border border-line bg-white px-3.5 py-2.5 shadow-soft"
                      >
                        <span className={`flex h-6 w-6 items-center justify-center rounded-full ${step.tile} text-white`}>
                          <Check className="h-3.5 w-3.5" />
                        </span>
                        <span className="text-sm font-medium">{o}</span>
                        <span className="ml-auto h-1.5 w-12 overflow-hidden rounded-full bg-line">
                          <motion.span
                            className={`block h-full rounded-full ${step.solid}`}
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 0.9, delay: 0.3, ease: EASE }}
                          />
                        </span>
                      </motion.li>
                    ))}
                  </motion.ul>
                </AnimatePresence>

                <div className="mt-4 flex items-center gap-2 border-t border-line pt-3 text-[11px] text-dim">
                  <ArrowRight className="h-3.5 w-3.5" />
                  Handing off to <span className={`font-semibold ${next.text}`}>{next.title}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

    </>
  );
}