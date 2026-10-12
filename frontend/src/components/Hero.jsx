import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, animate, motion, useInView, useReducedMotion } from 'framer-motion';
import {
  Sparkles, Search, ArrowRight, Loader2, Check, Globe, ShieldCheck, CheckCheck, PenLine, FileDown,
  CornerDownLeft, FlaskConical, Cpu, Landmark, HeartPulse, GraduationCap, Newspaper, Building2,
  FileText, Microscope, BarChart3,
} from 'lucide-react';
import { toastWarning } from '../utils/alerts';
import { BRAND } from '../config/brand';

const EASE = [0.22, 1, 0.36, 1];


const CATEGORIES = [
  {
    key: 'Science', icon: FlaskConical,
    topics: ['CRISPR gene therapy', 'Solid-state batteries', 'Fusion energy milestones', 'Microplastics and human health'],
  },
  {
    key: 'Tech', icon: Cpu,
    topics: ['Quantum computing in 2026', 'Large language model safety', 'Neuromorphic chips', 'Edge AI on mobile devices'],
  },
  {
    key: 'Policy', icon: Landmark,
    topics: ['AI regulation in the EU', 'Carbon border taxes', 'Digital identity systems', 'The future of remote work'],
  },
  {
    key: 'Health', icon: HeartPulse,
    topics: ['mRNA vaccines beyond COVID', 'Gut microbiome and mood', 'Sleep and memory', 'GLP-1 drugs: long-term effects'],
  },
];

const PLACEHOLDERS = ['Quantum computing in 2026', 'Solid-state batteries', 'AI regulation in the EU', 'CRISPR gene therapy'];

const TRUST = [
  { icon: Globe, label: 'Live web sources' },
  { icon: CheckCheck, label: 'Claim-level fact checks' },
  { icon: FileDown, label: 'Citable PDF export' },
];

const HEADLINE = [
  { t: 'From' },
  { t: 'Question' },
  { t: 'to' },
  { t: 'Cited Report', g: true },
  { t: 'in' },
  { t: 'Under a Minute.', u: true },
];

const SOURCES = [
  { id: 1, icon: GraduationCap, tone: 'bg-mint/10 text-mint', type: 'Peer-reviewed journal', title: 'Electrolyte stability under repeated cycling', rel: 96 },
  { id: 2, icon: FileText, tone: 'bg-brand/10 text-brand', type: 'Preprint', title: 'Interface engineering for lithium-metal anodes', rel: 91 },
  { id: 3, icon: Newspaper, tone: 'bg-sky/10 text-sky', type: 'News coverage', title: 'Manufacturers announce pilot production lines', rel: 84 },
  { id: 4, icon: BarChart3, tone: 'bg-violet/10 text-violet', type: 'Industry report', title: 'Cost curves and supply-chain outlook', rel: 88 },
  { id: 5, icon: Building2, tone: 'bg-sun/10 text-sun', type: 'Government data', title: 'Research funding and policy overview', rel: 79 },
  { id: 6, icon: Microscope, tone: 'bg-emerald/10 text-emerald', type: 'University lab', title: 'Open dataset of cell performance tests', rel: 86 },
];

const REPORT = [
  { n: '01', label: 'Findings', lines: ['100%', '92%', '68%'], cites: [1, 2] },
  { n: '02', label: 'Discussion', lines: ['96%', '84%'], cites: [3] },
  { n: '03', label: 'Limitations', lines: ['90%', '55%'], cites: [4, 5] },
];

const CLAIMS = [
  { text: 'Lab cells outperform liquid-electrolyte designs', result: 'verified', note: 'Matched 3 sources' },
  { text: 'Pilot production lines opened in recent years', result: 'verified', note: 'Matched 2 sources' },
  { text: 'Cost parity is expected within a decade', result: 'corrected', note: 'Wording softened to match evidence' },
];

const METRICS = [
  { label: 'Relevance', v: 96, bar: 'bg-brand' },
  { label: 'Clarity', v: 90, bar: 'bg-sky' },
  { label: 'Structure', v: 94, bar: 'bg-mint' },
  { label: 'Evidence', v: 88, bar: 'bg-violet' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.09, duration: 0.6, ease: EASE },
  }),
};


function useTypewriter(words, enabled) {
  const [text, setText] = useState(words[0]);

  useEffect(() => {
    if (!enabled) {
      setText(words[0]);
      return;
    }
    let w = 0;
    let c = 0;
    let deleting = false;
    let t;

    const tick = () => {
      const word = words[w];
      if (!deleting) {
        c += 1;
        setText(word.slice(0, c));
        if (c === word.length) {
          deleting = true;
          t = setTimeout(tick, 1600);
          return;
        }
        t = setTimeout(tick, 55);
      } else {
        c -= 1;
        setText(word.slice(0, c));
        if (c === 0) {
          deleting = false;
          w = (w + 1) % words.length;
          t = setTimeout(tick, 300);
          return;
        }
        t = setTimeout(tick, 26);
      }
    };

    tick();
    return () => clearTimeout(t);
  }, [enabled, words]);

  return text;
}

export default function Hero({ topic, setTopic, onRun, isRunning }) {
  const reduce = useReducedMotion();
  const [shake, setShake] = useState(false);
  const [cat, setCat] = useState(0);

  const typed = useTypewriter(PLACEHOLDERS, !reduce && !isRunning);

  function triggerShake() {
    setShake(true);
    setTimeout(() => setShake(false), 450);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (isRunning) return;

    const value = topic.trim();
    if (!value) {
      triggerShake();
      toastWarning('Add a topic first', 'Tell the agents what to research.');
      return;
    }
    if (value.length < 3) {
      triggerShake();
      toastWarning('Topic is too short', 'Try at least 3 characters.');
      return;
    }
    onRun(value);
  }

  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-b from-white via-white to-canvas">
   
      <div
        aria-hidden
        className="absolute inset-0 -z-10 text-line opacity-60"
        style={{
          backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
          backgroundSize: '22px 22px',
          maskImage: 'radial-gradient(ellipse 70% 55% at 50% 20%, black, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 55% at 50% 20%, black, transparent 75%)',
        }}
      />
      <motion.div
        aria-hidden
        className="absolute left-1/2 top-[-7rem] -z-10 h-80 w-[46rem] max-w-full -translate-x-1/2 rounded-full bg-gradient-to-r from-brand/20 via-sky/20 to-mint/20 blur-[100px]"
        animate={reduce ? undefined : { scale: [1, 1.12, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="absolute -left-28 top-[40%] -z-10 h-72 w-72 rounded-full bg-violet/10 blur-[100px]"
        animate={reduce ? undefined : { y: [0, 40, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="absolute -right-28 top-[30%] -z-10 h-72 w-72 rounded-full bg-sky/15 blur-[100px]"
        animate={reduce ? undefined : { y: [0, -40, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="mx-auto w-full max-w-6xl px-5 pb-20 pt-14 sm:px-8 sm:pt-20 lg:pb-28">
        {/* ====================== Intro ====================== */}
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0}
            className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-white/80 px-3.5 py-1.5 shadow-soft backdrop-blur"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-mint" />
            </span>
            <span className="text-xs font-semibold text-brand">AI research workspace · {BRAND.name}</span>
          </motion.div>

          <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.75rem]">
            {HEADLINE.map((w, i) => (
              <motion.span
                key={w.t}
                initial={{ opacity: 0, y: 18, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ delay: 0.15 + i * 0.09, duration: 0.6, ease: EASE }}
                className={`inline-block ${i < HEADLINE.length - 1 ? 'mr-[0.28em]' : ''} ${w.u ? 'relative' : ''} ${
                  w.g ? 'animate-gradient bg-gradient-to-r from-brand via-sky to-brand bg-[length:200%_auto] bg-clip-text text-transparent' : ''
                }`}
              >
                {w.t}
                {w.u && (
                  <svg
                    aria-hidden
                    viewBox="0 0 200 12"
                    preserveAspectRatio="none"
                    fill="none"
                    className="absolute -bottom-2 left-0 h-3 w-full text-sky"
                  >
                    <motion.path
                      d="M2 8 C 30 1, 60 11, 100 6 S 170 2, 198 7"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ delay: 1.1, duration: 0.9, ease: EASE }}
                    />
                  </svg>
                )}
              </motion.span>
            ))}
          </h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={4}
            className="mt-6 max-w-2xl text-base leading-relaxed text-dim sm:text-lg"
          >
            Describe any topic. {BRAND.name} searches the live web, reads the sources, writes the paper and fact-checks
            every claim, streaming each step so you can follow along.
          </motion.p>

          {/* ---------- Command bar ---------- */}
          <motion.form
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={5}
            onSubmit={handleSubmit}
            className={`mt-9 w-full max-w-2xl ${shake ? 'animate-shake' : ''}`}
          >
            <div className="group relative">
              <div
                aria-hidden
                className="absolute -inset-1.5 rounded-[26px] bg-gradient-to-r from-brand/30 via-sky/30 to-mint/30 opacity-60 blur-xl transition duration-500 group-focus-within:opacity-100"
              />
              <div className="relative rounded-2xl border border-line bg-white p-2 shadow-card transition focus-within:border-brand/50 focus-within:ring-4 focus-within:ring-brand/10">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="flex flex-1 items-center gap-2">
                    <span className="ml-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                      <Search className="h-5 w-5" />
                    </span>

                    <div className="relative flex-1">
                      {!topic && (
                        <span
                          aria-hidden
                          className="pointer-events-none absolute left-2 right-14 top-1/2 -translate-y-1/2 truncate text-left font-mono text-[15px] text-dim/60"
                        >
                          {isRunning ? 'Working on it…' : typed}
                          {!isRunning && !reduce && (
                            <span className="ml-0.5 inline-block h-4 w-px translate-y-0.5 animate-pulse bg-brand" />
                          )}
                        </span>
                      )}
                      <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        disabled={isRunning}
                        maxLength={120}
                        aria-label="Research topic"
                        className="w-full rounded-xl bg-transparent py-3.5 pl-2 pr-14 text-left font-mono text-[15px] text-ink focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                      />
                      <span className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md border border-line bg-canvas px-1.5 py-0.5 font-mono text-[10px] text-dim sm:flex">
                        {topic.length > 0 ? (
                          <>{topic.length}/120</>
                        ) : (
                          <>
                            <CornerDownLeft className="h-3 w-3" /> Enter
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isRunning}
                    whileHover={!isRunning ? { scale: 1.02 } : {}}
                    whileTap={!isRunning ? { scale: 0.96 } : {}}
                    className="flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3.5 text-sm font-semibold text-white shadow-glow transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-line disabled:text-dim disabled:shadow-none"
                  >
                    {isRunning ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Researching…
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Start research
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </div>

            {/* category tabs + topic chips */}
            <div className="mt-6 flex flex-col items-center gap-4">
              <div role="tablist" aria-label="Topic categories" className="inline-flex rounded-full border border-line bg-white/80 p-1 shadow-soft backdrop-blur">
                {CATEGORIES.map((c, i) => {
                  const Icon = c.icon;
                  const on = i === cat;
                  return (
                    <button
                      key={c.key}
                      type="button"
                      role="tab"
                      aria-selected={on}
                      onClick={() => setCat(i)}
                      className={`relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors sm:px-4 ${
                        on ? 'text-white' : 'text-dim hover:text-ink'
                      }`}
                    >
                      {on && (
                        <motion.span
                          layoutId="cat-pill"
                          className="absolute inset-0 rounded-full bg-brand shadow-glow"
                          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                        />
                      )}
                      <Icon className="relative hidden h-3.5 w-3.5 sm:block" />
                      <span className="relative">{c.key}</span>
                    </button>
                  );
                })}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={CATEGORIES[cat].key}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: EASE }}
                  className="flex flex-wrap items-center justify-center gap-2"
                >
                  {CATEGORIES[cat].topics.map((t) => (
                    <button
                      key={t}
                      type="button"
                      disabled={isRunning}
                      onClick={() => setTopic(t)}
                      className="rounded-full border border-line bg-white px-3.5 py-1.5 text-xs text-dim shadow-soft transition hover:-translate-y-0.5 hover:border-brand/40 hover:text-brand disabled:pointer-events-none disabled:opacity-50"
                    >
                      {t}
                    </button>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.form>

          {/* trust row */}
          <motion.ul
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={6}
            className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3"
          >
            {TRUST.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2 text-sm text-dim">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-mint/10 text-mint">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                {label}
              </li>
            ))}
          </motion.ul>
        </div>

        {/* ====================== Bento showcase ====================== */}
        <div className="mt-16 grid gap-4 sm:gap-5 md:grid-cols-6 lg:mt-20 lg:grid-cols-12">
          <BentoCard
            className="md:col-span-3 lg:col-span-5"
            icon={Globe}
            tile="bg-sky/10 text-sky"
            title="Live sources"
            caption="Found on the open web and ranked by relevance."
            delay={0}
          >
            <SourcesCard reduce={reduce} />
          </BentoCard>

          <BentoCard
            className="md:col-span-3 lg:col-span-7"
            icon={PenLine}
            tile="bg-violet/10 text-violet"
            title="A report that writes itself"
            caption="Structured sections with citations, drafted in real time."
            delay={0.08}
          >
            <ReportCard reduce={reduce} />
          </BentoCard>

          <BentoCard
            className="md:col-span-3 lg:col-span-4"
            icon={CheckCheck}
            tile="bg-emerald/10 text-emerald"
            title="Claim-level fact checks"
            caption="Every statement is tested against the evidence."
            delay={0.05}
          >
            <ClaimsCard reduce={reduce} />
          </BentoCard>

          <BentoCard
            className="md:col-span-3 lg:col-span-4"
            icon={ShieldCheck}
            tile="bg-sun/10 text-sun"
            title="Reviewed like a paper"
            caption="A critic scores clarity, structure and evidence."
            delay={0.1}
          >
            <ScoreCard reduce={reduce} />
          </BentoCard>

          <BentoCard
            className="md:col-span-6 lg:col-span-4"
            icon={FileDown}
            tile="bg-brand/10 text-brand"
            title="Ready to share"
            caption="Export a clean, citable research PDF."
            delay={0.15}
          >
            <ExportCard reduce={reduce} />
          </BentoCard>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Bento card shell                                                    */
/* ------------------------------------------------------------------ */
function BentoCard({ icon: Icon, tile, title, caption, children, className = '', delay = 0 }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay, duration: 0.6, ease: EASE }}
      whileHover={{ y: -4 }}
      className={`group relative flex flex-col overflow-hidden rounded-3xl border border-line bg-white p-5 shadow-soft transition-[border-color,box-shadow] duration-300 hover:border-brand/30 hover:shadow-card sm:p-6 ${className}`}
    >
      <span className="absolute inset-x-6 top-0 h-px origin-left scale-x-0 bg-gradient-to-r from-transparent via-brand to-transparent transition-transform duration-500 group-hover:scale-x-100" />
      <span className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand/10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative flex items-start gap-3">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tile}`}>
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <h3 className="font-body text-base font-semibold leading-tight">{title}</h3>
          <p className="mt-1 text-xs leading-relaxed text-dim sm:text-[13px]">{caption}</p>
        </div>
      </div>

      <div className="relative mt-5 flex-1">{children}</div>
    </motion.article>
  );
}

/* ------------------------------------------------------------------ */
/* Card: live sources (rolling list)                                   */
/* ------------------------------------------------------------------ */
function SourcesCard({ reduce }) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setTick((t) => t + 1), 2200);
    return () => clearInterval(id);
  }, [reduce]);

  const visible = Array.from({ length: 4 }, (_, k) => SOURCES[(tick + k) % SOURCES.length]);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-dim">Incoming</span>
        <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald opacity-70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald" />
          </span>
          Streaming
        </span>
      </div>

      <ul className="flex h-[15.5rem] flex-col gap-2 overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((s) => {
            const Icon = s.icon;
            return (
              <motion.li
                key={s.id}
                layout
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -28 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="flex h-14 shrink-0 items-center gap-3 rounded-2xl border border-line bg-white px-3 shadow-soft"
              >
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${s.tone}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-dim">{s.type}</p>
                  <p className="truncate text-[13px] font-medium text-ink">{s.title}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-xs font-semibold text-ink">{s.rel}%</p>
                  <span className="mt-1 block h-1 w-10 overflow-hidden rounded-full bg-line">
                    <motion.span
                      className="block h-full rounded-full bg-mint"
                      initial={{ width: 0 }}
                      animate={{ width: `${s.rel}%` }}
                      transition={{ delay: 0.2, duration: 0.7, ease: EASE }}
                    />
                  </span>
                </div>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Card: report drafting                                               */
/* ------------------------------------------------------------------ */
function ReportCard({ reduce }) {
  const [cycle, setCycle] = useState(0);
  const [done, setDone] = useState(!!reduce);

  useEffect(() => {
    if (reduce) return;
    setDone(false);
    const finish = setTimeout(() => setDone(true), 3800);
    const next = setTimeout(() => setCycle((c) => c + 1), 9000);
    return () => {
      clearTimeout(finish);
      clearTimeout(next);
    };
  }, [cycle, reduce]);

  let lineIndex = 0;

  return (
    <div className="rounded-2xl border border-line bg-canvas/60 p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="h-3 w-1/2 rounded-full bg-ink/15" />
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold transition-colors ${
            done ? 'bg-mint/10 text-mint' : 'bg-violet/10 text-violet'
          }`}
        >
          {done ? <Check className="h-3 w-3" strokeWidth={3} /> : <Loader2 className="h-3 w-3 animate-spin" />}
          {done ? 'Draft complete' : 'Drafting…'}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={cycle} initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="space-y-4">
          {REPORT.map((sec) => {
            const startIdx = lineIndex;
            lineIndex += sec.lines.length;
            const secEnd = 0.4 + lineIndex * 0.3;
            return (
              <div key={sec.n}>
                <div className="mb-2 flex items-center gap-2">
                  <span className="font-mono text-[10px] font-semibold text-dim">{sec.n}</span>
                  <span className="text-xs font-semibold">{sec.label}</span>
                  <span className="ml-auto flex gap-1">
                    {sec.cites.map((c, ci) => (
                      <motion.span
                        key={c}
                        initial={reduce ? false : { opacity: 0, scale: 0.4 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: secEnd + ci * 0.12, type: 'spring', stiffness: 500, damping: 18 }}
                        className="rounded-md bg-brand/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-brand"
                      >
                        [{c}]
                      </motion.span>
                    ))}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {sec.lines.map((w, li) => (
                    <motion.div
                      key={li}
                      initial={reduce ? false : { scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.4 + (startIdx + li) * 0.3, duration: 0.5, ease: EASE }}
                      style={{ width: w }}
                      className="h-2 origin-left rounded-full bg-ink/10"
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Card: claim verification                                            */
/* ------------------------------------------------------------------ */
function ClaimsCard({ reduce }) {
  const END = CLAIMS.length + 2;
  const [tick, setTick] = useState(reduce ? CLAIMS.length : 0);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setTick((t) => (t >= END ? 0 : t + 1)), 1200);
    return () => clearInterval(id);
  }, [reduce, END]);

  const verified = CLAIMS.filter((c) => c.result === 'verified').length;
  const corrected = CLAIMS.length - verified;

  return (
    <div>
      <ul className="space-y-2">
        {CLAIMS.map((c, i) => {
          const status = tick > i ? c.result : tick === i ? 'checking' : 'queued';
          const styles = {
            queued: 'border-line opacity-60',
            checking: 'border-brand/30 bg-brand/5',
            verified: 'border-mint/30 bg-white',
            corrected: 'border-sun/40 bg-sun/5',
          }[status];
          return (
            <li key={c.text} className={`flex items-center gap-3 rounded-2xl border px-3 py-2.5 transition-all duration-500 ${styles}`}>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium leading-snug text-ink">{c.text}</p>
                <p className="mt-0.5 text-[11px] text-dim">
                  {status === 'queued' ? 'Queued' : status === 'checking' ? 'Checking against sources…' : c.note}
                </p>
              </div>
              <span className="flex h-6 w-6 shrink-0 items-center justify-center">
                {status === 'checking' && <Loader2 className="h-4 w-4 animate-spin text-brand" />}
                {status === 'queued' && <span className="h-4 w-4 rounded-full border-2 border-dashed border-line" />}
                {status === 'verified' && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-mint text-white"
                  >
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </motion.span>
                )}
                {status === 'corrected' && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-sun text-white"
                  >
                    <PenLine className="h-3 w-3" />
                  </motion.span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 font-mono text-[11px] text-dim">
        {tick >= CLAIMS.length
          ? `${verified} verified · ${corrected} corrected`
          : `Checking claim ${Math.min(tick + 1, CLAIMS.length)} of ${CLAIMS.length}…`}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Card: critic score                                                  */
/* ------------------------------------------------------------------ */
function ScoreCard({ reduce }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [val, setVal] = useState(reduce ? 9.2 : 0);
  const C = 263.9; // 2 * PI * 42

  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(0, 9.2, { duration: 1.4, ease: 'easeOut', onUpdate: (v) => setVal(v) });
    return () => controls.stop();
  }, [inView, reduce]);

  return (
    <div ref={ref}>
      <div className="flex items-center gap-4">
        <div className="relative h-24 w-24 shrink-0">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <circle cx="50" cy="50" r="42" fill="none" strokeWidth="8" className="stroke-line" />
            <motion.circle
              cx="50" cy="50" r="42" fill="none" strokeWidth="8" strokeLinecap="round"
              className="stroke-sun"
              strokeDasharray={C}
              initial={{ strokeDashoffset: reduce ? C * 0.08 : C }}
              animate={{ strokeDashoffset: inView || reduce ? C * 0.08 : C }}
              transition={{ duration: 1.4, ease: EASE }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-2xl font-semibold leading-none tracking-tight">{val.toFixed(1)}</span>
            <span className="mt-0.5 text-[10px] text-dim">out of 10</span>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold">Strong evidence base</p>
          <p className="mt-1 text-xs leading-relaxed text-dim">Sections are well structured and claims are backed by sources.</p>
        </div>
      </div>

      <ul className="mt-5 space-y-2.5">
        {METRICS.map((m, i) => (
          <li key={m.label} className="flex items-center gap-3">
            <span className="w-16 text-[11px] font-medium text-dim">{m.label}</span>
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
              <motion.span
                className={`block h-full rounded-full ${m.bar}`}
                initial={{ width: reduce ? `${m.v}%` : 0 }}
                animate={{ width: inView || reduce ? `${m.v}%` : 0 }}
                transition={{ delay: 0.2 + i * 0.12, duration: 0.9, ease: EASE }}
              />
            </span>
            <span className="w-7 text-right font-mono text-[11px] font-semibold text-ink">{m.v}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Card: export                                                        */
/* ------------------------------------------------------------------ */
function ExportCard({ reduce }) {
  const [phase, setPhase] = useState(0); // 0 idle · 1 preparing · 2 saved

  useEffect(() => {
    if (reduce) return;
    const t = setTimeout(() => setPhase((p) => (p + 1) % 3), [2400, 1200, 1800][phase]);
    return () => clearTimeout(t);
  }, [phase, reduce]);

  return (
    <div className="flex flex-col items-center">
      <motion.div whileHover={{ rotate: -2 }} className="relative mt-2 h-44 w-36">
        <div className="absolute inset-0 translate-x-3 translate-y-2 rotate-6 rounded-xl border border-line bg-canvas" />
        <div className="absolute inset-0 -translate-x-2 translate-y-1 -rotate-3 rounded-xl border border-line bg-white/80" />
        <div className="absolute inset-0 rounded-xl border border-line bg-white p-3.5 shadow-card">
          <div className="h-2 w-2/3 rounded-full bg-ink/20" />
          <div className="mt-1.5 h-1.5 w-1/3 rounded-full bg-brand/30" />
          <div className="mt-4 space-y-1.5">
            {['100%', '94%', '100%', '80%', '96%', '60%'].map((w, i) => (
              <div key={i} style={{ width: w }} className="h-1.5 rounded-full bg-ink/10" />
            ))}
          </div>
          <div className="absolute inset-x-3.5 bottom-3 flex items-center justify-between">
            <span className="font-mono text-[9px] text-dim">14 references</span>
            <span className="font-mono text-[9px] text-dim">p. 1</span>
          </div>
        </div>
      </motion.div>

      <div className="mt-6 inline-flex h-10 items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={phase}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: EASE }}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold ${
              phase === 2 ? 'bg-mint text-white' : phase === 1 ? 'bg-brand/10 text-brand' : 'bg-brand text-white shadow-glow'
            }`}
          >
            {phase === 0 && (
              <>
                <FileDown className="h-4 w-4" /> Export PDF
              </>
            )}
            {phase === 1 && (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Preparing…
              </>
            )}
            {phase === 2 && (
              <>
                <Check className="h-4 w-4" strokeWidth={3} /> Saved
              </>
            )}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}