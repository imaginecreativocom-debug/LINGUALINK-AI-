import React, { useEffect, useMemo, useState } from 'react';

type Estado='Pendiente'|'Activo'; type Rol='administrador'|'comercial'; type Vista='tabla'|'kanban'|'calendario';
interface Contacto{ id:string; nombre:string; email:string; telefono:string; inversion:number; estado:Estado; comercialAsignado:string|null; proximaLlamada:string|null; visita:string|null; vecesLlamado:number; }
interface Usuario{ username:string; password:string; rol:Rol; nombre:string; activo:boolean }
interface Sesion{ username:string; rol:Rol; nombre:string }
const K={c:'fin_c',u:'fin_u',s:'fin_s'};
const demoUsers:Usuario[]=[{username:'admin',password:'admin123',rol:'administrador',nombre:'Administrador',activo:true},{username:'sergio',password:'sergio123',rol:'comercial',nombre:'Sergio',activo:true},{username:'ana',password:'ana123',rol:'comercial',nombre:'Ana',activo:true}];
const demoC:Contacto[]=[{id:'1',nombre:'Pepe',email:'pepe@ggma.co',telefono:'600111222',inversion:1,estado:'Pendiente',comercialAsignado:null,proximaLlamada:null,visita:null,vecesLlamado:0}];
const eur=(n:number)=>new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'}).format(n);
const fmt=(d:string|null)=>d?new Intl.DateTimeFormat('es-ES',{dateStyle:'short',timeStyle:'short'}).format(new Date(d)):'-';

export default function App(){
  const [contactos,setContactos]=useState<Contacto[]>([]); const [usuarios,setUsuarios]=useState<Usuario[]>([]); const [sesion,setSesion]=useState<Sesion|null>(null);
  const [login,setLogin]=useState({u:'',p:'',e:''}); const [vista,setVista]=useState<Vista>('tabla'); const [f,setF]=useState({q:'',estado:'Todos',comercial:'Todos'});

  useEffect(()=>{setContactos(JSON.parse(localStorage.getItem(K.c)||'null')||demoC);setUsuarios(JSON.parse(localStorage.getItem(K.u)||'null')||demoUsers);setSesion(JSON.parse(localStorage.getItem(K.s)||'null'));},[]);
  useEffect(()=>localStorage.setItem(K.c,JSON.stringify(contactos)),[contactos]); useEffect(()=>localStorage.setItem(K.u,JSON.stringify(usuarios)),[usuarios]); useEffect(()=>sesion?localStorage.setItem(K.s,JSON.stringify(sesion)):localStorage.removeItem(K.s),[sesion]);

  const comerciales=usuarios.filter(u=>u.rol==='comercial');
  const visibles=useMemo(()=>contactos.filter(c=>{
    if(sesion?.rol==='comercial' && c.comercialAsignado!==sesion.nombre) return false;
    if(f.estado!=='Todos'&&c.estado!==f.estado) return false; if(f.comercial!=='Todos'&&(c.comercialAsignado??'Sin asignar')!==f.comercial) return false;
    return `${c.nombre} ${c.email} ${c.telefono}`.toLowerCase().includes(f.q.toLowerCase());
  }),[contactos,sesion,f]);

  const doLogin=(e:any)=>{e.preventDefault(); const u=usuarios.find(x=>x.username===login.u&&x.password===login.p&&x.activo); if(!u)return setLogin(p=>({...p,e:'Credenciales incorrectas o usuario inactivo'})); setSesion({username:u.username,rol:u.rol,nombre:u.nombre});};
  const upC=(id:string,chg:Partial<Contacto>)=>setContactos(p=>p.map(c=>c.id===id?{...c,...chg}:c));
  const exportCSV=()=>{const h=['nombre','email','telefono','inversion','estado','comercialAsignado','proximaLlamada','visita','vecesLlamado'];const rows=contactos.map(c=>h.map(k=>String((c as any)[k]??'')));const csv=[h.join(','),...rows.map(r=>r.map(v=>`"${v.replaceAll('"','""')}"`).join(','))].join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='contactos.csv';a.click();};
  const importCSV=(file:File)=>{file.text().then(t=>{const l=t.trim().split('\n');const h=l[0].split(',').map(x=>x.replaceAll('"',''));const idx=(k:string)=>h.indexOf(k);const data=l.slice(1).map((r,i)=>{const c=r.match(/(".*?"|[^,]+)/g)||[];const g=(k:string)=>((c[idx(k)]||'').replaceAll('"','').trim());return{id:crypto.randomUUID(),nombre:g('nombre'),email:g('email'),telefono:g('telefono'),inversion:Number(g('inversion')||0),estado:(g('estado')==='Activo'?'Activo':'Pendiente') as Estado,comercialAsignado:g('comercialAsignado')||null,proximaLlamada:g('proximaLlamada')||null,visita:g('visita')||null,vecesLlamado:Number(g('vecesLlamado')||0)} as Contacto;});setContactos(data);});};

  if(!sesion) return <div className='min-h-screen bg-slate-100 p-8'><div className='max-w-md mx-auto bg-white p-6 rounded-xl'><h1 className='text-2xl font-bold mb-3'>Acceso agentes</h1><form onSubmit={doLogin} className='space-y-2'><input className='w-full border p-2 rounded' placeholder='usuario' value={login.u} onChange={e=>setLogin({...login,u:e.target.value,e:''})}/><input className='w-full border p-2 rounded' type='password' placeholder='contraseña' value={login.p} onChange={e=>setLogin({...login,p:e.target.value,e:''})}/>{login.e&&<p className='text-red-600 text-sm'>{login.e}</p>}<button className='bg-blue-600 text-white px-3 py-2 rounded'>Entrar</button></form></div></div>

  return <div className='min-h-screen bg-slate-100 p-4 space-y-4'>
    <div className='bg-white rounded-xl p-4 flex justify-between'><div><h1 className='text-2xl font-bold'>FinanzaPro Simple</h1><p>{sesion.nombre} ({sesion.rol})</p></div><button onClick={()=>setSesion(null)} className='bg-slate-200 px-3 py-2 rounded'>Cerrar sesión</button></div>
    <div className='bg-white rounded-xl p-4 flex flex-wrap gap-2'>
      <input className='border p-2 rounded' placeholder='buscar' value={f.q} onChange={e=>setF({...f,q:e.target.value})}/>
      <select className='border p-2 rounded' value={f.estado} onChange={e=>setF({...f,estado:e.target.value})}><option>Todos</option><option>Pendiente</option><option>Activo</option></select>
      <select className='border p-2 rounded' value={f.comercial} onChange={e=>setF({...f,comercial:e.target.value})}><option>Todos</option><option>Sin asignar</option>{comerciales.map(c=><option key={c.nombre}>{c.nombre}</option>)}</select>
      <button onClick={()=>setVista('tabla')} className='border px-2 rounded'>Filas</button><button onClick={()=>setVista('kanban')} className='border px-2 rounded'>Lineas/Kanban</button><button onClick={()=>setVista('calendario')} className='border px-2 rounded'>Calendario</button>
      {sesion.rol==='administrador' && <><button onClick={exportCSV} className='bg-blue-600 text-white px-2 rounded'>Exportar Excel (CSV)</button><label className='bg-slate-200 px-2 rounded cursor-pointer'>Importar Excel (CSV)<input hidden type='file' accept='.csv' onChange={e=>e.target.files&&importCSV(e.target.files[0])}/></label></>}
    </div>

    {vista==='tabla' && <div className='bg-white rounded-xl p-4 overflow-auto'><table className='min-w-[1000px] w-full'><thead><tr>{['Cliente','Email','Tel','Inv','Estado','Comercial','Llamada','Visita','#','Acción'].map(h=><th key={h} className='text-left p-2'>{h}</th>)}</tr></thead><tbody>{visibles.map(c=><tr key={c.id} className='border-t'><td className='p-2'>{c.nombre}</td><td>{c.email}</td><td>{c.telefono}</td><td>{eur(c.inversion)}</td><td>{c.estado}</td><td>{sesion.rol==='administrador'?<select value={c.comercialAsignado??'Sin asignar'} onChange={e=>upC(c.id,{comercialAsignado:e.target.value==='Sin asignar'?null:e.target.value})}><option>Sin asignar</option>{comerciales.map(x=><option key={x.nombre}>{x.nombre}</option>)}</select>:c.comercialAsignado}</td><td><input type='datetime-local' value={c.proximaLlamada?new Date(c.proximaLlamada).toISOString().slice(0,16):''} onChange={e=>upC(c.id,{proximaLlamada:e.target.value?new Date(e.target.value).toISOString():null})}/></td><td><input type='datetime-local' value={c.visita?new Date(c.visita).toISOString().slice(0,16):''} onChange={e=>upC(c.id,{visita:e.target.value?new Date(e.target.value).toISOString():null})}/></td><td>{c.vecesLlamado}</td><td className='space-x-1'><button onClick={()=>upC(c.id,{vecesLlamado:c.vecesLlamado+1})} className='bg-blue-600 text-white px-1 rounded'>Llamada</button><button onClick={()=>upC(c.id,{estado:c.estado==='Activo'?'Pendiente':'Activo'})} className='bg-emerald-600 text-white px-1 rounded'>Alta/Baja</button></td></tr>)}</tbody></table></div>}

    {vista==='kanban' && <div className='grid md:grid-cols-2 gap-3'>{['Pendiente','Activo'].map(col=><div key={col} className='bg-white rounded-xl p-3'><h3 className='font-bold mb-2'>{col}</h3>{visibles.filter(c=>c.estado===col).map(c=><div key={c.id} className='border rounded p-2 mb-2'><p className='font-semibold'>{c.nombre}</p><p className='text-sm'>{c.comercialAsignado??'Sin asignar'} · {eur(c.inversion)}</p></div>)}</div>)}</div>}
    {vista==='calendario' && <div className='bg-white rounded-xl p-4'><h3 className='font-bold mb-2'>Calendario de llamadas/visitas</h3>{visibles.sort((a,b)=>(a.proximaLlamada||a.visita||'').localeCompare(b.proximaLlamada||b.visita||'')).map(c=><div key={c.id} className='border-b py-2'><b>{c.nombre}</b> · Comercial: {c.comercialAsignado??'Sin asignar'} · Llamada: {fmt(c.proximaLlamada)} · Visita: {fmt(c.visita)}</div>)}</div>}

    {sesion.rol==='administrador' && <div className='bg-white rounded-xl p-4'><h2 className='font-bold mb-2'>Gestión de comerciales (altas/bajas y contraseñas)</h2>{comerciales.map(u=><div key={u.username} className='flex flex-wrap gap-2 items-center border-b py-2'><span className='w-32'>{u.nombre}</span><button onClick={()=>setUsuarios(p=>p.map(x=>x.username===u.username?{...x,activo:!x.activo}:x))} className='px-2 py-1 rounded bg-slate-200'>{u.activo?'Activo':'Inactivo'}</button><input className='border p-1 rounded' placeholder='nueva contraseña' onBlur={e=>e.target.value&&setUsuarios(p=>p.map(x=>x.username===u.username?{...x,password:e.target.value}:x))}/></div>)}</div>}
  </div>
}
