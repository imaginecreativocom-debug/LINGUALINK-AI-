import React, { useMemo, useState } from 'react';

type Gasto = {
  id: number;
  nombre: string;
  monto: number;
  categoria: string;
};

const CATEGORIAS = ['Vivienda', 'Comida', 'Transporte', 'Servicios', 'Entretenimiento', 'Otros'];

const formatoMoneda = (valor: number) =>
  new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(valor);

const App: React.FC = () => {
  const [presupuestoTotal, setPresupuestoTotal] = useState<number>(2500);
  const [nombreGasto, setNombreGasto] = useState('');
  const [montoGasto, setMontoGasto] = useState('');
  const [categoria, setCategoria] = useState(CATEGORIAS[0]);
  const [gastos, setGastos] = useState<Gasto[]>([]);

  const totalGastado = useMemo(
    () => gastos.reduce((suma, gasto) => suma + gasto.monto, 0),
    [gastos],
  );
  const disponible = presupuestoTotal - totalGastado;
  const porcentajeUsado = presupuestoTotal > 0 ? Math.min((totalGastado / presupuestoTotal) * 100, 100) : 0;

  const agregarGasto = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const monto = Number(montoGasto);
    if (!nombreGasto.trim() || Number.isNaN(monto) || monto <= 0) {
      return;
    }

    const nuevoGasto: Gasto = {
      id: Date.now(),
      nombre: nombreGasto.trim(),
      monto,
      categoria,
    };

    setGastos((actuales) => [nuevoGasto, ...actuales]);
    setNombreGasto('');
    setMontoGasto('');
    setCategoria(CATEGORIAS[0]);
  };

  const eliminarGasto = (id: number) => {
    setGastos((actuales) => actuales.filter((gasto) => gasto.id !== id));
  };

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900 py-10 px-4">
      <section className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg border border-slate-200 p-6 md:p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-sky-700">Calculadora de presupuesto</h1>
          <p className="text-slate-600 mt-2">Registra tus gastos y controla cuánto dinero te queda disponible.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <label className="md:col-span-1">
            <span className="block text-sm font-medium text-slate-700 mb-1">Presupuesto total</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={presupuestoTotal}
              onChange={(e) => setPresupuestoTotal(Number(e.target.value) || 0)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </label>

          <article className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <h2 className="text-sm text-slate-600">Gastado</h2>
            <p className="text-xl font-semibold text-rose-600">{formatoMoneda(totalGastado)}</p>
          </article>

          <article className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <h2 className="text-sm text-slate-600">Disponible</h2>
            <p className={`text-xl font-semibold ${disponible < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {formatoMoneda(disponible)}
            </p>
          </article>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-slate-600">Uso del presupuesto</span>
            <span className="font-medium text-slate-800">{porcentajeUsado.toFixed(1)}%</span>
          </div>
          <div className="h-3 rounded-full bg-slate-200 overflow-hidden">
            <div
              className={`h-full transition-all ${disponible < 0 ? 'bg-rose-500' : 'bg-sky-600'}`}
              style={{ width: `${porcentajeUsado}%` }}
            />
          </div>
        </div>

        <form onSubmit={agregarGasto} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-8">
          <input
            type="text"
            placeholder="Nombre del gasto"
            value={nombreGasto}
            onChange={(e) => setNombreGasto(e.target.value)}
            className="md:col-span-2 rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
            required
          />
          <input
            type="number"
            min="0.01"
            step="0.01"
            placeholder="Monto"
            value={montoGasto}
            onChange={(e) => setMontoGasto(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
            required
          />
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            {CATEGORIAS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="md:col-span-4 rounded-lg bg-sky-600 text-white font-medium py-2.5 hover:bg-sky-500 transition-colors"
          >
            Agregar gasto
          </button>
        </form>

        <section>
          <h2 className="text-xl font-semibold mb-3">Lista de gastos</h2>
          {gastos.length === 0 ? (
            <p className="text-slate-500">Aún no hay gastos registrados.</p>
          ) : (
            <ul className="space-y-2">
              {gastos.map((gasto) => (
                <li
                  key={gasto.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-lg border border-slate-200 px-4 py-3"
                >
                  <div>
                    <p className="font-medium">{gasto.nombre}</p>
                    <p className="text-sm text-slate-500">{gasto.categoria}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{formatoMoneda(gasto.monto)}</span>
                    <button
                      onClick={() => eliminarGasto(gasto.id)}
                      className="rounded-md border border-rose-200 px-2 py-1 text-rose-600 hover:bg-rose-50"
                      type="button"
                    >
                      Eliminar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>
    </main>
  );
};

export default App;
