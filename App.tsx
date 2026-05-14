import React, { useEffect, useMemo, useState } from 'react';

type EstadoContacto = 'Pendiente' | 'Activo';
type RolUsuario = 'administrador' | 'comercial';
type PanelPrivado = 'comercial' | 'admin';

interface Contacto {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  inversion: number;
  comentarios: string;
  estado: EstadoContacto;
  comercialAsignado: string | null;
  proximaLlamada: string | null;
  vecesLlamado: number;
  fechaCreacion: string;
}

interface Usuario {
  username: string;
  password: string;
  rol: RolUsuario;
  nombre: string;
}

interface Sesion {
  username: string;
  rol: RolUsuario;
  nombre: string;
}

const STORAGE_CONTACTOS = 'finanzapro_contactos';
const STORAGE_SESION = 'finanzapro_sesion';

const USUARIOS_DEMO: Usuario[] = [
  { username: 'admin', password: 'admin123', rol: 'administrador', nombre: 'Administrador' },
  { username: 'sergio', password: 'sergio123', rol: 'comercial', nombre: 'Sergio' },
  { username: 'ana', password: 'ana123', rol: 'comercial', nombre: 'Ana' },
  { username: 'comercial1', password: 'comercial123', rol: 'comercial', nombre: 'Comercial 1' },
  { username: 'comercial2', password: 'comercial123', rol: 'comercial', nombre: 'Comercial 2' },
];

const COMERCIALES = ['Sergio', 'Ana', 'Comercial 1', 'Comercial 2'];

const formatoMoneda = (valor: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(valor);

const formatearFecha = (iso: string | null) => {
  if (!iso) return 'Sin programar';
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return 'Sin programar';
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(fecha);
};

const toDatetimeLocal = (iso: string | null) => {
  if (!iso) return '';
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return '';
  const offset = fecha.getTimezoneOffset();
  const local = new Date(fecha.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
};

const crearContactosDemo = (): Contacto[] => {
  const fechaFutura = new Date();
  fechaFutura.setDate(fechaFutura.getDate() + 10);
  fechaFutura.setHours(10, 30, 0, 0);

  return [
    {
      id: 'demo-1',
      nombre: 'Pepe',
      email: 'pepe@ggma.co',
      telefono: '600111222',
      inversion: 1,
      comentarios: '',
      estado: 'Pendiente',
      comercialAsignado: null,
      proximaLlamada: null,
      vecesLlamado: 0,
      fechaCreacion: new Date().toISOString(),
    },
    {
      id: 'demo-2',
      nombre: 'Sergio Sediles',
      email: 'sergiosediles@gmail.com',
      telefono: '600333444',
      inversion: 5000,
      comentarios: '',
      estado: 'Pendiente',
      comercialAsignado: 'Sergio',
      proximaLlamada: null,
      vecesLlamado: 0,
      fechaCreacion: new Date().toISOString(),
    },
    {
      id: 'demo-3',
      nombre: 'Ana López',
      email: 'ana@example.com',
      telefono: '600555666',
      inversion: 2500,
      comentarios: 'Cliente con buen interés.',
      estado: 'Activo',
      comercialAsignado: 'Ana',
      proximaLlamada: fechaFutura.toISOString(),
      vecesLlamado: 2,
      fechaCreacion: new Date().toISOString(),
    },
  ];
};

const App: React.FC = () => {
  const [mostrarLogin, setMostrarLogin] = useState(false);
  const [panelPrivado, setPanelPrivado] = useState<PanelPrivado>('comercial');
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [sesion, setSesion] = useState<Sesion | null>(null);

  const [formPublico, setFormPublico] = useState({
    nombre: '',
    email: '',
    telefono: '',
    inversion: '',
    comentarios: '',
  });
  const [erroresPublico, setErroresPublico] = useState<string[]>([]);
  const [mensajePublico, setMensajePublico] = useState('');

  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [errorLogin, setErrorLogin] = useState('');

  const [filtroEstado, setFiltroEstado] = useState<'Todos' | EstadoContacto>('Todos');
  const [filtroComercial, setFiltroComercial] = useState('Todos');
  const [filtroInversion, setFiltroInversion] = useState('Todas');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    const rawContactos = localStorage.getItem(STORAGE_CONTACTOS);
    if (rawContactos) {
      try {
        setContactos(JSON.parse(rawContactos) as Contacto[]);
      } catch {
        setContactos(crearContactosDemo());
      }
    } else {
      setContactos(crearContactosDemo());
    }

    const rawSesion = localStorage.getItem(STORAGE_SESION);
    if (rawSesion) {
      try {
        const sesionGuardada = JSON.parse(rawSesion) as Sesion;
        setSesion(sesionGuardada);
        setPanelPrivado(sesionGuardada.rol === 'administrador' ? 'admin' : 'comercial');
      } catch {
        setSesion(null);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_CONTACTOS, JSON.stringify(contactos));
  }, [contactos]);

  useEffect(() => {
    if (sesion) {
      localStorage.setItem(STORAGE_SESION, JSON.stringify(sesion));
    } else {
      localStorage.removeItem(STORAGE_SESION);
    }
  }, [sesion]);

  const contactosComercial = useMemo(() => {
    if (!sesion || sesion.rol !== 'comercial') return [];
    return contactos.filter(
      (c) => c.comercialAsignado === sesion.nombre || c.comercialAsignado === null,
    );
  }, [contactos, sesion]);

  const asignadosComercial = useMemo(
    () => contactosComercial.filter((c) => c.comercialAsignado === sesion?.nombre),
    [contactosComercial, sesion],
  );

  const resumenComercial = useMemo(() => {
    const inversion = asignadosComercial.reduce((acc, c) => acc + c.inversion, 0);
    const activos = asignadosComercial.filter((c) => c.estado === 'Activo').length;
    const pendientes = asignadosComercial.filter((c) => c.estado === 'Pendiente').length;
    const llamadasProgramadas = asignadosComercial.filter((c) => c.proximaLlamada).length;
    return {
      inversion,
      total: asignadosComercial.length,
      activos,
      pendientes,
      llamadasProgramadas,
    };
  }, [asignadosComercial]);

  const resumenAdmin = useMemo(() => {
    const totalInversion = contactos.reduce((acc, c) => acc + c.inversion, 0);
    const activos = contactos.filter((c) => c.estado === 'Activo').length;
    const pendientes = contactos.filter((c) => c.estado === 'Pendiente').length;
    const llamadasProgramadas = contactos.filter((c) => c.proximaLlamada).length;
    const sinAsignar = contactos.filter((c) => !c.comercialAsignado).length;
    const conversion = contactos.length === 0 ? 0 : Math.round((activos / contactos.length) * 100);

    return { totalInversion, activos, pendientes, conversion, llamadasProgramadas, sinAsignar };
  }, [contactos]);

  const contactosAdminFiltrados = useMemo(() => {
    return contactos.filter((c) => {
      if (filtroEstado !== 'Todos' && c.estado !== filtroEstado) return false;
      if (filtroComercial !== 'Todos') {
        if (filtroComercial === 'Sin asignar' && c.comercialAsignado !== null) return false;
        if (filtroComercial !== 'Sin asignar' && c.comercialAsignado !== filtroComercial) return false;
      }

      if (filtroInversion === 'Menos de 1.000 €' && c.inversion >= 1000) return false;
      if (filtroInversion === '1.000 € - 5.000 €' && (c.inversion < 1000 || c.inversion > 5000)) return false;
      if (filtroInversion === 'Más de 5.000 €' && c.inversion <= 5000) return false;

      const texto = busqueda.trim().toLowerCase();
      if (texto) {
        const combinado = `${c.nombre} ${c.email} ${c.telefono}`.toLowerCase();
        if (!combinado.includes(texto)) return false;
      }
      return true;
    });
  }, [contactos, filtroComercial, filtroEstado, filtroInversion, busqueda]);

  const actualizarContacto = (id: string, cambios: Partial<Contacto>) => {
    setContactos((prev) => prev.map((c) => (c.id === id ? { ...c, ...cambios } : c)));
  };

  const registrarLlamada = (id: string) => {
    setContactos((prev) =>
      prev.map((c) => (c.id === id ? { ...c, vecesLlamado: c.vecesLlamado + 1 } : c)),
    );
  };

  const eliminarContacto = (id: string) => {
    const confirmar = window.confirm('¿Seguro que deseas eliminar este contacto?');
    if (!confirmar) return;
    setContactos((prev) => prev.filter((c) => c.id !== id));
  };

  const validarFormularioPublico = () => {
    const errores: string[] = [];
    if (!formPublico.nombre.trim()) errores.push('El nombre es obligatorio.');
    if (!formPublico.email.trim()) {
      errores.push('El correo es obligatorio.');
    } else if (!/^\S+@\S+\.\S+$/.test(formPublico.email)) {
      errores.push('El formato del correo no es válido.');
    }
    if (!formPublico.telefono.trim()) errores.push('El teléfono es obligatorio.');

    const inversion = Number(formPublico.inversion);
    if (!formPublico.inversion.trim()) {
      errores.push('La inversión es obligatoria.');
    } else if (!Number.isFinite(inversion)) {
      errores.push('La inversión debe ser numérica.');
    } else if (inversion < 0) {
      errores.push('La inversión no puede ser negativa.');
    }

    setErroresPublico(errores);
    return errores.length === 0;
  };

  const enviarSolicitud = (e: React.FormEvent) => {
    e.preventDefault();
    setMensajePublico('');
    if (!validarFormularioPublico()) return;

    const nuevo: Contacto = {
      id: crypto.randomUUID(),
      nombre: formPublico.nombre.trim(),
      email: formPublico.email.trim(),
      telefono: formPublico.telefono.trim(),
      inversion: Number(formPublico.inversion),
      comentarios: formPublico.comentarios.trim(),
      estado: 'Pendiente',
      comercialAsignado: null,
      proximaLlamada: null,
      vecesLlamado: 0,
      fechaCreacion: new Date().toISOString(),
    };

    setContactos((prev) => [nuevo, ...prev]);
    setFormPublico({ nombre: '', email: '', telefono: '', inversion: '', comentarios: '' });
    setErroresPublico([]);
    setMensajePublico('Solicitud enviada correctamente. Un comercial contactará contigo.');
  };

  const login = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLogin('');

    if (!loginData.username.trim() || !loginData.password.trim()) {
      setErrorLogin('Usuario y contraseña son obligatorios.');
      return;
    }

    const usuario = USUARIOS_DEMO.find(
      (u) => u.username === loginData.username.trim() && u.password === loginData.password,
    );

    if (!usuario) {
      setErrorLogin('Credenciales incorrectas.');
      return;
    }

    const nuevaSesion: Sesion = {
      username: usuario.username,
      rol: usuario.rol,
      nombre: usuario.nombre,
    };

    setSesion(nuevaSesion);
    setPanelPrivado(usuario.rol === 'administrador' ? 'admin' : 'comercial');
    setMostrarLogin(false);
    setLoginData({ username: '', password: '' });
  };

  const cerrarSesion = () => {
    setSesion(null);
    setPanelPrivado('comercial');
    setMostrarLogin(false);
  };

  const claseEstado = (estado: EstadoContacto) =>
    estado === 'Activo'
      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
      : 'bg-orange-100 text-orange-700 border-orange-200';

  const renderPublico = () => (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">FinanzaPro Simple</h1>
          <p className="text-slate-600 mt-1">
            Solicita asesoría de inversión y un comercial contactará contigo.
          </p>
        </div>
        <button
          className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg border border-slate-300"
          onClick={() => setMostrarLogin(true)}
        >
          Acceso agentes
        </button>
      </div>

      <form onSubmit={enviarSolicitud} className="mt-6 grid md:grid-cols-2 gap-4">
        <input
          className="border border-slate-300 rounded-lg px-3 py-2"
          placeholder="Nombre completo"
          value={formPublico.nombre}
          onChange={(e) => setFormPublico((p) => ({ ...p, nombre: e.target.value }))}
        />
        <input
          className="border border-slate-300 rounded-lg px-3 py-2"
          type="email"
          placeholder="Correo electrónico"
          value={formPublico.email}
          onChange={(e) => setFormPublico((p) => ({ ...p, email: e.target.value }))}
        />
        <input
          className="border border-slate-300 rounded-lg px-3 py-2"
          placeholder="Teléfono"
          value={formPublico.telefono}
          onChange={(e) => setFormPublico((p) => ({ ...p, telefono: e.target.value }))}
        />
        <input
          className="border border-slate-300 rounded-lg px-3 py-2"
          type="number"
          min="0"
          placeholder="Inversión estimada (€)"
          value={formPublico.inversion}
          onChange={(e) => setFormPublico((p) => ({ ...p, inversion: e.target.value }))}
        />
        <textarea
          className="border border-slate-300 rounded-lg px-3 py-2 md:col-span-2"
          placeholder="Comentarios (opcional)"
          rows={3}
          value={formPublico.comentarios}
          onChange={(e) => setFormPublico((p) => ({ ...p, comentarios: e.target.value }))}
        />

        {erroresPublico.length > 0 && (
          <div className="md:col-span-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
            <ul className="list-disc ml-5">
              {erroresPublico.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {mensajePublico && (
          <div className="md:col-span-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg p-3 text-sm">
            {mensajePublico}
          </div>
        )}

        <button className="md:col-span-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-2 font-medium">
          Enviar solicitud
        </button>
      </form>

      <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
        <p className="text-sm text-slate-600">Contacto directo:</p>
        <p className="text-lg font-semibold">contacto@tuempresa.com</p>
      </div>
    </section>
  );

  const renderLogin = () => (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-semibold">Acceso de agentes</h2>
      <p className="text-slate-600 text-sm mt-1">Inicia sesión para entrar al panel privado.</p>

      <form className="mt-4 space-y-3" onSubmit={login}>
        <input
          className="w-full border border-slate-300 rounded-lg px-3 py-2"
          placeholder="Usuario"
          value={loginData.username}
          onChange={(e) => setLoginData((p) => ({ ...p, username: e.target.value }))}
        />
        <input
          className="w-full border border-slate-300 rounded-lg px-3 py-2"
          type="password"
          placeholder="Contraseña"
          value={loginData.password}
          onChange={(e) => setLoginData((p) => ({ ...p, password: e.target.value }))}
        />

        {errorLogin && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-2 text-sm">
            {errorLogin}
          </div>
        )}

        <div className="flex gap-2">
          <button className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-2">Entrar</button>
          <button
            type="button"
            onClick={() => setMostrarLogin(false)}
            className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg py-2"
          >
            Volver
          </button>
        </div>
      </form>
    </section>
  );

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 text-slate-900">
      <div className="max-w-7xl mx-auto">
        {!sesion && !mostrarLogin && renderPublico()}
        {!sesion && mostrarLogin && renderLogin()}

        {sesion && (
          <section className="space-y-5">
            <header className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold">FinanzaPro Simple</h1>
                <p className="text-slate-600 text-sm">
                  Usuario: {sesion.nombre} ({sesion.rol})
                </p>
              </div>

              <div className="flex gap-2">
                {sesion.rol === 'administrador' && (
                  <>
                    <button
                      onClick={() => setPanelPrivado('comercial')}
                      className={`px-3 py-2 rounded-lg border ${
                        panelPrivado === 'comercial'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-700 border-slate-300'
                      }`}
                    >
                      Panel comercial
                    </button>
                    <button
                      onClick={() => setPanelPrivado('admin')}
                      className={`px-3 py-2 rounded-lg border ${
                        panelPrivado === 'admin'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-700 border-slate-300'
                      }`}
                    >
                      Panel administrador
                    </button>
                  </>
                )}
                <button
                  onClick={cerrarSesion}
                  className="px-3 py-2 rounded-lg border bg-slate-200 hover:bg-slate-300 text-slate-700"
                >
                  Cerrar sesión
                </button>
              </div>
            </header>

            {(sesion.rol === 'comercial' || panelPrivado === 'comercial') && (
              <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                <h2 className="text-2xl font-semibold">Panel comercial</h2>
                <p className="text-slate-600 mb-4">Comercial: {sesion.nombre}</p>

                <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
                  {[
                    ['Mi inversión gestionada', formatoMoneda(resumenComercial.inversion)],
                    ['Clientes totales asignados', String(resumenComercial.total)],
                    ['Clientes activos', String(resumenComercial.activos)],
                    ['Clientes pendientes', String(resumenComercial.pendientes)],
                    ['Llamadas programadas', String(resumenComercial.llamadasProgramadas)],
                  ].map(([label, valor]) => (
                    <div key={label} className="border rounded-xl p-3 bg-slate-50">
                      <p className="text-xs text-slate-500">{label}</p>
                      <p className="text-xl font-bold">{valor}</p>
                    </div>
                  ))}
                </div>

                <div className="overflow-x-auto border rounded-xl border-slate-200">
                  <table className="w-full text-left min-w-[980px]">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="p-3">Cliente</th><th className="p-3">Email</th><th className="p-3">Teléfono</th>
                        <th className="p-3">Inversión estimada</th><th className="p-3">Estado</th><th className="p-3">Comercial asignado</th>
                        <th className="p-3">Programar llamada</th><th className="p-3">Veces llamado</th><th className="p-3">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contactosComercial.map((c) => (
                        <tr key={c.id} className="border-t border-slate-100 align-top">
                          <td className="p-3">{c.nombre}</td>
                          <td className="p-3">{c.email}</td>
                          <td className="p-3">{c.telefono}</td>
                          <td className="p-3">{formatoMoneda(c.inversion)}</td>
                          <td className="p-3"><span className={`px-2 py-1 rounded-full border text-xs ${claseEstado(c.estado)}`}>{c.estado}</span></td>
                          <td className="p-3">{c.comercialAsignado ?? 'Sin asignar'}</td>
                          <td className="p-3 space-y-2">
                            <input
                              type="datetime-local"
                              value={toDatetimeLocal(c.proximaLlamada)}
                              onChange={(e) => actualizarContacto(c.id, { proximaLlamada: e.target.value ? new Date(e.target.value).toISOString() : null })}
                              className="border border-slate-300 rounded px-2 py-1 text-sm"
                            />
                            <p className="text-xs text-slate-500">{formatearFecha(c.proximaLlamada)}</p>
                          </td>
                          <td className="p-3">{c.vecesLlamado}</td>
                          <td className="p-3 space-y-2">
                            {!c.comercialAsignado && (
                              <button onClick={() => actualizarContacto(c.id, { comercialAsignado: sesion.nombre })} className="block w-full text-xs bg-slate-200 hover:bg-slate-300 rounded px-2 py-1">
                                Asignármelo
                              </button>
                            )}
                            <button onClick={() => registrarLlamada(c.id)} className="block w-full text-xs bg-blue-600 hover:bg-blue-500 text-white rounded px-2 py-1">Registrar llamada</button>
                            {c.estado === 'Pendiente' ? (
                              <button onClick={() => actualizarContacto(c.id, { estado: 'Activo' })} className="block w-full text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded px-2 py-1">Dar de alta</button>
                            ) : (
                              <span className="block w-full text-center text-xs text-emerald-700 bg-emerald-100 rounded px-2 py-1">Activo</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {contactosComercial.length === 0 && <p className="p-4 text-slate-500">No hay contactos para mostrar.</p>}
                </div>
              </section>
            )}

            {sesion.rol === 'administrador' && panelPrivado === 'admin' && (
              <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4">
                <h2 className="text-2xl font-semibold">Panel de administrador</h2>
                <p className="text-slate-600">
                  Vista global del sistema para controlar altas, pendientes, comerciales, llamadas y volumen total.
                </p>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    ['Total inversión clientes', formatoMoneda(resumenAdmin.totalInversion)],
                    ['Clientes activos', String(resumenAdmin.activos)],
                    ['Pendientes', String(resumenAdmin.pendientes)],
                    ['Conversión', `${resumenAdmin.conversion}%`],
                    ['Total llamadas programadas', String(resumenAdmin.llamadasProgramadas)],
                    ['Contactos sin asignar', String(resumenAdmin.sinAsignar)],
                  ].map(([label, valor]) => (
                    <div key={label} className="border rounded-xl p-3 bg-slate-50">
                      <p className="text-xs text-slate-500">{label}</p>
                      <p className="text-xl font-bold">{valor}</p>
                    </div>
                  ))}
                </div>

                <div className="grid md:grid-cols-4 gap-3">
                  <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value as 'Todos' | EstadoContacto)} className="border rounded-lg px-3 py-2">
                    <option>Todos</option><option>Pendiente</option><option>Activo</option>
                  </select>
                  <select value={filtroComercial} onChange={(e) => setFiltroComercial(e.target.value)} className="border rounded-lg px-3 py-2">
                    <option>Todos</option><option>Sin asignar</option>{COMERCIALES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <select value={filtroInversion} onChange={(e) => setFiltroInversion(e.target.value)} className="border rounded-lg px-3 py-2">
                    <option>Todas</option><option>Menos de 1.000 €</option><option>1.000 € - 5.000 €</option><option>Más de 5.000 €</option>
                  </select>
                  <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por nombre, email o teléfono" className="border rounded-lg px-3 py-2" />
                </div>

                <div className="overflow-x-auto border rounded-xl border-slate-200">
                  <table className="w-full text-left min-w-[1100px]">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="p-3">Cliente</th><th className="p-3">Email</th><th className="p-3">Teléfono</th><th className="p-3">Inversión</th>
                        <th className="p-3">Estado</th><th className="p-3">Comercial asignado</th><th className="p-3">Próxima llamada</th><th className="p-3">Veces llamado</th><th className="p-3">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contactosAdminFiltrados.map((c) => (
                        <tr key={c.id} className="border-t border-slate-100 align-top">
                          <td className="p-3">{c.nombre}</td>
                          <td className="p-3">{c.email}</td>
                          <td className="p-3">{c.telefono}</td>
                          <td className="p-3">{formatoMoneda(c.inversion)}</td>
                          <td className="p-3">
                            <button onClick={() => actualizarContacto(c.id, { estado: c.estado === 'Pendiente' ? 'Activo' : 'Pendiente' })} className={`px-2 py-1 rounded-full border text-xs ${claseEstado(c.estado)}`}>
                              {c.estado}
                            </button>
                          </td>
                          <td className="p-3">
                            <select
                              value={c.comercialAsignado ?? 'Sin asignar'}
                              onChange={(e) => actualizarContacto(c.id, { comercialAsignado: e.target.value === 'Sin asignar' ? null : e.target.value })}
                              className="border rounded px-2 py-1"
                            >
                              <option>Sin asignar</option>
                              {COMERCIALES.map((nombre) => <option key={nombre}>{nombre}</option>)}
                            </select>
                          </td>
                          <td className="p-3 space-y-2">
                            <input
                              type="datetime-local"
                              value={toDatetimeLocal(c.proximaLlamada)}
                              onChange={(e) => actualizarContacto(c.id, { proximaLlamada: e.target.value ? new Date(e.target.value).toISOString() : null })}
                              className="border border-slate-300 rounded px-2 py-1 text-sm"
                            />
                            <p className="text-xs text-slate-500">{formatearFecha(c.proximaLlamada)}</p>
                          </td>
                          <td className="p-3">{c.vecesLlamado}</td>
                          <td className="p-3 space-y-2">
                            {c.estado === 'Pendiente' ? (
                              <button onClick={() => actualizarContacto(c.id, { estado: 'Activo' })} className="block w-full text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded px-2 py-1">Dar de alta</button>
                            ) : (
                              <button onClick={() => actualizarContacto(c.id, { estado: 'Pendiente' })} className="block w-full text-xs bg-slate-200 hover:bg-slate-300 rounded px-2 py-1">Volver a pendiente</button>
                            )}
                            <button onClick={() => eliminarContacto(c.id)} className="block w-full text-xs bg-red-600 hover:bg-red-500 text-white rounded px-2 py-1">Eliminar contacto</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {contactosAdminFiltrados.length === 0 && <p className="p-4 text-slate-500">No hay resultados con los filtros actuales.</p>}
                </div>
              </section>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default App;
