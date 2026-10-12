import { useRef, useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import PipelineDiagram from './components/PipelineDiagram';
import OutputPanel from './components/OutputPanel';
import InfoSection from './components/InfoSection';
import WhyAgents from './components/WhyAgents';
import { toastInfo, toastSuccess, alertPipelineSuccess, alertPipelineError } from './utils/alerts';
import Footer from './components/Footer';

const INITIAL = {
  topic_refiner: { status: 'waiting', data: '' },
  search: { status: 'waiting', data: '' },
  reader: { status: 'waiting', data: '' },
  writer: { status: 'waiting', data: '' },
  critic: { status: 'waiting', data: '' },
  fact_check: { status: 'waiting', data: '' },
  cross_ref: { status: 'waiting', data: '' },
};

const LABELS = {
  topic_refiner: 'Topic refiner',
  search: 'Search',
  reader: 'Reader',
  writer: 'Writer',
  critic: 'Critic',
  fact_check: 'Fact checker',
  cross_ref: 'Cross-reference validator',
};

export default function App() {
  const [topic, setTopic] = useState('');
  const [runTopic, setRunTopic] = useState('');
  const [result, setResult] = useState(null);
  const [steps, setSteps] = useState(INITIAL);
  const [isRunning, setIsRunning] = useState(false);
  const esRef = useRef(null);

  function handleRun(t) {
    esRef.current?.close();
    setResult(null);
    setSteps(INITIAL);
    setRunTopic(t);
    setIsRunning(true);
    toastInfo('Research started', 'The agents are on it…');

    setTimeout(() => document.getElementById('pipeline')?.scrollIntoView({ behavior: 'smooth' }), 150);

    const es = new EventSource(`${import.meta.env.VITE_API_URL}/research?topic=${encodeURIComponent(t)}`);
    esRef.current = es;

    es.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      const key = msg.step;

      if (key === 'pipeline') {
        es.close();
        setIsRunning(false);
        setResult(msg.data || null);
        if (msg.status === 'complete') {
          alertPipelineSuccess(t).then(() =>
            document.getElementById('report')?.scrollIntoView({ behavior: 'smooth' })
          );
        } else {
          alertPipelineError(msg.error || 'The pipeline failed.', () => handleRun(t));
        }
        return;
      }

      setSteps((prev) => ({
        ...prev,
        [key]: {
          status: msg.status,
          data: msg.data ?? prev[key]?.data ?? '',
        },
      }));

      if (msg.status === 'done') toastSuccess(`${LABELS[key] || 'Step'} finished`);
      if (msg.status === 'error') {
        es.close();
        setIsRunning(false);
        alertPipelineError(`The ${LABELS[key] || 'step'} failed.`, () => handleRun(t));
      }
    };

    es.onerror = () => {
      es.close();
      setIsRunning(false);
      setSteps((prev) => {
        const next = { ...prev };
        for (const k in next) if (next[k].status === 'running') next[k] = { ...next[k], status: 'error' };
        return next;
      });
      alertPipelineError('The server may be busy or temporarily unavailable. Please try Again Later.', () => handleRun(t));
    };
  }

  return (
    <main id="top" className="min-h-screen bg-canvas">
      <Navbar isRunning={isRunning} />
      <Hero topic={topic} setTopic={setTopic} onRun={handleRun} isRunning={isRunning} />
      <PipelineDiagram steps={steps} />
      <div id="report">
        <OutputPanel steps={steps} topic={runTopic} result={result} />
      </div>
      <InfoSection />
      <WhyAgents />
      <Footer />
    </main>
  );
}