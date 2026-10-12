import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, Download, Copy, Check, Loader2, FileText, Star, Database, Globe,
  Clock, Type, Inbox, BookOpen, ShieldCheck, Quote, ListChecks, AlertTriangle,
  Target, Layers3,
} from 'lucide-react';
import { toastSuccess, toastError } from '../utils/alerts';
import { BRAND } from '../config/brand';

const PROSE =
  'prose prose-slate prose-sm sm:prose-base max-w-none ' +
  'prose-headings:font-display prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-ink ' +
  'prose-p:text-ink/80 prose-li:text-ink/80 prose-strong:text-ink ' +
  'prose-a:font-medium prose-a:text-brand prose-a:no-underline hover:prose-a:underline ' +
  'prose-code:rounded prose-code:bg-brand/5 prose-code:px-1 prose-code:text-brand prose-code:before:content-none prose-code:after:content-none ' +
  'prose-blockquote:border-brand prose-hr:border-line';

export default function OutputPanel({ steps, topic, result }) {
  const report = typeof result?.report === 'string' ? result.report : (steps.writer.data || '');
  const critique = typeof result?.quality_review === 'string' ? result.quality_review : (steps.critic.data || '');
  const anyData = Boolean(result || Object.values(steps).some((step) => step.data));
  const anyRunning = Object.values(steps).some((step) => step.status === 'running');
  const wordCount = report ? report.trim().split(/\s+/).filter(Boolean).length : 0;
  const readMins = Math.max(1, Math.ceil(wordCount / 200));
  const title = result?.title_options?.[0] || result?.refined_topic || topic || 'Research report';

  return (
    <section className="mx-auto w-full max-w-6xl scroll-mt-20 px-5 pb-24 sm:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">Research workspace</p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Your research paper</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-dim">
            A single, structured document combining the topic refinement, academic framing, evidence, report, verification, and critic review.
          </p>
        </div>
        {result && <span className="rounded-full border border-mint/20 bg-mint/10 px-3 py-1.5 text-xs font-semibold text-mint">Complete research package</span>}
      </div>

      {!anyData && !anyRunning && <EmptyState />}
      {!result && anyRunning && <ReportSkeleton label="Building your research paper from seven verified stages…" lines={12} />}

      {result && (
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="overflow-hidden rounded-[2rem] border border-line bg-white shadow-card"
        >
          <PaperCover result={result} topic={topic} title={title} />
          <div className="px-6 py-8 sm:px-12 sm:py-12">
            <PaperMeta result={result} wordCount={wordCount} readMins={readMins} />
            <PaperSection label="Abstract" icon={BookOpen}>
              {result.abstract ? <div className={PROSE}><ReactMarkdown>{result.abstract}</ReactMarkdown></div> : <Placeholder>Abstract was not returned by the cross-reference agent.</Placeholder>}
            </PaperSection>
            <TagList label="Keywords" items={result.keywords} />
            <PaperSection label="Research framing" icon={Target}>
              <div className="grid gap-4 lg:grid-cols-2">
                <InfoBlock label="Original topic" value={result.original_topic || topic} />
                <InfoBlock label="Refined topic" value={result.refined_topic} />
                <InfoBlock label="Scope" value={result.research_scope} />
                <ListBlock label="Research questions" items={result.research_questions} ordered />
              </div>
            </PaperSection>
            <PaperSection label="Objectives & methodology" icon={ListChecks}>
              <div className="grid gap-6 lg:grid-cols-2">
                <ListBlock label="Objectives" items={result.objectives} ordered />
                <InfoBlock label="Methodology" value={result.methodology} />
              </div>
            </PaperSection>
            <PaperSection label="Final research report" icon={FileText}>
              {report ? <div className={PROSE}><ReactMarkdown>{report}</ReactMarkdown></div> : <Placeholder>The writer agent has not returned a report yet.</Placeholder>}
            </PaperSection>
            <VerificationSection factCheck={result.claim_verification} crossRef={result.cross_reference_findings} />
            <CriticSection critique={critique} />
            <ReferencesSection references={result.references} />
            <WarningsSection warnings={result.warnings} />
            <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
              <div className="flex flex-wrap gap-2 text-xs text-dim">
                <Chip icon={Type}>{wordCount.toLocaleString()} words</Chip>
                <Chip icon={Clock}>{readMins} min read</Chip>
                <Chip icon={ShieldCheck}>Evidence reviewed</Chip>
              </div>
              <div className="flex items-center gap-2">
                <CopyButton text={buildCopyText(result, report, critique)} />
                <DownloadButton topic={title} report={report} critique={critique} academic={result} />
              </div>
            </div>
          </div>
        </motion.article>
      )}

      {(result || steps.search.data || steps.reader.data) && (
        <AgentEvidence steps={steps} result={result} />
      )}
    </section>
  );
}

function PaperCover({ result, topic, title }) {
  return (
    <header className="relative overflow-hidden bg-gradient-to-br from-[#17134b] via-brand-dark to-[#32618c] px-6 py-12 text-white sm:px-12 sm:py-16">
      <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
      <div className="relative max-w-4xl">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15"><FileText className="h-4 w-4" /></span>
          {BRAND.name} · Academic research paper
        </div>
        <h1 className="mt-8 max-w-4xl font-display text-3xl font-semibold leading-tight sm:text-5xl">{title}</h1>
        <p className="mt-5 max-w-3xl text-sm leading-relaxed text-white/75">
          Research package generated from the original question: {result.original_topic || topic}
        </p>
        <div className="mt-8 flex flex-wrap gap-2 text-xs text-white/80">
          <span className="rounded-full bg-white/15 px-3 py-1.5">Seven-agent workflow</span>
          <span className="rounded-full bg-white/15 px-3 py-1.5">Live evidence search</span>
          <span className="rounded-full bg-white/15 px-3 py-1.5">Fact checked & cross-referenced</span>
        </div>
      </div>
    </header>
  );
}

function PaperMeta({ result, wordCount, readMins }) {
  return (
    <div className="mb-2 grid gap-3 border-b border-line pb-7 sm:grid-cols-3">
      <Meta label="Refined research question" value={result.refined_topic} />
      <Meta label="Document length" value={`${wordCount.toLocaleString()} words`} />
      <Meta label="Estimated reading time" value={`${readMins} minutes`} />
    </div>
  );
}

function Meta({ label, value }) {
  return <div><p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-dim">{label}</p><p className="mt-1 text-sm font-medium text-ink">{value || 'Not available'}</p></div>;
}

function PaperSection({ label, icon: Icon, children }) {
  return (
    <section className="border-b border-line py-8 first:pt-7 last:border-0">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 text-brand"><Icon className="h-4 w-4" /></span>
        <h2 className="font-display text-xl font-semibold tracking-tight">{label}</h2>
      </div>
      {children}
    </section>
  );
}

function InfoBlock({ label, value }) {
  return <div className="rounded-2xl border border-line bg-canvas p-4"><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-dim">{label}</p><p className="mt-2 text-sm leading-relaxed text-ink">{value || 'Not available'}</p></div>;
}

function ListBlock({ label, items = [], ordered = false }) {
  return <div><p className="text-xs font-semibold uppercase tracking-[0.13em] text-dim">{label}</p>{items?.length ? <ol className={`mt-3 space-y-2 pl-5 text-sm leading-relaxed text-ink ${ordered ? 'list-decimal' : 'list-disc'}`}>{items.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ol> : <Placeholder>Not available</Placeholder>}</div>;
}

function TagList({ label, items = [] }) {
  if (!items?.length) return null;
  return <div className="border-b border-line py-8"><p className="text-xs font-semibold uppercase tracking-[0.13em] text-dim">{label}</p><div className="mt-3 flex flex-wrap gap-2">{items.map((item) => <span key={item} className="rounded-full border border-brand/20 bg-brand/5 px-3 py-1.5 text-xs font-medium text-brand">{item}</span>)}</div></div>;
}

function VerificationSection({ factCheck, crossRef }) {
  const claims = factCheck?.claims || [];
  const findings = crossRef || {};
  return (
    <PaperSection label="Evidence verification & cross-reference" icon={ShieldCheck}>
      {factCheck?.summary && <p className="mb-5 text-sm leading-relaxed text-ink">{factCheck.summary}</p>}
      {claims.length > 0 && <div className="overflow-x-auto rounded-2xl border border-line"><table className="w-full min-w-[620px] text-left text-xs"><thead className="bg-canvas text-[10px] uppercase tracking-wider text-dim"><tr><th className="px-4 py-3">Claim</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Notes</th></tr></thead><tbody className="divide-y divide-line">{claims.map((claim, index) => <tr key={index}><td className="px-4 py-3 align-top text-ink">{claim.claim}</td><td className="px-4 py-3 align-top"><StatusPill status={claim.status} /></td><td className="px-4 py-3 align-top text-dim">{claim.notes || claim.source_urls?.join(', ') || '—'}</td></tr>)}</tbody></table></div>}
      <div className="mt-6 grid gap-4 md:grid-cols-3"><Finding label="Agreement" items={findings.agreement} tone="mint" /><Finding label="Disagreement" items={findings.disagreement} tone="sun" /><Finding label="Gaps" items={findings.gaps} tone="danger" /></div>
    </PaperSection>
  );
}

function Finding({ label, items = [], tone }) {
  return <div className={`rounded-2xl border p-4 ${tone === 'mint' ? 'border-mint/20 bg-mint/5' : tone === 'sun' ? 'border-sun/20 bg-sun/5' : 'border-danger/20 bg-danger/5'}`}><p className="text-xs font-semibold">{label}</p>{items?.length ? <ul className="mt-2 list-disc space-y-1 pl-4 text-xs leading-relaxed text-dim">{items.map((item, i) => <li key={i}>{item}</li>)}</ul> : <p className="mt-2 text-xs text-dim">None reported</p>}</div>;
}

function CriticSection({ critique }) {
  return <PaperSection label="Critic's review" icon={Star}>{critique ? <div className={PROSE}><ReactMarkdown>{critique}</ReactMarkdown></div> : <Placeholder>The critic review will appear when the critic agent completes.</Placeholder>}</PaperSection>;
}

function ReferencesSection({ references = [] }) {
  return <PaperSection label={`References (${references.length})`} icon={Quote}>{references.length ? <ol className="space-y-3 text-sm leading-relaxed text-ink">{references.map((ref, index) => <li key={`${ref.url}-${index}`} className="pl-1"><span className="mr-2 font-mono text-xs text-dim">[{index + 1}]</span><a href={ref.url || '#'} target="_blank" rel="noreferrer" className="font-medium text-brand hover:underline">{ref.title || 'Untitled source'}</a><span className="ml-2 text-xs text-dim">{[ref.publisher_or_venue, ref.publication_date, ref.doi].filter(Boolean).join(' · ')}</span><div className="ml-7 break-all text-xs text-dim">{ref.url}</div></li>)}</ol> : <Placeholder>No verified references were returned.</Placeholder>}</PaperSection>;
}

function WarningsSection({ warnings = [] }) {
  if (!warnings.length) return null;
  return <div className="mt-8 rounded-2xl border border-sun/25 bg-sun/5 p-4"><div className="flex items-center gap-2 text-sm font-semibold text-sun"><AlertTriangle className="h-4 w-4" />Research notes & limitations</div><ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-dim">{warnings.map((warning, i) => <li key={i}>{warning}</li>)}</ul></div>;
}

function AgentEvidence({ steps, result }) {
  const search = result?.search_results || steps.search.data;
  const reader = result?.scraped_content || steps.reader.data;
  return <div className="mt-5 grid gap-3 md:grid-cols-2"><RawAccordion icon={Globe} label="Search agent output" content={formatData(search)} /><RawAccordion icon={Database} label="Reader agent evidence" content={formatData(reader)} /><RawAccordion icon={Layers3} label="All generated metadata" content={formatData(result)} /></div>;
}

function formatData(value) { return typeof value === 'string' ? value : JSON.stringify(value || {}, null, 2); }

function StatusPill({ status }) {
  const tone = status === 'supported' ? 'bg-mint/10 text-mint' : status === 'contradicted' || status === 'unsupported' ? 'bg-danger/10 text-danger' : 'bg-sun/10 text-sun';
  return <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase ${tone}`}>{String(status || 'unknown').replaceAll('_', ' ')}</span>;
}

function Chip({ icon: Icon, children }) { return <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-canvas px-2.5 py-1"><Icon className="h-3 w-3" />{children}</span>; }

function Placeholder({ children }) { return <p className="text-sm italic text-dim">{children}</p>; }

function EmptyState() {
  return <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex flex-col items-center rounded-3xl border-2 border-dashed border-line bg-white/60 px-6 py-16 text-center"><span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 text-brand"><Inbox className="h-7 w-7" /></span><h3 className="mt-5 font-display text-lg font-semibold">No paper yet</h3><p className="mt-1.5 max-w-sm text-sm text-dim">Enter a topic above to generate a complete academic research paper.</p></motion.div>;
}

function RawAccordion({ icon: Icon, label, content }) {
  const [open, setOpen] = useState(false);
  return <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-soft"><button onClick={() => setOpen((value) => !value)} aria-expanded={open} className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition hover:bg-canvas"><span className="flex items-center gap-3 text-sm font-semibold"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 text-brand"><Icon className="h-4 w-4" /></span>{label}</span><motion.span animate={{ rotate: open ? 180 : 0 }}><ChevronDown className="h-4 w-4 text-dim" /></motion.span></button><AnimatePresence initial={false}>{open && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><pre className="max-h-96 overflow-auto whitespace-pre-wrap break-words border-t border-line bg-canvas p-5 font-mono text-xs leading-relaxed text-dim">{content}</pre></motion.div>}</AnimatePresence></div>;
}

function ReportSkeleton({ label, lines = 8 }) {
  const widths = ['100%', '92%', '97%', '85%', '100%', '78%', '94%', '88%', '60%'];
  return <div className="rounded-3xl border border-line bg-white p-6 shadow-soft sm:p-10"><div className="mb-7 flex items-center gap-3"><Loader2 className="h-4 w-4 animate-spin text-brand" /><p className="text-sm font-medium text-dim">{label}</p></div><div className="skeleton mb-6 h-8 w-3/5" /><div className="space-y-3.5">{Array.from({ length: lines }).map((_, i) => <div key={i} className="skeleton h-3" style={{ width: widths[i % widths.length] }} />)}</div></div>;
}

function buildCopyText(result, report, critique) {
  return [result.title_options?.[0] || result.refined_topic, result.abstract && `Abstract\n${result.abstract}`, report && `Report\n${report}`, critique && `Critic's review\n${critique}`].filter(Boolean).join('\n\n');
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  async function handleCopy() {
    try { await navigator.clipboard.writeText(text); setCopied(true); toastSuccess('Copied', 'Research paper copied to your clipboard.'); setTimeout(() => setCopied(false), 2000); }
    catch { toastError('Copy failed', 'Your browser blocked clipboard access.'); }
  }
  return <button onClick={handleCopy} className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-3.5 py-2.5 text-xs font-semibold text-ink shadow-soft transition hover:bg-canvas">{copied ? <Check className="h-3.5 w-3.5 text-mint" /> : <Copy className="h-3.5 w-3.5" />}{copied ? 'Copied' : 'Copy paper'}</button>;
}

function DownloadButton({ topic, report, critique, academic }) {
  const [loading, setLoading] = useState(false);
  async function handleDownload() {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/download-pdf`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topic, report, critique, academic }) });
      if (!res.ok) throw new Error('bad response');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url; link.download = `${(topic || 'research').trim().replace(/\s+/g, '_')}_paper.pdf`; link.click(); URL.revokeObjectURL(url);
      toastSuccess('PDF ready', 'Your complete research paper download has started.');
    } catch { toastError('PDF generation failed', 'Could not generate the PDF — please try again.'); }
    finally { setLoading(false); }
  }
  return <motion.button onClick={handleDownload} disabled={loading} whileTap={{ scale: 0.96 }} className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-xs font-semibold text-white shadow-glow transition hover:bg-brand-dark disabled:cursor-wait disabled:opacity-70">{loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}{loading ? 'Preparing paper…' : 'Download complete PDF'}</motion.button>;
}
