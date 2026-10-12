import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search, BookOpen, PenLine, ShieldCheck, CheckCheck, FileText, Timer, Loader2, Check,
} from 'lucide-react';

const AGENTS = [
  { key: 'topic_refiner', label: 'Topic refiner', short: 'Refine', icon: Search, color: 'sky' },
  { key: 'search', label: 'Search agent', short: 'Search', icon: BookOpen, color: 'brand' },
  { key: 'reader', label: 'Reader agent', short: 'Read', icon: FileText, color: 'mint' },
  { key: 'writer', label: 'Writer agent', short: 'Write', icon: PenLine, color: 'violet' },
  { key: 'critic', label: 'Critic agent', short: 'Critique', icon: ShieldCheck, color: 'sun' },
  { key: 'fact_check', label: 'Fact checker', short: 'Verify', icon: CheckCheck, color: 'emerald' },
  { key: 'cross_ref', label: 'Cross-reference', short: 'Validate', icon: Check, color: 'amber' },
];

const COLOR_CLASSES = {
  sky: { icon: 'bg-sky/10 text-sky', active: 'border-sky bg-sky/10 text-sky', line: 'bg-sky' },
  brand: { icon: 'bg-brand/10 text-brand', active: 'border-brand bg-brand/10 text-brand', line: 'bg-brand' },
  mint: { icon: 'bg-mint/10 text-mint', active: 'border-mint bg-mint/10 text-mint', line: 'bg-mint' },
  violet: { icon: 'bg-violet/10 text-violet', active: 'border-violet bg-violet/10 text-violet', line: 'bg-violet' },
  sun: { icon: 'bg-sun/10 text-sun', active: 'border-sun bg-sun/10 text-sun', line: 'bg-sun' },
  emerald: { icon: 'bg-emerald/10 text-emerald', active: 'border-emerald bg-emerald/10 text-emerald', line: 'bg-emerald' },
  amber: { icon: 'bg-amber/10 text-amber', active: 'border-amber bg-amber/10 text-amber', line: 'bg-amber' },
};

const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

function summarize(key, data) {
  if (!data) return 'Waiting for input';
  if (typeof data === 'string') {
    if (key === 'search') return `${(data.match(/Title:/g) || []).length || 0} sources found`;
    if (key === 'reader') return `${data.split(/\s+/).filter(Boolean).length.toLocaleString()} words extracted`;
    if (key === 'writer') return 'Report drafted';
    if (key === 'critic') return 'Review finished';
    if (key === 'fact_check') return 'Claims verified';
    if (key === 'cross_ref') return 'Paper package ready';
    return 'Refinement ready';
  }
  if (key === 'search' && Array.isArray(data.results)) return `${data.results.length} sources found`;
  if (key === 'cross_ref') return 'Paper package ready';
  return 'Output ready';
}

export default function PipelineDiagram({ steps }) {
  const statusOf = useCallback((key) => steps[key]?.status ?? 'waiting', [steps]);
  const doneCount = AGENTS.filter((agent) => statusOf(agent.key) === 'done').length;
  const hasError = AGENTS.some((agent) => statusOf(agent.key) === 'error');
  const anyRunning = AGENTS.some((agent) => statusOf(agent.key) === 'running');
  const active = !hasError && (anyRunning || (doneCount > 0 && doneCount < AGENTS.length));
  const progress = (doneCount / AGENTS.length) * 100;
  const currentIndex = AGENTS.findIndex((agent) => statusOf(agent.key) === 'running');
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(null);

  useEffect(() => {
    if (!active) {
      startRef.current = null;
      return undefined;
    }
    if (startRef.current == null) startRef.current = Date.now();
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startRef.current) / 1000)), 1000);
    return () => clearInterval(id);
  }, [active, statusOf]);

  return (
    <section id="pipeline" className="mx-auto w-full max-w-6xl scroll-mt-20 px-5 py-16 sm:px-8 sm:py-20">
      <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">Live pipeline</p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight">Seven-agent research workflow</h2>
          <p className="mt-1.5 text-sm text-dim">A connected relay. Each agent receives the previous stage&apos;s work and passes a stronger result forward.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5 font-mono text-xs text-dim shadow-soft">
            <Timer className="h-3.5 w-3.5 text-brand" />{mmss(active ? elapsed : 0)}
          </span>
          <span className="rounded-full border border-line bg-white px-3 py-1.5 font-mono text-xs text-dim shadow-soft">
            <span className="font-semibold text-ink">{doneCount}</span>/{AGENTS.length} complete
          </span>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[2rem] border border-line bg-white px-5 py-8 shadow-card sm:px-8 sm:py-10">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky via-brand to-mint" />
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-ink">{hasError ? 'Pipeline needs attention' : active ? `Stage ${currentIndex + 1} is working` : doneCount === AGENTS.length ? 'Research relay complete' : 'Ready to begin'}</p>
            <p className="mt-1 text-xs text-dim">{doneCount === AGENTS.length ? 'All seven specialists have handed off their output.' : 'Follow the hand-off from question to validated paper.'}</p>
          </div>
          <span className="font-mono text-xs font-semibold text-brand">{Math.round(progress)}%</span>
        </div>
        <div className="mb-10 h-1.5 overflow-hidden rounded-full bg-line">
          <motion.div className="h-full rounded-full bg-gradient-to-r from-brand via-sky to-mint" animate={{ width: `${progress}%` }} transition={{ duration: 0.7 }} />
        </div>

        <div className="relative flex flex-col gap-7 md:flex-row md:items-start md:gap-0">
          {AGENTS.map((agent, index) => {
            const status = statusOf(agent.key);
            const palette = COLOR_CLASSES[agent.color];
            const Icon = agent.icon;
            return (
              <motion.div
                key={agent.key}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.07 }}
                className="relative flex min-w-0 flex-1 items-center gap-4 md:block md:text-center"
              >
                {index < AGENTS.length - 1 && (
                  <div className="absolute left-[19px] top-12 h-7 w-px bg-line md:left-[calc(50%+25px)] md:right-0 md:top-[25px] md:h-px md:w-auto">
                    <motion.div
                      className={`h-full origin-top ${palette.line} md:origin-left`}
                      initial={{ scaleY: 0, scaleX: 0 }}
                      animate={{ scaleY: status === 'done' ? 1 : 0, scaleX: status === 'done' ? 1 : 0 }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                )}
                <div className="relative z-10 flex items-center gap-4 md:block">
                  <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border-2 transition-all ${status === 'running' ? `${palette.active} shadow-lg` : status === 'done' ? 'border-mint bg-mint text-white' : status === 'error' ? 'border-danger bg-danger/10 text-danger' : 'border-line bg-canvas text-dim'}`}>
                    {status === 'running' ? <Loader2 className="h-5 w-5 animate-spin" /> : status === 'done' ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <div className="min-w-0 md:mt-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-dim">0{index + 1}</p>
                    <p className={`mt-1 text-sm font-semibold ${status === 'running' ? 'text-brand' : 'text-ink'}`}>{agent.label}</p>
                    <p className="mt-1 text-xs text-dim">{status === 'waiting' ? 'Queued' : status === 'running' ? 'Working now' : status === 'error' ? 'Needs retry' : summarize(agent.key, steps[agent.key]?.data)}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
