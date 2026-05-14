import React, { useMemo, useState } from 'react';

type LeadStatus = 'Alta' | 'Pendiente';

interface Lead {
  id: number;
  nombre: string;
  email: string;
  inversion: number;
  estado: LeadStatus;
}

type Screen = 'publica' | 'comercial' | 'admin';

const formatoMoneda = (value: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);

const App: React.FC = () => {
  const [pantalla, setPantalla] = useState<Screen>('publica');
  const [correoContacto] = useState('contacto@tuempresa.com');
  const [nuevoLead, setNuevoLead] = useState({ nombre: '', email: '', inversion: '' });
  const [leads, setLeads] = useState<Lead[]>([]);

  const inversionTotal = useMemo(
    () => leads.reduce((acum, lead) => acum + lead.inversion, 0),
    [leads],
  );

  const totalAltas = useMemo(
    () => leads.filter((lead) => lead.estado === 'Alta').length,
    [leads],
  );

  const handleCrearLead = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const inversion = Number(nuevoLead.inversion);
    if (!nuevoLead.nombre || !nuevoLead.email || !Number.isFinite(inversion) || inversion <= 0) {
      return;
    }

    const lead: Lead = {
      id: Date.now(),
      nombre: nuevoLead.nombre,
      email: nuevoLead.email,
      inversion,
      estado: 'Pendiente',
    };

    setLeads((prev) => [lead, ...prev]);
    setNuevoLead({ nombre: '', email: '', inversion: '' });
    setPantalla('comercial');
  };

  const actualizarEstado = (id: number, estado: LeadStatus) => {
    setLeads((prev) => prev.map((lead) => (lead.id === id ? { ...lead, estado } : lead)));
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">FinanzaPro Simple</h1>
            <p className="text-slate-600">Demo con 3 partes: web oficial, comercial y administrador.</p>
          </div>
          <nav className="flex gap-2">
            {[
              { id: 'publica', label: 'Web oficial' },
              { id: 'comercial', label: 'Comercial' },
              { id: 'admin', label: 'Administrador' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setPantalla(item.id as Screen)}
                className={`px-4 py-2 rounded-lg border transition ${
                  pantalla === item.id
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </header>

        {pantalla === 'publica' && (
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-2xl font-semibold mb-2">Solicita asesoría de inversión</h2>
            <p className="text-slate-600 mb-6">Introduce tus datos para que un comercial te contacte por correo.</p>

            <form onSubmit={handleCrearLead} className="grid md:grid-cols-3 gap-4">
              <input
                className="border border-slate-300 rounded-lg px-3 py-2"
                placeholder="Nombre completo"
                value={nuevoLead.nombre}
                onChange={(e) => setNuevoLead((prev) => ({ ...prev, nombre: e.target.value }))}
              />
              <input
                type="email"
                className="border border-slate-300 rounded-lg px-3 py-2"
                placeholder="Correo electrónico"
                value={nuevoLead.email}
                onChange={(e) => setNuevoLead((prev) => ({ ...prev, email: e.target.value }))}
              />
              <input
                type="number"
                min="1"
                className="border border-slate-300 rounded-lg px-3 py-2"
                placeholder="Inversión estimada (€)"
                value={nuevoLead.inversion}
                onChange={(e) => setNuevoLead((prev) => ({ ...prev, inversion: e.target.value }))}
              />
              <button className="md:col-span-3 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg font-medium">
                Enviar solicitud
              </button>
            </form>

            <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <p className="text-sm text-slate-700">Contacto directo:</p>
              <p className="text-lg font-semibold">{correoContacto}</p>
            </div>
          </section>
        )}

        {pantalla === 'comercial' && (
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h2 className="text-2xl font-semibold">Panel comercial</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <p className="text-sm text-emerald-700">Mi inversión gestionada</p>
                <p className="text-2xl font-bold">{formatoMoneda(inversionTotal)}</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-700">Clientes totales</p>
                <p className="text-2xl font-bold">{leads.length}</p>
              </div>
              <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
                <p className="text-sm text-violet-700">Clientes dados de alta</p>
                <p className="text-2xl font-bold">{totalAltas}</p>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-3">Cliente</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Inversión</th>
                    <th className="p-3">Estado</th>
                    <th className="p-3">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} className="border-t border-slate-100">
                      <td className="p-3">{lead.nombre}</td>
                      <td className="p-3">{lead.email}</td>
                      <td className="p-3">{formatoMoneda(lead.inversion)}</td>
                      <td className="p-3">{lead.estado}</td>
                      <td className="p-3">
                        {lead.estado === 'Pendiente' ? (
                          <button
                            className="text-sm bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded"
                            onClick={() => actualizarEstado(lead.id, 'Alta')}
                          >
                            Dar de alta
                          </button>
                        ) : (
                          <button
                            className="text-sm bg-amber-600 hover:bg-amber-500 text-white px-3 py-1 rounded"
                            onClick={() => actualizarEstado(lead.id, 'Pendiente')}
                          >
                            Marcar pendiente
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {leads.length === 0 && <p className="p-4 text-slate-500">Aún no hay clientes registrados.</p>}
            </div>
          </section>
        )}

        {pantalla === 'admin' && (
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h2 className="text-2xl font-semibold">Panel de administrador</h2>
            <p className="text-slate-600">Vista global del sistema para controlar altas, pendientes y volumen total.</p>

            <div className="grid md:grid-cols-4 gap-4">
              <div className="border rounded-xl p-4">
                <p className="text-sm text-slate-500">Total inversión clientes</p>
                <p className="text-2xl font-bold">{formatoMoneda(inversionTotal)}</p>
              </div>
              <div className="border rounded-xl p-4">
                <p className="text-sm text-slate-500">Clientes activos</p>
                <p className="text-2xl font-bold">{totalAltas}</p>
              </div>
              <div className="border rounded-xl p-4">
                <p className="text-sm text-slate-500">Pendientes</p>
                <p className="text-2xl font-bold">{leads.length - totalAltas}</p>
              </div>
              <div className="border rounded-xl p-4">
                <p className="text-sm text-slate-500">Conversión</p>
                <p className="text-2xl font-bold">
                  {leads.length === 0 ? '0%' : `${Math.round((totalAltas / leads.length) * 100)}%`}
                </p>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default App;
