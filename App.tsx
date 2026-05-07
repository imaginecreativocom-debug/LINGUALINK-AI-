import React, { useMemo, useState } from 'react';

const formatCurrency = (value: string) => {
  const numeric = Number(value.replace(/[^\d.]/g, ''));
  if (Number.isNaN(numeric) || numeric <= 0) return '—';
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(numeric);
};

const App: React.FC = () => {
  const [fotoActual, setFotoActual] = useState<string | null>(null);
  const [propuesta, setPropuesta] = useState<string | null>(null);
  const [descripcion, setDescripcion] = useState('Rediseño de fachada y señalética para mejorar presencia de marca y atraer más clientes caminando por la zona.');
  const [presupuesto, setPresupuesto] = useState('45000');
  const [beneficio, setBeneficio] = useState('Incremento esperado del 20% en visitas al local y mayor recordación visual.');

  const presupuestoFormateado = useMemo(() => formatCurrency(presupuesto), [presupuesto]);

  const onFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string | null>>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setter(String(reader.result));
    reader.readAsDataURL(file);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <p className="text-xs tracking-[0.25em] uppercase text-cyan-400">Herramienta de venta</p>
          <h1 className="text-3xl md:text-4xl font-bold mt-2">Antes / Después para vender diseño visual</h1>
          <p className="text-slate-300 mt-3">
            Sube el estado actual, la propuesta y construye un caso visual claro para convencer más rápido.
          </p>
        </header>

        <section className="grid lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-semibold">Entradas del caso</h2>

            <label className="block">
              <span className="text-sm text-slate-300">Foto actual</span>
              <input type="file" accept="image/*" onChange={(e) => onFileChange(e, setFotoActual)} className="mt-2 block w-full text-sm" />
            </label>

            <label className="block">
              <span className="text-sm text-slate-300">Propuesta</span>
              <input type="file" accept="image/*" onChange={(e) => onFileChange(e, setPropuesta)} className="mt-2 block w-full text-sm" />
            </label>

            <label className="block">
              <span className="text-sm text-slate-300">Descripción</span>
              <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={4} className="mt-2 w-full bg-slate-800 border border-slate-700 rounded-lg p-3" />
            </label>

            <label className="block">
              <span className="text-sm text-slate-300">Presupuesto estimado (MXN)</span>
              <input value={presupuesto} onChange={(e) => setPresupuesto(e.target.value)} className="mt-2 w-full bg-slate-800 border border-slate-700 rounded-lg p-3" />
            </label>

            <label className="block">
              <span className="text-sm text-slate-300">Beneficio esperado</span>
              <textarea value={beneficio} onChange={(e) => setBeneficio(e.target.value)} rows={3} className="mt-2 w-full bg-slate-800 border border-slate-700 rounded-lg p-3" />
            </label>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-semibold">Caso visual generado</h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <figure className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
                <figcaption className="text-center py-2 text-sm font-medium">Así está ahora</figcaption>
                {fotoActual ? (
                  <img src={fotoActual} alt="Estado actual" className="w-full h-56 object-cover" />
                ) : (
                  <div className="h-56 grid place-items-center text-slate-400 text-sm">Sube foto actual</div>
                )}
              </figure>

              <figure className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
                <figcaption className="text-center py-2 text-sm font-medium text-cyan-300">Así puede quedar</figcaption>
                {propuesta ? (
                  <img src={propuesta} alt="Propuesta visual" className="w-full h-56 object-cover" />
                ) : (
                  <div className="h-56 grid place-items-center text-slate-400 text-sm">Sube propuesta</div>
                )}
              </figure>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
              <p><span className="text-slate-400">Descripción:</span> {descripcion || '—'}</p>
              <p><span className="text-slate-400">Presupuesto:</span> {presupuestoFormateado}</p>
              <p><span className="text-slate-400">Beneficio esperado:</span> {beneficio || '—'}</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default App;
