import React, { useEffect, useMemo, useState } from 'react';

type Currency = 'EUR' | 'USD' | 'MXN' | 'GBP';
type ProjectStatus = 'Borrador' | 'Enviado' | 'Aprobado' | 'En producción' | 'Instalado' | 'Finalizado' | 'Perdido';
type PhaseStatus = 'pendiente' | 'en curso' | 'bloqueado' | 'finalizado';
type ThemeMode = 'oscuro' | 'claro' | 'medio';
type Tab = 'Caso visual' | 'Análisis' | 'Presupuesto' | 'Fases' | 'Calendario' | 'PDF';

type ScoreKey = 'Visibilidad de marca' | 'Limpieza visual' | 'Impacto desde calle' | 'Confianza percibida' | 'Claridad comercial' | 'Coherencia estética';
type ScoreRow = { metric: ScoreKey; before: number; after: number };

type Phase = {
  id: string;
  name: string;
  description: string;
  responsible: string;
  startDate: string;
  endDate: string;
  status: PhaseStatus;
  notes: string;
};

type VisualAnalysis = {
  diagnostic: string;
  strengths: string;
  fixedProblems: string;
  risks: string;
  recommendation: string;
  scores: ScoreRow[];
};

type Project = {
  id: string;
  projectNumber: string;
  version: string;
  clientName: string;
  projectName: string;
  businessType: string;
  currentImage: string | null;
  proposedImage: string | null;
  logoImage: string | null;
  initialDescription: string;
  estimatedBudget: number;
  currency: Currency;
  exchangeRate: number;
  expectedBenefit: string;
  internalNotes: string;
  status: ProjectStatus;
  analysis: VisualAnalysis;
  phases: Phase[];
  createdAt: string;
};

const scoreKeys: ScoreKey[] = ['Visibilidad de marca', 'Limpieza visual', 'Impacto desde calle', 'Confianza percibida', 'Claridad comercial', 'Coherencia estética'];
const currencies: Currency[] = ['EUR', 'USD', 'MXN', 'GBP'];
const tabs: Tab[] = ['Caso visual', 'Análisis', 'Presupuesto', 'Fases', 'Calendario', 'PDF'];
const statuses: ProjectStatus[] = ['Borrador', 'Enviado', 'Aprobado', 'En producción', 'Instalado', 'Finalizado', 'Perdido'];

const defaultPhases = (): Phase[] => [
  ['Auditoría visual', 'Análisis del estado actual, competencia y contexto de implantación.'],
  ['Diseño y propuesta creativa', 'Desarrollo de conceptos visuales y argumentario comercial.'],
  ['Revisión con cliente', 'Sesión de validación, ajustes y priorización.'],
  ['Artes finales', 'Preparación de artes finales y especificaciones técnicas.'],
  ['Producción', 'Fabricación/impresión de elementos aprobados.'],
  ['Instalación', 'Montaje en ubicación y verificación de acabados.'],
  ['Revisión final', 'Checklist final de calidad y cumplimiento.'],
  ['Seguimiento', 'Medición de impacto y recomendaciones posteriores.'],
].map((item, i) => ({
  id: `${Date.now()}-${i}`,
  name: item[0],
  description: item[1],
  responsible: 'Equipo Imaginecreativo 360',
  startDate: '',
  endDate: '',
  status: 'pendiente' as PhaseStatus,
  notes: '',
}));

const emptyAnalysis = (): VisualAnalysis => ({
  diagnostic: 'Pendiente de análisis.',
  strengths: 'Pendiente de análisis.',
  fixedProblems: 'Pendiente de análisis.',
  risks: 'Pendiente de análisis.',
  recommendation: 'Pendiente de análisis.',
  scores: scoreKeys.map((metric) => ({ metric, before: 4, after: 7 })),
});

const initialProject = (): Project => ({
  id: crypto.randomUUID(),
  projectNumber: 'IC360-2026-001',
  version: 'v1.0',
  clientName: 'Cliente Demo',
  projectName: 'Renovación visual fachada',
  businessType: 'Retail',
  currentImage: null,
  proposedImage: null,
  logoImage: null,
  initialDescription: 'Actualización visual de fachada para aumentar visibilidad, percepción premium y captación en calle.',
  estimatedBudget: 45000,
  currency: 'MXN',
  exchangeRate: 1,
  expectedBenefit: '',
  internalNotes: 'Proyecto de ejemplo con margen objetivo del 25%.',
  status: 'Borrador',
  analysis: emptyAnalysis(),
  phases: defaultPhases(),
  createdAt: new Date().toISOString(),
});

const themeClass: Record<ThemeMode, string> = {
  oscuro: 'bg-slate-950 text-slate-100',
  claro: 'bg-slate-100 text-slate-900',
  medio: 'bg-slate-800 text-slate-100',
};

const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<Tab>('Caso visual');
  const [theme, setTheme] = useState<ThemeMode>('oscuro');

  useEffect(() => {
    const raw = localStorage.getItem('ia360_projects');
    if (!raw) {
      const p = initialProject();
      setProjects([p]);
      setSelectedId(p.id);
      return;
    }
    const parsed = JSON.parse(raw) as Project[];
    setProjects(parsed);
    setSelectedId(parsed[0]?.id || '');
  }, []);

  useEffect(() => {
    if (projects.length) localStorage.setItem('ia360_projects', JSON.stringify(projects));
  }, [projects]);

  const current = useMemo(() => projects.find((p) => p.id === selectedId), [projects, selectedId]);

  const updateProject = <K extends keyof Project>(key: K, value: Project[K]) => {
    setProjects((prev) => prev.map((p) => (p.id === selectedId ? { ...p, [key]: value } : p)));
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>, key: 'currentImage' | 'proposedImage' | 'logoImage') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateProject(key, String(reader.result));
    reader.readAsDataURL(file);
  };

  const convertBudget = (amount: number, rate: number) => (amount * rate || 0);
  const formatMoney = (amount: number, currency: Currency) => new Intl.NumberFormat('es-ES', { style: 'currency', currency }).format(amount || 0);

  const runSimulatedAnalysis = () => {
    if (!current) return;
    const improved = current.initialDescription.toLowerCase().includes('premium') ? 4 : 3;
    const scores = scoreKeys.map((metric, i) => ({ metric, before: Math.max(3, 5 - (i % 2)), after: Math.min(10, 7 + (i % 3) + improved - 3) }));
    updateProject('analysis', {
      diagnostic: `La situación actual de ${current.projectName} muestra baja jerarquía visual y oportunidades de mejora en lectura comercial inmediata.`,
      strengths: 'La propuesta mejora contraste, legibilidad, coherencia de marca y presencia desde puntos de alto tránsito.',
      fixedProblems: 'Se corrigen saturación de elementos, ruido gráfico, falta de foco en oferta y baja diferenciación frente a competidores.',
      risks: 'Riesgo medio si no se validan materiales finales, permisos de instalación y pruebas nocturnas de visibilidad.',
      recommendation: 'Aprobar propuesta con hito de revisión intermedia y prueba en contexto real antes de producción completa.',
      scores,
    });
  };

  const autoGenerateBenefit = () => {
    if (!current) return;
    updateProject(
      'expectedBenefit',
      `Beneficio principal: aumentar la captación en calle mediante mayor impacto visual y recordación de marca.\nBeneficios secundarios: mejora de confianza percibida, lectura comercial más clara y diferenciación competitiva.\nImpacto esperado: incremento progresivo en visitas y conversión durante los primeros 90 días tras instalación.\nArgumento de venta: la inversión propuesta acelera resultados comerciales al transformar el punto de contacto más visible del negocio.\nRecomendación: ejecutar por fases con medición semanal y optimización continua.`,
    );
  };

  const exportPdf = (internal: boolean) => {
    if (!current) return;
    const html = `
      <html><head><title>Dossier ${current.projectNumber}</title><style>
      body{font-family:Arial;padding:24px;color:#111} h1,h2{margin-bottom:8px} .grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
      img{max-width:100%;height:auto;border:1px solid #ddd} table{width:100%;border-collapse:collapse} td,th{border:1px solid #ccc;padding:6px}
      </style></head><body>
      <h1>${current.projectName} (${current.projectNumber} - ${current.version})</h1>
      <p><strong>Cliente:</strong> ${current.clientName}</p>
      <p><strong>Agencia:</strong> Imaginecreativo 360 SL</p>
      <h2>Descripción</h2><p>${current.initialDescription}</p>
      <div class="grid"><div><h2>Antes</h2>${current.currentImage ? `<img src="${current.currentImage}"/>` : ''}</div><div><h2>Después</h2>${current.proposedImage ? `<img src="${current.proposedImage}"/>` : ''}</div></div>
      <h2>Diagnóstico visual</h2><p>${current.analysis.diagnostic}</p>
      <h2>Comparativa y puntuaciones</h2><table><tr><th>Métrica</th><th>Antes</th><th>Después</th></tr>
      ${current.analysis.scores.map((s) => `<tr><td>${s.metric}</td><td>${s.before}</td><td>${s.after}</td></tr>`).join('')}</table>
      <h2>Beneficio esperado</h2><p>${current.expectedBenefit.replace(/\n/g, '<br/>')}</p>
      <h2>Presupuesto</h2><p>${formatMoney(current.estimatedBudget, current.currency)} | Convertido: ${formatMoney(convertBudget(current.estimatedBudget, current.exchangeRate), 'EUR')}</p>
      <h2>Plan de trabajo y calendario</h2><table><tr><th>Fase</th><th>Inicio</th><th>Fin</th><th>Estado</th></tr>
      ${current.phases.map((p) => `<tr><td>${p.name}</td><td>${p.startDate || '-'}</td><td>${p.endDate || '-'}</td><td>${p.status}</td></tr>`).join('')}</table>
      ${internal ? `<h2>Notas internas</h2><p>${current.internalNotes}</p>` : ''}
      <h2>Próximos pasos</h2><p>Confirmación de alcance, firma y arranque operativo.</p>
      </body></html>`;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
  };

  if (!current) return null;

  return (
    <main className={`min-h-screen ${themeClass[theme]} p-4`}>
      <div className="max-w-7xl mx-auto grid lg:grid-cols-[360px_1fr] gap-4">
        <aside className="border border-slate-700 rounded-xl p-4 space-y-3 bg-black/20">
          <h1 className="text-xl font-bold">Antes / Después Pro · Agencia</h1>
          <button className="px-3 py-2 bg-cyan-700 rounded" onClick={() => { const p = initialProject(); setProjects((x) => [p, ...x]); setSelectedId(p.id); }}>+ Nuevo proyecto</button>
          <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className="w-full bg-slate-800 p-2 rounded">
            {projects.map((p) => <option key={p.id} value={p.id}>{p.projectNumber} · {p.projectName}</option>)}
          </select>
          <input className="w-full bg-slate-800 p-2 rounded" value={current.clientName} onChange={(e) => updateProject('clientName', e.target.value)} placeholder="Nombre cliente" />
          <input className="w-full bg-slate-800 p-2 rounded" value={current.projectName} onChange={(e) => updateProject('projectName', e.target.value)} placeholder="Proyecto" />
          <div className="grid grid-cols-2 gap-2">
            <input className="bg-slate-800 p-2 rounded" value={current.projectNumber} onChange={(e) => updateProject('projectNumber', e.target.value)} placeholder="Nº Proyecto" />
            <input className="bg-slate-800 p-2 rounded" value={current.version} onChange={(e) => updateProject('version', e.target.value)} placeholder="Versión" />
          </div>
          <input className="w-full bg-slate-800 p-2 rounded" value={current.businessType} onChange={(e) => updateProject('businessType', e.target.value)} placeholder="Tipo de negocio" />
          <textarea className="w-full bg-slate-800 p-2 rounded" rows={3} value={current.initialDescription} onChange={(e) => updateProject('initialDescription', e.target.value)} placeholder="Descripción inicial" />
          <div className="text-sm">Logo</div><input type="file" accept="image/*" onChange={(e) => handleFile(e, 'logoImage')} />
          <div className="text-sm">Foto actual</div><input type="file" accept="image/*" onChange={(e) => handleFile(e, 'currentImage')} />
          <div className="text-sm">Foto propuesta</div><input type="file" accept="image/*" onChange={(e) => handleFile(e, 'proposedImage')} />
          <textarea className="w-full bg-slate-800 p-2 rounded" rows={2} value={current.internalNotes} onChange={(e) => updateProject('internalNotes', e.target.value)} placeholder="Notas internas" />
          <div className="grid grid-cols-2 gap-2">
            <select className="bg-slate-800 p-2 rounded" value={current.status} onChange={(e) => updateProject('status', e.target.value as ProjectStatus)}>{statuses.map((s) => <option key={s}>{s}</option>)}</select>
            <select className="bg-slate-800 p-2 rounded" value={theme} onChange={(e) => setTheme(e.target.value as ThemeMode)}><option value="oscuro">oscura</option><option value="claro">clara</option><option value="medio">visual medio</option></select>
          </div>
        </aside>

        <section className="border border-slate-700 rounded-xl p-4 bg-black/20">
          <div className="flex flex-wrap gap-2 mb-4">{tabs.map((t) => <button key={t} onClick={() => setActiveTab(t)} className={`px-3 py-2 rounded ${activeTab === t ? 'bg-cyan-700' : 'bg-slate-700'}`}>{t}</button>)}</div>

          {activeTab === 'Caso visual' && <div className="space-y-4"><div className="grid md:grid-cols-2 gap-3"><div>{current.currentImage ? <img src={current.currentImage} className="rounded border border-slate-600" /> : <div className="h-56 grid place-items-center border rounded">Sin imagen actual</div>}</div><div>{current.proposedImage ? <img src={current.proposedImage} className="rounded border border-slate-600" /> : <div className="h-56 grid place-items-center border rounded">Sin imagen propuesta</div>}</div></div><p><strong>Así está ahora / así puede quedar</strong></p></div>}

          {activeTab === 'Análisis' && <div className="space-y-3"><button onClick={runSimulatedAnalysis} className="bg-cyan-700 px-3 py-2 rounded">Generar análisis simulado</button><button onClick={autoGenerateBenefit} className="bg-emerald-700 px-3 py-2 rounded ml-2">Autogenerar beneficio</button>
          {(['diagnostic','strengths','fixedProblems','risks','recommendation'] as const).map((k) => <textarea key={k} className="w-full bg-slate-800 p-2 rounded" rows={2} value={current.analysis[k]} onChange={(e)=>updateProject('analysis',{...current.analysis,[k]:e.target.value})} />)}
          <table className="w-full text-sm"><thead><tr><th>Métrica</th><th>Antes</th><th>Después</th></tr></thead><tbody>{current.analysis.scores.map((s,idx)=><tr key={s.metric}><td>{s.metric}</td><td><input type="number" className="bg-slate-800 w-20" value={s.before} onChange={(e)=>{const scores=[...current.analysis.scores];scores[idx]={...s,before:Number(e.target.value)};updateProject('analysis',{...current.analysis,scores});}}/></td><td><input type="number" className="bg-slate-800 w-20" value={s.after} onChange={(e)=>{const scores=[...current.analysis.scores];scores[idx]={...s,after:Number(e.target.value)};updateProject('analysis',{...current.analysis,scores});}}/></td></tr>)}</tbody></table></div>}

          {activeTab === 'Presupuesto' && <div className="space-y-3"><div className="grid md:grid-cols-3 gap-2"><input type="number" className="bg-slate-800 p-2 rounded" value={current.estimatedBudget} onChange={(e)=>updateProject('estimatedBudget', Number(e.target.value))}/><select className="bg-slate-800 p-2 rounded" value={current.currency} onChange={(e)=>updateProject('currency', e.target.value as Currency)}>{currencies.map(c=><option key={c}>{c}</option>)}</select><input type="number" className="bg-slate-800 p-2 rounded" value={current.exchangeRate} onChange={(e)=>updateProject('exchangeRate', Number(e.target.value))} placeholder="Tipo cambio manual"/></div><p>Original: {formatMoney(current.estimatedBudget, current.currency)}</p><p>Convertido (EUR): {formatMoney(convertBudget(current.estimatedBudget, current.exchangeRate), 'EUR')}</p><textarea className="w-full bg-slate-800 p-2 rounded" rows={6} value={current.expectedBenefit} onChange={(e)=>updateProject('expectedBenefit', e.target.value)} placeholder="Beneficio esperado"/></div>}

          {activeTab === 'Fases' && <div className="space-y-2">{current.phases.map((phase, i)=><div key={phase.id} className="grid md:grid-cols-7 gap-2 bg-slate-900 p-2 rounded"><input className="bg-slate-800 p-1" value={phase.name} onChange={(e)=>{const phases=[...current.phases];phases[i]={...phase,name:e.target.value};updateProject('phases',phases);}}/><input className="bg-slate-800 p-1" value={phase.responsible} onChange={(e)=>{const phases=[...current.phases];phases[i]={...phase,responsible:e.target.value};updateProject('phases',phases);}}/><input type="date" className="bg-slate-800 p-1" value={phase.startDate} onChange={(e)=>{const phases=[...current.phases];phases[i]={...phase,startDate:e.target.value};updateProject('phases',phases);}}/><input type="date" className="bg-slate-800 p-1" value={phase.endDate} onChange={(e)=>{const phases=[...current.phases];phases[i]={...phase,endDate:e.target.value};updateProject('phases',phases);}}/><select className="bg-slate-800 p-1" value={phase.status} onChange={(e)=>{const phases=[...current.phases];phases[i]={...phase,status:e.target.value as PhaseStatus};updateProject('phases',phases);}}><option>pendiente</option><option>en curso</option><option>bloqueado</option><option>finalizado</option></select><input className="bg-slate-800 p-1 md:col-span-2" value={phase.notes} onChange={(e)=>{const phases=[...current.phases];phases[i]={...phase,notes:e.target.value};updateProject('phases',phases);}} placeholder="Notas"/></div>)}</div>}

          {activeTab === 'Calendario' && <div><p className="mb-2">Duración del proyecto: {current.phases.filter(p=>p.startDate&&p.endDate).length} fases planificadas.</p><ul className="space-y-1">{current.phases.map((p)=><li key={p.id} className="bg-slate-900 rounded p-2">{p.name}: {p.startDate || 'sin inicio'} → {p.endDate || 'sin fin'} ({p.status})</li>)}</ul></div>}

          {activeTab === 'PDF' && <div className="space-y-3"><button className="bg-cyan-700 px-3 py-2 rounded" onClick={()=>exportPdf(false)}>Generar PDF cliente</button><button className="bg-amber-700 px-3 py-2 rounded ml-2" onClick={()=>exportPdf(true)}>Generar PDF interno</button><p>Incluye portada, datos, comparativa, análisis, presupuesto, fases, calendario y próximos pasos.</p></div>}
        </section>
      </div>
    </main>
  );
};

export default App;
