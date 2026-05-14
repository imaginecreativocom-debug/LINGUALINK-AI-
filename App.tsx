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

interface Usuario { username: string; password: string; rol: RolUsuario; nombre: string; }
interface Sesion { username: string; rol: RolUsuario; nombre: string; }
interface EnlacesPublicos { servicios: string; faqs: string; privacidad: string; avisoLegal: string; }

const STORAGE_CONTACTOS = 'finanzapro_contactos';
const STORAGE_SESION = 'finanzapro_sesion';
const STORAGE_ENLACES = 'finanzapro_enlaces';

const ENLACES_DEMO: EnlacesPublicos = {
  servicios: '/servicios.html',
  faqs: '/faqs.html',
  privacidad: '/privacidad.html',
  avisoLegal: '/aviso-legal.html',
};

const USUARIOS_DEMO: Usuario[] = [
  { username: 'admin', password: 'admin123', rol: 'administrador', nombre: 'Administrador' },
  { username: 'sergio', password: 'sergio123', rol: 'comercial', nombre: 'Sergio' },
  { username: 'ana', password: 'ana123', rol: 'comercial', nombre: 'Ana' },
  { username: 'comercial1', password: 'comercial123', rol: 'comercial', nombre: 'Comercial 1' },
  { username: 'comercial2', password: 'comercial123', rol: 'comercial', nombre: 'Comercial 2' },
];
const COMERCIALES = ['Sergio', 'Ana', 'Comercial 1', 'Comercial 2'];

const formatoMoneda = (v: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(v);
const formatearFecha = (iso: string | null) => !iso ? 'Sin programar' : new Intl.DateTimeFormat('es-ES',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(iso));
const toDatetimeLocal = (iso: string | null) => {
  if (!iso) return '';
  const fecha = new Date(iso); const offset = fecha.getTimezoneOffset();
  return new Date(fecha.getTime() - offset * 60000).toISOString().slice(0,16);
};

const crearContactosDemo = (): Contacto[] => {
  const f = new Date(); f.setDate(f.getDate()+10); f.setHours(10,30,0,0);
  return [
    { id:'demo-1', nombre:'Pepe', email:'pepe@ggma.co', telefono:'600111222', inversion:1, comentarios:'', estado:'Pendiente', comercialAsignado:null, proximaLlamada:null, vecesLlamado:0, fechaCreacion:new Date().toISOString() },
    { id:'demo-2', nombre:'Sergio Sediles', email:'sergiosediles@gmail.com', telefono:'600333444', inversion:5000, comentarios:'', estado:'Pendiente', comercialAsignado:'Sergio', proximaLlamada:null, vecesLlamado:0, fechaCreacion:new Date().toISOString() },
    { id:'demo-3', nombre:'Ana López', email:'ana@example.com', telefono:'600555666', inversion:2500, comentarios:'Cliente con buen interés.', estado:'Activo', comercialAsignado:'Ana', proximaLlamada:f.toISOString(), vecesLlamado:2, fechaCreacion:new Date().toISOString() },
  ];
};

const App: React.FC = () => {
  const [mostrarLogin, setMostrarLogin] = useState(false);
  const [panelPrivado, setPanelPrivado] = useState<PanelPrivado>('comercial');
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [enlaces, setEnlaces] = useState<EnlacesPublicos>(ENLACES_DEMO);
  const [formPublico, setFormPublico] = useState({ nombre:'', email:'', telefono:'', inversion:'', comentarios:'' });
  const [erroresPublico, setErroresPublico] = useState<string[]>([]);
  const [mensajePublico, setMensajePublico] = useState('');
  const [loginData, setLoginData] = useState({ username:'', password:'' });
  const [errorLogin, setErrorLogin] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'Todos' | EstadoContacto>('Todos');
  const [filtroComercial, setFiltroComercial] = useState('Todos');
  const [filtroInversion, setFiltroInversion] = useState('Todas');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    setContactos(JSON.parse(localStorage.getItem(STORAGE_CONTACTOS) || 'null') || crearContactosDemo());
    setSesion(JSON.parse(localStorage.getItem(STORAGE_SESION) || 'null'));
    setEnlaces(JSON.parse(localStorage.getItem(STORAGE_ENLACES) || 'null') || ENLACES_DEMO);
  }, []);
  useEffect(() => { localStorage.setItem(STORAGE_CONTACTOS, JSON.stringify(contactos)); }, [contactos]);
  useEffect(() => { sesion ? localStorage.setItem(STORAGE_SESION, JSON.stringify(sesion)) : localStorage.removeItem(STORAGE_SESION); }, [sesion]);
  useEffect(() => { localStorage.setItem(STORAGE_ENLACES, JSON.stringify(enlaces)); }, [enlaces]);

  const contactosComercial = useMemo(() => sesion?.rol !== 'comercial' ? [] : contactos.filter(c => c.comercialAsignado === sesion.nombre || c.comercialAsignado === null), [contactos, sesion]);
  const asignadosComercial = useMemo(() => contactosComercial.filter(c => c.comercialAsignado === sesion?.nombre), [contactosComercial, sesion]);
  const resumenComercial = useMemo(() => ({
    inversion: asignadosComercial.reduce((a,c)=>a+c.inversion,0), total: asignadosComercial.length,
    activos: asignadosComercial.filter(c=>c.estado==='Activo').length,
    pendientes: asignadosComercial.filter(c=>c.estado==='Pendiente').length,
    llamadasProgramadas: asignadosComercial.filter(c=>c.proximaLlamada).length,
  }), [asignadosComercial]);
  const resumenAdmin = useMemo(() => {
    const activos = contactos.filter(c=>c.estado==='Activo').length;
    return {
      totalInversion: contactos.reduce((a,c)=>a+c.inversion,0), activos,
      pendientes: contactos.filter(c=>c.estado==='Pendiente').length,
      conversion: contactos.length? Math.round((activos/contactos.length)*100):0,
      llamadasProgramadas: contactos.filter(c=>c.proximaLlamada).length,
      sinAsignar: contactos.filter(c=>!c.comercialAsignado).length,
    };
  }, [contactos]);
  const contactosAdminFiltrados = useMemo(()=>contactos.filter(c=>{
    if (filtroEstado!=='Todos' && c.estado!==filtroEstado) return false;
    if (filtroComercial!=='Todos' && ((filtroComercial==='Sin asignar' && c.comercialAsignado!==null) || (filtroComercial!=='Sin asignar' && c.comercialAsignado!==filtroComercial))) return false;
    if (filtroInversion==='Menos de 1.000 €' && c.inversion>=1000) return false;
    if (filtroInversion==='1.000 € - 5.000 €' && (c.inversion<1000 || c.inversion>5000)) return false;
    if (filtroInversion==='Más de 5.000 €' && c.inversion<=5000) return false;
    const t = busqueda.trim().toLowerCase();
    return !t || `${c.nombre} ${c.email} ${c.telefono}`.toLowerCase().includes(t);
  }),[contactos,filtroEstado,filtroComercial,filtroInversion,busqueda]);

  const actualizarContacto = (id:string, cambios:Partial<Contacto>) => setContactos(p=>p.map(c=>c.id===id?{...c,...cambios}:c));
  const registrarLlamada = (id:string) => setContactos(p=>p.map(c=>c.id===id?{...c,vecesLlamado:c.vecesLlamado+1}:c));
  const eliminarContacto = (id:string) => window.confirm('¿Seguro que deseas eliminar este contacto?') && setContactos(p=>p.filter(c=>c.id!==id));

  const enviarSolicitud = (e: React.FormEvent) => {
    e.preventDefault();
    const err:string[]=[]; const inv = Number(formPublico.inversion);
    if (!formPublico.nombre.trim()) err.push('El nombre es obligatorio.');
    if (!/^\S+@\S+\.\S+$/.test(formPublico.email)) err.push('El correo es obligatorio y válido.');
    if (!formPublico.telefono.trim()) err.push('El teléfono es obligatorio.');
    if (!formPublico.inversion.trim() || !Number.isFinite(inv) || inv < 0) err.push('La inversión debe ser válida y no negativa.');
    setErroresPublico(err); if (err.length) return;
    setContactos(p=>[{ id:crypto.randomUUID(), nombre:formPublico.nombre.trim(), email:formPublico.email.trim(), telefono:formPublico.telefono.trim(), inversion:inv, comentarios:formPublico.comentarios.trim(), estado:'Pendiente', comercialAsignado:null, proximaLlamada:null, vecesLlamado:0, fechaCreacion:new Date().toISOString() }, ...p]);
    setFormPublico({ nombre:'', email:'', telefono:'', inversion:'', comentarios:'' });
    setMensajePublico('Solicitud enviada correctamente. Un comercial contactará contigo.');
  };

  const login = (e: React.FormEvent) => {
    e.preventDefault();
    const u = USUARIOS_DEMO.find(x=>x.username===loginData.username.trim() && x.password===loginData.password);
    if (!u) return setErrorLogin('Credenciales incorrectas.');
    setSesion({ username:u.username, rol:u.rol, nombre:u.nombre });
    setPanelPrivado(u.rol==='administrador'?'admin':'comercial'); setMostrarLogin(false); setErrorLogin('');
  };

  const claseEstado = (e:EstadoContacto)=>e==='Activo'?'bg-emerald-100 text-emerald-700 border-emerald-200':'bg-orange-100 text-orange-700 border-orange-200';

  return <div className="min-h-screen bg-slate-100 p-4 md:p-8 text-slate-900"><div className="max-w-7xl mx-auto">
    {!sesion && !mostrarLogin && <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><h1 className="text-3xl font-bold">FinanzaPro Simple</h1><p className="text-slate-600 mt-1">Invertir bien también es saber esperar: en 1976, una inversión de 1.000 € en un índice global, reinvirtiendo beneficios, hoy valdría varias decenas de miles. Solicita asesoría de inversión y un comercial contactará contigo.</p></div><button onClick={()=>setMostrarLogin(true)} className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg border border-slate-300">Acceso agentes</button></div>
      <div className="mt-5 flex flex-wrap gap-2"><a href={enlaces.servicios} className="bg-blue-600 text-white px-4 py-2 rounded-lg">Servicios</a><a href={enlaces.faqs} className="bg-blue-600 text-white px-4 py-2 rounded-lg">FAQs</a></div>
      <form onSubmit={enviarSolicitud} className="mt-6 grid md:grid-cols-2 gap-4">
        <input className="border border-slate-300 rounded-lg px-3 py-2" placeholder="Nombre completo" value={formPublico.nombre} onChange={e=>setFormPublico(p=>({...p,nombre:e.target.value}))}/>
        <input className="border border-slate-300 rounded-lg px-3 py-2" type="email" placeholder="Correo electrónico" value={formPublico.email} onChange={e=>setFormPublico(p=>({...p,email:e.target.value}))}/>
        <input className="border border-slate-300 rounded-lg px-3 py-2" placeholder="Teléfono" value={formPublico.telefono} onChange={e=>setFormPublico(p=>({...p,telefono:e.target.value}))}/>
        <input className="border border-slate-300 rounded-lg px-3 py-2" type="number" min="0" placeholder="Inversión estimada (€)" value={formPublico.inversion} onChange={e=>setFormPublico(p=>({...p,inversion:e.target.value}))}/>
        <textarea className="border border-slate-300 rounded-lg px-3 py-2 md:col-span-2" rows={3} placeholder="Comentarios (opcional)" value={formPublico.comentarios} onChange={e=>setFormPublico(p=>({...p,comentarios:e.target.value}))}/>
        {erroresPublico.length>0 && <div className="md:col-span-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{erroresPublico.join(' ')}</div>}
        {mensajePublico && <div className="md:col-span-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg p-3 text-sm">{mensajePublico}</div>}
        <button className="md:col-span-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-2 font-medium">Enviar solicitud</button>
      </form>
      <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg"><p className="text-sm text-slate-600">Contacto directo:</p><p className="text-lg font-semibold">contacto@tuempresa.com</p></div>
      <footer className="mt-8 pt-4 border-t border-slate-200 text-sm text-slate-600 flex flex-col md:flex-row md:justify-between gap-2"><div className="flex gap-4"><a href={enlaces.privacidad} className="hover:underline">Privacidad</a><a href={enlaces.avisoLegal} className="hover:underline">Aviso legal</a></div><p>Hecho por ImagineCreativo 360 · Contactos: info@imaginecreativo.com</p></footer>
    </section>}
    {!sesion && mostrarLogin && <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 max-w-md mx-auto"><h2 className="text-2xl font-semibold">Acceso de agentes</h2><p className="text-slate-600 text-sm mt-1">Usuario demo: admin/admin123</p><form className="mt-4 space-y-3" onSubmit={login}><input className="w-full border border-slate-300 rounded-lg px-3 py-2" placeholder="Usuario" value={loginData.username} onChange={e=>setLoginData(p=>({...p,username:e.target.value}))}/><input className="w-full border border-slate-300 rounded-lg px-3 py-2" type="password" placeholder="Contraseña" value={loginData.password} onChange={e=>setLoginData(p=>({...p,password:e.target.value}))}/>{errorLogin && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-2 text-sm">{errorLogin}</div>}<div className="flex gap-2"><button className="flex-1 bg-blue-600 text-white rounded-lg py-2">Entrar</button><button type="button" onClick={()=>setMostrarLogin(false)} className="flex-1 bg-slate-200 rounded-lg py-2">Volver</button></div></form></section>}
    {sesion && <section className="space-y-5"><header className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><h1 className="text-2xl font-bold">FinanzaPro Simple</h1><p className="text-slate-600 text-sm">Usuario: {sesion.nombre} ({sesion.rol})</p></div><div className="flex gap-2">{sesion.rol==='administrador' && <><button onClick={()=>setPanelPrivado('comercial')} className={`px-3 py-2 rounded-lg border ${panelPrivado==='comercial'?'bg-blue-600 text-white border-blue-600':'bg-white text-slate-700 border-slate-300'}`}>Panel comercial</button><button onClick={()=>setPanelPrivado('admin')} className={`px-3 py-2 rounded-lg border ${panelPrivado==='admin'?'bg-blue-600 text-white border-blue-600':'bg-white text-slate-700 border-slate-300'}`}>Panel administrador</button></>}<button onClick={()=>setSesion(null)} className="px-3 py-2 rounded-lg border bg-slate-200">Cerrar sesión</button></div></header>
    {(sesion.rol==='comercial' || panelPrivado==='comercial') && <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5"><h2 className="text-2xl font-semibold">Panel comercial</h2><p className="text-slate-600 mb-4">Comercial: {sesion.nombre}</p><div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">{[['Mi inversión gestionada',formatoMoneda(resumenComercial.inversion)],['Clientes totales asignados',String(resumenComercial.total)],['Clientes activos',String(resumenComercial.activos)],['Clientes pendientes',String(resumenComercial.pendientes)],['Llamadas programadas',String(resumenComercial.llamadasProgramadas)]].map(([l,v])=><div key={l} className="border rounded-xl p-3 bg-slate-50"><p className="text-xs text-slate-500">{l}</p><p className="text-xl font-bold">{v}</p></div>)}</div><div className="overflow-x-auto border rounded-xl border-slate-200"><table className="w-full text-left min-w-[980px]"><thead className="bg-slate-50"><tr><th className="p-3">Cliente</th><th className="p-3">Email</th><th className="p-3">Teléfono</th><th className="p-3">Inversión</th><th className="p-3">Estado</th><th className="p-3">Comercial</th><th className="p-3">Programar</th><th className="p-3">Veces llamado</th><th className="p-3">Acción</th></tr></thead><tbody>{contactosComercial.map(c=><tr key={c.id} className="border-t border-slate-100 align-top"><td className="p-3">{c.nombre}</td><td className="p-3">{c.email}</td><td className="p-3">{c.telefono}</td><td className="p-3">{formatoMoneda(c.inversion)}</td><td className="p-3"><span className={`px-2 py-1 rounded-full border text-xs ${claseEstado(c.estado)}`}>{c.estado}</span></td><td className="p-3">{c.comercialAsignado ?? 'Sin asignar'}</td><td className="p-3"><input type="datetime-local" value={toDatetimeLocal(c.proximaLlamada)} onChange={e=>actualizarContacto(c.id,{proximaLlamada:e.target.value?new Date(e.target.value).toISOString():null})} className="border border-slate-300 rounded px-2 py-1 text-sm"/><p className="text-xs text-slate-500">{formatearFecha(c.proximaLlamada)}</p></td><td className="p-3">{c.vecesLlamado}</td><td className="p-3 space-y-1">{!c.comercialAsignado && <button onClick={()=>actualizarContacto(c.id,{comercialAsignado:sesion.nombre})} className="block w-full text-xs bg-slate-200 rounded px-2 py-1">Asignármelo</button>}<button onClick={()=>registrarLlamada(c.id)} className="block w-full text-xs bg-blue-600 text-white rounded px-2 py-1">Registrar llamada</button>{c.estado==='Pendiente'?<button onClick={()=>actualizarContacto(c.id,{estado:'Activo'})} className="block w-full text-xs bg-emerald-600 text-white rounded px-2 py-1">Dar de alta</button>:<span className="block w-full text-center text-xs text-emerald-700 bg-emerald-100 rounded px-2 py-1">Activo</span>}</td></tr>)}</tbody></table></div></section>}
    {sesion.rol==='administrador' && panelPrivado==='admin' && <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4"><h2 className="text-2xl font-semibold">Panel de administrador</h2><p className="text-slate-600">Vista global del sistema para controlar altas, pendientes, comerciales, llamadas y volumen total.</p>
      <div className="border rounded-xl p-4 bg-slate-50"><h3 className="font-semibold mb-2">Enlaces públicos editables</h3><div className="grid md:grid-cols-2 gap-2 text-sm"><input className="border rounded px-2 py-1" value={enlaces.servicios} onChange={e=>setEnlaces(p=>({...p,servicios:e.target.value}))} placeholder="URL Servicios"/><input className="border rounded px-2 py-1" value={enlaces.faqs} onChange={e=>setEnlaces(p=>({...p,faqs:e.target.value}))} placeholder="URL FAQs"/><input className="border rounded px-2 py-1" value={enlaces.privacidad} onChange={e=>setEnlaces(p=>({...p,privacidad:e.target.value}))} placeholder="URL Privacidad"/><input className="border rounded px-2 py-1" value={enlaces.avisoLegal} onChange={e=>setEnlaces(p=>({...p,avisoLegal:e.target.value}))} placeholder="URL Aviso legal"/></div></div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">{[['Total inversión clientes',formatoMoneda(resumenAdmin.totalInversion)],['Clientes activos',String(resumenAdmin.activos)],['Pendientes',String(resumenAdmin.pendientes)],['Conversión',`${resumenAdmin.conversion}%`],['Total llamadas programadas',String(resumenAdmin.llamadasProgramadas)],['Contactos sin asignar',String(resumenAdmin.sinAsignar)]].map(([l,v])=><div key={l} className="border rounded-xl p-3 bg-slate-50"><p className="text-xs text-slate-500">{l}</p><p className="text-xl font-bold">{v}</p></div>)}</div>
      <div className="grid md:grid-cols-4 gap-3"><select value={filtroEstado} onChange={e=>setFiltroEstado(e.target.value as any)} className="border rounded-lg px-3 py-2"><option>Todos</option><option>Pendiente</option><option>Activo</option></select><select value={filtroComercial} onChange={e=>setFiltroComercial(e.target.value)} className="border rounded-lg px-3 py-2"><option>Todos</option><option>Sin asignar</option>{COMERCIALES.map(c=><option key={c}>{c}</option>)}</select><select value={filtroInversion} onChange={e=>setFiltroInversion(e.target.value)} className="border rounded-lg px-3 py-2"><option>Todas</option><option>Menos de 1.000 €</option><option>1.000 € - 5.000 €</option><option>Más de 5.000 €</option></select><input value={busqueda} onChange={e=>setBusqueda(e.target.value)} placeholder="Buscar por nombre, email o teléfono" className="border rounded-lg px-3 py-2"/></div>
      <div className="overflow-x-auto border rounded-xl border-slate-200"><table className="w-full text-left min-w-[1100px]"><thead className="bg-slate-50"><tr><th className="p-3">Cliente</th><th className="p-3">Email</th><th className="p-3">Teléfono</th><th className="p-3">Inversión</th><th className="p-3">Estado</th><th className="p-3">Comercial</th><th className="p-3">Próxima llamada</th><th className="p-3">Veces llamado</th><th className="p-3">Acción</th></tr></thead><tbody>{contactosAdminFiltrados.map(c=><tr key={c.id} className="border-t border-slate-100 align-top"><td className="p-3">{c.nombre}</td><td className="p-3">{c.email}</td><td className="p-3">{c.telefono}</td><td className="p-3">{formatoMoneda(c.inversion)}</td><td className="p-3"><span className={`px-2 py-1 rounded-full border text-xs ${claseEstado(c.estado)}`}>{c.estado}</span></td><td className="p-3"><select value={c.comercialAsignado ?? 'Sin asignar'} onChange={e=>actualizarContacto(c.id,{comercialAsignado:e.target.value==='Sin asignar'?null:e.target.value})} className="border rounded px-2 py-1"><option>Sin asignar</option>{COMERCIALES.map(n=><option key={n}>{n}</option>)}</select></td><td className="p-3"><input type="datetime-local" value={toDatetimeLocal(c.proximaLlamada)} onChange={e=>actualizarContacto(c.id,{proximaLlamada:e.target.value?new Date(e.target.value).toISOString():null})} className="border border-slate-300 rounded px-2 py-1 text-sm"/><p className="text-xs text-slate-500">{formatearFecha(c.proximaLlamada)}</p></td><td className="p-3">{c.vecesLlamado}</td><td className="p-3 space-y-1">{c.estado==='Pendiente'?<button onClick={()=>actualizarContacto(c.id,{estado:'Activo'})} className="block w-full text-xs bg-emerald-600 text-white rounded px-2 py-1">Dar de alta</button>:<button onClick={()=>actualizarContacto(c.id,{estado:'Pendiente'})} className="block w-full text-xs bg-slate-200 rounded px-2 py-1">Volver a pendiente</button>}<button onClick={()=>eliminarContacto(c.id)} className="block w-full text-xs bg-red-600 text-white rounded px-2 py-1">Eliminar contacto</button></td></tr>)}</tbody></table></div>
    </section>}</section>}
  </div></div>;
};

export default App;
