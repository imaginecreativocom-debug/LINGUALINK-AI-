import React, { useEffect, useMemo, useState } from 'react';

type Estado = 'Pendiente' | 'Activo';
type Rol = 'administrador' | 'comercial';
interface Contacto { id: string; nombre: string; email: string; telefono: string; inversion: number; comentarios: string; estado: Estado; comercialAsignado: string | null; proximaLlamada: string | null; visita: string | null; vecesLlamado: number; }
interface Usuario { username: string; password: string; rol: Rol; nombre: string; activo: boolean }
interface Sesion { username: string; rol: Rol; nombre: string }

const K = { c: 'fin_c', u: 'fin_u', s: 'fin_s' };
const DEMO_USERS: Usuario[] = [
  { username: 'admin', password: 'admin123', rol: 'administrador', nombre: 'Administrador', activo: true },
  { username: 'sergio', password: 'sergio123', rol: 'comercial', nombre: 'Sergio', activo: true },
  { username: 'ana', password: 'ana123', rol: 'comercial', nombre: 'Ana', activo: true },
];
const DEMO_CONTACTOS: Contacto[] = [
  { id: '1', nombre: 'Pepe', email: 'pepe@ggma.co', telefono: '600111222', inversion: 1, comentarios: '', estado: 'Pendiente', comercialAsignado: null, proximaLlamada: null, visita: null, vecesLlamado: 0 },
];

const eur = (n: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n);
const fmt = (d: string | null) => (d ? new Intl.DateTimeFormat('es-ES', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(d)) : 'Sin programar');

export default function App() {
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [mostrarLogin, setMostrarLogin] = useState(false);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [login, setLogin] = useState({ u: '', p: '', e: '' });
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', inversion: '', comentarios: '' });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    setUsuarios(JSON.parse(localStorage.getItem(K.u) || 'null') || DEMO_USERS);
    setContactos(JSON.parse(localStorage.getItem(K.c) || 'null') || DEMO_CONTACTOS);
    setSesion(JSON.parse(localStorage.getItem(K.s) || 'null'));
  }, []);
  useEffect(() => localStorage.setItem(K.u, JSON.stringify(usuarios)), [usuarios]);
  useEffect(() => localStorage.setItem(K.c, JSON.stringify(contactos)), [contactos]);
  useEffect(() => (sesion ? localStorage.setItem(K.s, JSON.stringify(sesion)) : localStorage.removeItem(K.s)), [sesion]);

  const comerciales = usuarios.filter((u) => u.rol === 'comercial');
  const visibles = useMemo(() => {
    if (!sesion) return [];
    return sesion.rol === 'comercial' ? contactos.filter((c) => c.comercialAsignado === sesion.nombre || c.comercialAsignado === null) : contactos;
  }, [sesion, contactos]);

  const enviarLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre || !/^\S+@\S+\.\S+$/.test(form.email) || !form.telefono || Number(form.inversion) < 0 || !form.inversion) return;
    setContactos((p) => [{ id: crypto.randomUUID(), nombre: form.nombre, email: form.email, telefono: form.telefono, inversion: Number(form.inversion), comentarios: form.comentarios, estado: 'Pendiente', comercialAsignado: null, proximaLlamada: null, visita: null, vecesLlamado: 0 }, ...p]);
    setForm({ nombre: '', email: '', telefono: '', inversion: '', comentarios: '' });
    setMsg('Solicitud enviada correctamente. Un comercial contactará contigo.');
  };

  const doLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const u = usuarios.find((x) => x.username === login.u && x.password === login.p && x.activo);
    if (!u) return setLogin((p) => ({ ...p, e: 'Credenciales incorrectas o usuario inactivo' }));
    setSesion({ username: u.username, rol: u.rol, nombre: u.nombre });
    setMostrarLogin(false);
    setLogin({ u: '', p: '', e: '' });
  };

  const setC = (id: string, chg: Partial<Contacto>) => setContactos((p) => p.map((c) => (c.id === id ? { ...c, ...chg } : c)));

  if (!sesion && !mostrarLogin) {
    return <div className='min-h-screen bg-slate-100 p-4 md:p-8'><div className='max-w-5xl mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-sm'>
      <div className='flex justify-between items-start gap-4'><div><h1 className='text-3xl font-bold text-slate-900'>FinanzaPro Simple</h1><p className='text-slate-600 mt-2'>Solicita asesoría de inversión y un comercial contactará contigo.</p></div><button onClick={() => setMostrarLogin(true)} className='bg-slate-200 px-4 py-2 rounded-lg'>Acceso agentes</button></div>
      <div className='mt-4 flex gap-2'><a href='/servicios.html' className='bg-blue-600 text-white px-3 py-2 rounded-lg'>Servicios</a><a href='/faqs.html' className='bg-blue-600 text-white px-3 py-2 rounded-lg'>FAQs</a></div>
      <form onSubmit={enviarLead} className='grid md:grid-cols-2 gap-3 mt-5'>
        <input className='border p-2 rounded-lg text-slate-900 placeholder-slate-400 bg-white' placeholder='Nombre completo' value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
        <input className='border p-2 rounded-lg text-slate-900 placeholder-slate-400 bg-white' placeholder='Correo electrónico' value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className='border p-2 rounded-lg text-slate-900 placeholder-slate-400 bg-white' placeholder='Teléfono' value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
        <input className='border p-2 rounded-lg text-slate-900 placeholder-slate-400 bg-white' type='number' min='0' placeholder='Inversión estimada (€)' value={form.inversion} onChange={(e) => setForm({ ...form, inversion: e.target.value })} />
        <textarea className='border p-2 rounded-lg md:col-span-2' placeholder='Comentarios (opcional)' value={form.comentarios} onChange={(e) => setForm({ ...form, comentarios: e.target.value })} />
        <button className='md:col-span-2 bg-blue-600 text-white py-2 rounded-lg'>Enviar solicitud</button>
      </form>
      {msg && <p className='mt-3 text-emerald-700'>{msg}</p>}
      <footer className='mt-6 pt-4 border-t text-sm text-slate-600 flex flex-col gap-2 md:flex-row md:justify-between'><div className='flex gap-3'><a href='/privacidad.html'>Privacidad</a><a href='/aviso-legal.html'>Aviso legal</a></div><p>Hecho por ImagineCreativo 360 · info@imaginecreativo.com</p></footer>
    </div></div>;
  }

  if (!sesion && mostrarLogin) return <div className='min-h-screen bg-slate-100 p-8'><div className='max-w-md mx-auto bg-white p-6 rounded-xl'><h2 className='text-2xl font-bold text-slate-900'>Acceso agentes</h2><p className='text-sm text-slate-600 mt-1'>Demo: admin/admin123 · sergio/sergio123 · ana/ana123</p><form onSubmit={doLogin} className='space-y-2 mt-3'><input className='w-full border p-2 rounded text-slate-900 placeholder-slate-400 bg-white' placeholder='Usuario' value={login.u} onChange={(e) => setLogin({ ...login, u: e.target.value, e: '' })} /><input className='w-full border p-2 rounded text-slate-900 placeholder-slate-400 bg-white' type='password' placeholder='Contraseña' value={login.p} onChange={(e) => setLogin({ ...login, p: e.target.value, e: '' })} />{login.e && <p className='text-red-600 text-sm'>{login.e}</p>}<div className='flex gap-2'><button className='bg-blue-600 text-white px-3 py-2 rounded'>Entrar</button><button type='button' onClick={() => setMostrarLogin(false)} className='bg-slate-200 px-3 py-2 rounded'>Volver</button></div></form></div></div>;

  return <div className='min-h-screen bg-slate-100 p-3 md:p-4 space-y-4 text-slate-900'><div className='bg-white rounded-xl p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between'><div><h1 className='text-2xl font-bold'>Panel {sesion?.rol === 'administrador' ? 'Administrador' : 'Comercial'}</h1><p>{sesion?.nombre}</p></div><button onClick={() => setSesion(null)} className='bg-slate-200 px-3 py-2 rounded'>Cerrar sesión</button></div>
    <div className='bg-white rounded-xl p-4 overflow-auto'><table className='min-w-[1000px] w-full'><thead><tr>{['Cliente', 'Email', 'Tel', 'Inv', 'Estado', 'Comercial', 'Llamada', 'Visita', '#', 'Acciones'].map((h) => <th key={h} className='text-left p-2'>{h}</th>)}</tr></thead><tbody>{visibles.map((c) => <tr key={c.id} className='border-t'><td className='p-2'>{c.nombre}</td><td>{c.email}</td><td>{c.telefono}</td><td>{eur(c.inversion)}</td><td>{c.estado}</td><td>{sesion?.rol === 'administrador' ? <select value={c.comercialAsignado ?? 'Sin asignar'} onChange={(e) => setC(c.id, { comercialAsignado: e.target.value === 'Sin asignar' ? null : e.target.value })}><option>Sin asignar</option>{comerciales.map((x) => <option key={x.nombre}>{x.nombre}</option>)}</select> : c.comercialAsignado ?? 'Sin asignar'}</td><td><input type='datetime-local' value={c.proximaLlamada ? new Date(c.proximaLlamada).toISOString().slice(0, 16) : ''} onChange={(e) => setC(c.id, { proximaLlamada: e.target.value ? new Date(e.target.value).toISOString() : null })} /></td><td><input type='datetime-local' value={c.visita ? new Date(c.visita).toISOString().slice(0, 16) : ''} onChange={(e) => setC(c.id, { visita: e.target.value ? new Date(e.target.value).toISOString() : null })} /></td><td>{c.vecesLlamado}</td><td><button onClick={() => setC(c.id, { vecesLlamado: c.vecesLlamado + 1 })} className='bg-blue-600 text-white px-2 py-1 rounded mr-1'>Registrar llamada</button><button onClick={() => setC(c.id, { estado: c.estado === 'Activo' ? 'Pendiente' : 'Activo' })} className='bg-emerald-600 text-white px-2 py-1 rounded'>Alta/Baja</button></td></tr>)}</tbody></table></div>
    {sesion?.rol === 'administrador' && <div className='bg-white rounded-xl p-4'><h3 className='font-bold mb-2'>Gestión de comerciales</h3>{comerciales.map((u) => <div key={u.username} className='flex items-center gap-2 py-1'><span className='w-28'>{u.nombre}</span><button onClick={() => setUsuarios((p) => p.map((x) => x.username === u.username ? { ...x, activo: !x.activo } : x))} className='bg-slate-200 px-2 rounded'>{u.activo ? 'Activo' : 'Inactivo'}</button><input className='border p-1 rounded text-slate-900 placeholder-slate-400 bg-white' placeholder='Nueva contraseña' onBlur={(e) => e.target.value && setUsuarios((p) => p.map((x) => x.username === u.username ? { ...x, password: e.target.value } : x))} /></div>)}</div>}
  </div>;
}
