import React, { useEffect, useMemo, useState } from 'react';

type Currency = 'EUR' | 'USD' | 'MXN' | 'GBP';
type Lang = 'es' | 'en';
type ProjectStatus = 'Borrador' | 'Enviado' | 'Aprobado' | 'En producción' | 'Instalado' | 'Finalizado' | 'Perdido';
type ThemeMode = 'oscuro' | 'claro' | 'medio';
type PhaseStatus = 'pendiente' | 'en curso' | 'bloqueado' | 'finalizado';
type Tab = 'Caso visual' | 'Análisis' | 'Presupuesto' | 'Fases' | 'Calendario' | 'PDF' | 'Repositorio';

type Phase = { id: string; name: string; responsible: string; startDate: string; endDate: string; status: PhaseStatus; notes: string };
type Score = { metric: string; before: number; after: number };

type Project = {
  id: string; client: string; projectName: string; projectNumber: string; revision: string; sentDate: string; sendNumber: string;
  status: ProjectStatus; version: string; language: Lang; theme: ThemeMode; createdAt: string; expiresAt: string;
  currentImage: string | null; proposedImage: string | null; logo: string | null; planImage: string | null;
  description: string; notes: string; benefit: string; estimatedBudget: number; currency: Currency; exchangeRate: number;
  analysis: { diagnostic: string; strengths: string; risks: string; recommendation: string; scores: Score[] };
  planInsights: { meters: string; distribution: string; topView: string; isoView: string; colorStudy: string; distributionOptions: string };
  phases: Phase[];
};

type RepoItem = { id: string; projectId: string; projectNumber: string; revision: string; sentDate: string; pdfType: 'cliente' | 'interno'; html: string };

const t = {
  es: { login: 'Acceso seguro', email: 'Email', key: 'Clave', enter: 'Entrar', bad: 'Acceso denegado', repo: 'Repositorio', new: 'Nuevo', save: 'Guardar', del: 'Borrar', sent: 'Marcar enviado', lang: 'Idioma', theme: 'Tema' },
  en: { login: 'Secure access', email: 'Email', key: 'Passkey', enter: 'Enter', bad: 'Access denied', repo: 'Repository', new: 'New', save: 'Save', del: 'Delete', sent: 'Mark sent', lang: 'Language', theme: 'Theme' },
};

const mkProject = (): Project => ({
  id: crypto.randomUUID(), client: '', projectName: '', projectNumber: `IC360-${new Date().getFullYear()}-${Math.floor(Math.random() * 900 + 100)}`,
  revision: 'R1', sentDate: '', sendNumber: '', status: 'Borrador', version: 'v1.0', language: 'es', theme: 'oscuro',
  createdAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
  currentImage: null, proposedImage: null, logo: null, planImage: null,
  description: '', notes: '', benefit: '', estimatedBudget: 0, currency: 'EUR', exchangeRate: 1,
  analysis: { diagnostic: '', strengths: '', risks: '', recommendation: '', scores: ['Visibilidad de marca', 'Limpieza visual', 'Impacto calle', 'Confianza', 'Claridad comercial', 'Coherencia'].map((m) => ({ metric: m, before: 4, after: 8 })) },
  planInsights: { meters: '', distribution: '', topView: '', isoView: '', colorStudy: '', distributionOptions: '' },
  phases: ['Auditoría visual', 'Diseño', 'Revisión cliente', 'Artes finales', 'Producción', 'Instalación', 'Revisión final', 'Seguimiento'].map((name, i) => ({ id: `${i}-${Date.now()}`, name, responsible: 'Agente', startDate: '', endDate: '', status: 'pendiente', notes: '' })),
});

const themes: Record<ThemeMode, { page: string; card: string; input: string; text: string }> = {
  oscuro: { page: 'bg-slate-950', card: 'bg-slate-900 border-slate-700', input: 'bg-slate-800 text-white border-slate-600', text: 'text-slate-100' },
  claro: { page: 'bg-slate-100', card: 'bg-white border-slate-300', input: 'bg-white text-slate-900 border-slate-300', text: 'text-slate-900' },
  medio: { page: 'bg-slate-800', card: 'bg-slate-700 border-slate-500', input: 'bg-slate-600 text-white border-slate-400', text: 'text-white' },
};

export default function App() {
  const [authed, setAuthed] = useState(false); const [email, setEmail] = useState(''); const [key, setKey] = useState(''); const [err, setErr] = useState('');
  const [projects, setProjects] = useState<Project[]>([]); const [repo, setRepo] = useState<RepoItem[]>([]); const [selectedId, setSelectedId] = useState('');
  const [tab, setTab] = useState<Tab>('Caso visual');

  useEffect(() => { setProjects(JSON.parse(localStorage.getItem('ia360_projects_v2') || '[]')); setRepo(JSON.parse(localStorage.getItem('ia360_repo_v2') || '[]')); }, []);
  useEffect(() => { localStorage.setItem('ia360_projects_v2', JSON.stringify(projects)); }, [projects]);
  useEffect(() => { localStorage.setItem('ia360_repo_v2', JSON.stringify(repo)); }, [repo]);
  useEffect(() => { if (!selectedId && projects[0]) setSelectedId(projects[0].id); }, [projects, selectedId]);

  const p = useMemo(() => projects.find((x) => x.id === selectedId), [projects, selectedId]);
  const ui = themes[p?.theme || 'oscuro'];
  const tx = t[p?.language || 'es'];

  const upd = <K extends keyof Project>(k: K, v: Project[K]) => setProjects((prev) => prev.map((x) => (x.id === selectedId ? { ...x, [k]: v } : x)));
  const file = (e: React.ChangeEvent<HTMLInputElement>, k: 'currentImage' | 'proposedImage' | 'logo' | 'planImage') => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = () => upd(k, String(r.result)); r.readAsDataURL(f); };
  const money = (n: number, c: Currency) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: c }).format(n || 0);

  const saveCurrent = () => setProjects((prev) => [...prev]);
  const deleteCurrent = () => { if (!p) return; const left = projects.filter((x) => x.id !== p.id); setProjects(left); setSelectedId(left[0]?.id || ''); };
  const markSent = () => { if (!p) return; upd('status', 'Enviado'); upd('sentDate', new Date().toISOString().slice(0, 10)); upd('sendNumber', `ENV-${Date.now()}`); };

  const autoAnalysis = () => { if (!p) return; upd('analysis', { ...p.analysis, diagnostic: 'Estado actual con ruido visual y baja legibilidad.', strengths: 'Propuesta refuerza contraste y jerarquía.', risks: 'Validar materiales y permisos.', recommendation: 'Implementar por fases con piloto.' }); };
  const autoBenefit = () => { if (!p) return; upd('benefit', 'Beneficio principal: mejorar captación visual. Beneficios secundarios: mayor confianza y mejor conversión. Impacto: mejora progresiva 90 días. Recomendación: seguimiento semanal con KPIs.'); };
  const autoPlanRead = () => { if (!p) return; upd('planInsights', { meters: '120 m² estimados', distribution: 'Acceso frontal + zona expositiva + caja al fondo', topView: 'Top: flujo en U con foco central', isoView: 'Isométrico: volumen principal + tótem lateral', colorStudy: 'Paleta sugerida: azul petróleo, blanco, acento ámbar', distributionOptions: 'Opción A lineal / Opción B isla central / Opción C escaparate expandido' }); };

  const dossierHTML = (internal: boolean) => {
    if (!p) return '';
    return `<html><body style="font-family:Arial;padding:24px"><h1>${p.projectName} (${p.projectNumber} ${p.revision})</h1><p>Cliente: ${p.client}</p><p>Estado: ${p.status} | Envío: ${p.sendNumber || '-'} ${p.sentDate || ''}</p><p>Creado: ${p.createdAt.slice(0,10)} | Expira: ${p.expiresAt}</p>${p.logo ? `<img src="${p.logo}" style="max-height:80px"/>` : ''}<h2>Antes/Después</h2><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">${p.currentImage ? `<img src="${p.currentImage}" style="max-width:100%"/>` : ''}${p.proposedImage ? `<img src="${p.proposedImage}" style="max-width:100%"/>` : ''}</div><h3>Plano</h3>${p.planImage ? `<img src="${p.planImage}" style="max-width:100%"/>` : ''}<p>${p.planInsights.meters}</p><p>${p.planInsights.distribution}</p><p>${p.planInsights.topView}</p><p>${p.planInsights.isoView}</p><h3>Presupuesto</h3><p>${money(p.estimatedBudget,p.currency)} | EUR ${money(p.estimatedBudget * p.exchangeRate, 'EUR')}</p><h3>Análisis</h3><p>${p.analysis.diagnostic}</p><p>${p.analysis.strengths}</p><p>${p.analysis.risks}</p><p>${p.analysis.recommendation}</p><h3>Beneficio</h3><p>${p.benefit}</p>${internal ? `<h3>Notas internas</h3><p>${p.notes}</p>` : ''}<h3>Condiciones comerciales</h3><p>Oferta válida 30 días desde emisión. Revisión: ${p.revision}. Sujeto a aprobación y calendario.</p></body></html>`;
  };
  const generatePDF = (internal: boolean) => { if (!p) return; const html = dossierHTML(internal); const w = window.open('', '_blank'); if (!w) return; w.document.write(html); w.document.close(); w.print(); setRepo((r) => [{ id: crypto.randomUUID(), projectId: p.id, projectNumber: p.projectNumber, revision: p.revision, sentDate: new Date().toISOString(), pdfType: internal ? 'interno' : 'cliente', html }, ...r]); };

  if (!authed) return <main className="min-h-screen bg-slate-950 text-white grid place-items-center p-6"><div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl p-5 space-y-3"><h1 className="text-xl font-bold">{t.es.login}</h1><input className="w-full bg-slate-800 border border-slate-600 p-2 rounded" placeholder="info@imaginecreativo.com" value={email} onChange={(e) => setEmail(e.target.value)} /><input className="w-full bg-slate-800 border border-slate-600 p-2 rounded" placeholder="Clave" type="password" value={key} onChange={(e) => setKey(e.target.value)} /><button className="w-full bg-cyan-700 p-2 rounded" onClick={() => { if (email.toLowerCase() === 'info@imaginecreativo.com' && key === 'IC360-ACCESS') setAuthed(true); else setErr(t.es.bad); }}>Entrar</button>{err && <p className="text-red-400 text-sm">{err}</p>}</div></main>;
  if (!p) return <main className="min-h-screen bg-slate-950 text-white p-4"><button className="bg-cyan-700 px-3 py-2 rounded" onClick={() => setProjects([mkProject()])}>Crear primer proyecto</button></main>;

  return <main className={`min-h-screen ${ui.page} ${ui.text} p-3 md:p-5`}><div className="max-w-7xl mx-auto grid lg:grid-cols-[380px_1fr] gap-4">
    <aside className={`border rounded-xl p-4 ${ui.card} space-y-3`}>
      <div className="flex gap-2"><button className="bg-cyan-700 px-3 py-2 rounded" onClick={() => { const n = mkProject(); setProjects([n, ...projects]); setSelectedId(n.id); }}>{tx.new}</button><button className="bg-emerald-700 px-3 py-2 rounded" onClick={saveCurrent}>{tx.save}</button><button className="bg-red-700 px-3 py-2 rounded" onClick={deleteCurrent}>{tx.del}</button></div>
      <select className={`w-full border p-2 rounded ${ui.input}`} value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>{projects.map((x) => <option key={x.id} value={x.id}>{x.projectNumber} · {x.projectName || 'Sin título'}</option>)}</select>
      <input className={`w-full border p-2 rounded ${ui.input}`} value={p.client} onChange={(e) => upd('client', e.target.value)} placeholder="Cliente"/>
      <input className={`w-full border p-2 rounded ${ui.input}`} value={p.projectName} onChange={(e) => upd('projectName', e.target.value)} placeholder="Proyecto"/>
      <div className="grid grid-cols-2 gap-2"><input className={`border p-2 rounded ${ui.input}`} value={p.projectNumber} onChange={(e) => upd('projectNumber', e.target.value)} /><input className={`border p-2 rounded ${ui.input}`} value={p.revision} onChange={(e) => upd('revision', e.target.value)} /></div>
      <div className="grid grid-cols-2 gap-2"><select className={`border p-2 rounded ${ui.input}`} value={p.language} onChange={(e) => upd('language', e.target.value as Lang)}><option value="es">Español</option><option value="en">English</option></select><select className={`border p-2 rounded ${ui.input}`} value={p.theme} onChange={(e) => upd('theme', e.target.value as ThemeMode)}><option value="oscuro">oscuro</option><option value="claro">claro</option><option value="medio">visual medio</option></select></div>
      <textarea className={`w-full border p-2 rounded ${ui.input}`} rows={3} value={p.description} onChange={(e) => upd('description', e.target.value)} placeholder="Descripción"/>
      <textarea className={`w-full border p-2 rounded ${ui.input}`} rows={2} value={p.notes} onChange={(e) => upd('notes', e.target.value)} placeholder="Notas internas"/>
      <div className="text-sm">Logo<input type="file" onChange={(e)=>file(e,'logo')} /></div><div className="text-sm">Foto actual<input type="file" onChange={(e)=>file(e,'currentImage')} /></div><div className="text-sm">Foto propuesta<input type="file" onChange={(e)=>file(e,'proposedImage')} /></div><div className="text-sm">Plano<input type="file" onChange={(e)=>file(e,'planImage')} /></div>
      <button className="w-full bg-amber-700 p-2 rounded" onClick={markSent}>{tx.sent}</button>
      <p className="text-xs opacity-80">Envío: {p.sendNumber || '-'} {p.sentDate || ''} · Expira: {p.expiresAt}</p>
    </aside>

    <section className={`border rounded-xl p-4 ${ui.card}`}>
      <div className="flex flex-wrap gap-2 mb-4">{(['Caso visual','Análisis','Presupuesto','Fases','Calendario','PDF','Repositorio'] as Tab[]).map((x)=><button key={x} onClick={()=>setTab(x)} className={`px-3 py-2 rounded ${tab===x?'bg-cyan-700':'bg-slate-600'}`}>{x}</button>)}</div>
      {tab==='Caso visual' && <div className="grid md:grid-cols-2 gap-3">{p.currentImage?<img src={p.currentImage} className="w-full rounded"/>:<div className="h-64 border rounded grid place-items-center">Antes</div>}{p.proposedImage?<img src={p.proposedImage} className="w-full rounded"/>:<div className="h-64 border rounded grid place-items-center">Después</div>}</div>}
      {tab==='Análisis' && <div className="space-y-2"><button className="bg-cyan-700 px-3 py-2 rounded" onClick={autoAnalysis}>Analizar</button><button className="bg-emerald-700 px-3 py-2 rounded ml-2" onClick={autoBenefit}>Autogenerar beneficio</button><button className="bg-fuchsia-700 px-3 py-2 rounded ml-2" onClick={autoPlanRead}>Leer plano (simulado)</button><textarea className={`w-full border p-2 rounded ${ui.input}`} rows={2} value={p.analysis.diagnostic} onChange={(e)=>upd('analysis',{...p.analysis,diagnostic:e.target.value})}/><textarea className={`w-full border p-2 rounded ${ui.input}`} rows={2} value={p.analysis.strengths} onChange={(e)=>upd('analysis',{...p.analysis,strengths:e.target.value})}/><textarea className={`w-full border p-2 rounded ${ui.input}`} rows={2} value={p.analysis.risks} onChange={(e)=>upd('analysis',{...p.analysis,risks:e.target.value})}/><textarea className={`w-full border p-2 rounded ${ui.input}`} rows={2} value={p.analysis.recommendation} onChange={(e)=>upd('analysis',{...p.analysis,recommendation:e.target.value})}/><textarea className={`w-full border p-2 rounded ${ui.input}`} rows={2} value={p.planInsights.meters} onChange={(e)=>upd('planInsights',{...p.planInsights,meters:e.target.value})}/><textarea className={`w-full border p-2 rounded ${ui.input}`} rows={2} value={p.planInsights.distributionOptions} onChange={(e)=>upd('planInsights',{...p.planInsights,distributionOptions:e.target.value})}/></div>}
      {tab==='Presupuesto' && <div className="space-y-2"><div className="grid md:grid-cols-3 gap-2"><input type="number" className={`border p-2 rounded ${ui.input}`} value={p.estimatedBudget} onChange={(e)=>upd('estimatedBudget',Number(e.target.value))}/><select className={`border p-2 rounded ${ui.input}`} value={p.currency} onChange={(e)=>upd('currency',e.target.value as Currency)}>{['EUR','USD','MXN','GBP'].map((c)=><option key={c}>{c}</option>)}</select><input type="number" className={`border p-2 rounded ${ui.input}`} value={p.exchangeRate} onChange={(e)=>upd('exchangeRate',Number(e.target.value))}/></div><p>{money(p.estimatedBudget,p.currency)} → EUR {money(p.estimatedBudget*p.exchangeRate,'EUR')}</p><textarea className={`w-full border p-2 rounded ${ui.input}`} rows={5} value={p.benefit} onChange={(e)=>upd('benefit',e.target.value)} /></div>}
      {tab==='Fases' && <div className="space-y-3">{p.phases.map((ph,i)=><div key={ph.id} className="grid md:grid-cols-6 gap-2 p-3 rounded border border-slate-500 text-base"><input className={`border p-2 rounded ${ui.input}`} value={ph.name} onChange={(e)=>{const x=[...p.phases];x[i]={...ph,name:e.target.value};upd('phases',x);}}/><input className={`border p-2 rounded ${ui.input}`} value={ph.responsible} onChange={(e)=>{const x=[...p.phases];x[i]={...ph,responsible:e.target.value};upd('phases',x);}}/><input type="date" className={`border p-2 rounded ${ui.input}`} value={ph.startDate} onChange={(e)=>{const x=[...p.phases];x[i]={...ph,startDate:e.target.value};upd('phases',x);}}/><input type="date" className={`border p-2 rounded ${ui.input}`} value={ph.endDate} onChange={(e)=>{const x=[...p.phases];x[i]={...ph,endDate:e.target.value};upd('phases',x);}}/><select className={`border p-2 rounded ${ui.input}`} value={ph.status} onChange={(e)=>{const x=[...p.phases];x[i]={...ph,status:e.target.value as PhaseStatus};upd('phases',x);}}><option>pendiente</option><option>en curso</option><option>bloqueado</option><option>finalizado</option></select><input className={`border p-2 rounded ${ui.input}`} value={ph.notes} onChange={(e)=>{const x=[...p.phases];x[i]={...ph,notes:e.target.value};upd('phases',x);}}/></div>)}</div>}
      {tab==='Calendario' && <div className="space-y-2">{p.phases.map((ph)=><div key={ph.id} className="p-3 rounded border border-slate-500 text-lg">{ph.name}: {ph.startDate||'--'} → {ph.endDate||'--'} ({ph.status})</div>)}</div>}
      {tab==='PDF' && <div className="space-x-2"><button className="bg-cyan-700 px-3 py-2 rounded" onClick={()=>generatePDF(false)}>PDF cliente</button><button className="bg-amber-700 px-3 py-2 rounded" onClick={()=>generatePDF(true)}>PDF interno</button></div>}
      {tab==='Repositorio' && <div className="space-y-2">{repo.map((r)=><div key={r.id} className="p-3 border rounded border-slate-500"><p>{r.projectNumber} {r.revision} · {r.pdfType} · {r.sentDate.slice(0,10)}</p><button className="bg-slate-700 px-2 py-1 rounded" onClick={()=>{const w=window.open('','_blank'); if(!w) return; w.document.write(r.html); w.document.close();}}>Abrir</button></div>)}</div>}
    </section>
  </div></main>;
}
