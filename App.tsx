import React, { useMemo, useState } from 'react';

type Result = {
  subtotal: number;
  ivaAmount: number;
  total: number;
};

const eur = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
});

const App: React.FC = () => {
  const [concepto, setConcepto] = useState('');
  const [cantidad, setCantidad] = useState('1');
  const [precio, setPrecio] = useState('0');
  const [iva, setIva] = useState('21');
  const [error, setError] = useState('');
  const [result, setResult] = useState<Result>({ subtotal: 0, ivaAmount: 0, total: 0 });
  const [conceptoFinal, setConceptoFinal] = useState('—');

  const isValid = useMemo(() => {
    const q = Number(cantidad);
    const p = Number(precio);
    const t = Number(iva);
    return concepto.trim() && q > 0 && p >= 0 && t >= 0 && ![q, p, t].some(Number.isNaN);
  }, [concepto, cantidad, precio, iva]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) {
      setError('Revisa los campos: concepto obligatorio y valores numéricos válidos no negativos.');
      return;
    }

    const q = Number(cantidad);
    const p = Number(precio);
    const t = Number(iva);
    const subtotal = q * p;
    const ivaAmount = subtotal * (t / 100);
    const total = subtotal + ivaAmount;

    setConceptoFinal(concepto.trim());
    setResult({ subtotal, ivaAmount, total });
    setError('');
  };

  const clearForm = () => {
    setConcepto('');
    setCantidad('1');
    setPrecio('0');
    setIva('21');
    setConceptoFinal('—');
    setResult({ subtotal: 0, ivaAmount: 0, total: 0 });
    setError('');
  };

  return (
    <main className="container">
      <section className="card">
        <h1>Calculadora de Presupuesto</h1>
        <p className="instructions">
          Introduce concepto, cantidad, precio unitario e IVA y pulsa <strong>Calcular</strong>.
        </p>

        <form id="budgetForm" onSubmit={onSubmit} noValidate>
          <div className="grid">
            <label>
              Concepto
              <input value={concepto} onChange={(e) => setConcepto(e.target.value)} type="text" required />
            </label>

            <label>
              Cantidad
              <input value={cantidad} onChange={(e) => setCantidad(e.target.value)} type="number" min="1" step="1" required />
            </label>

            <label>
              Precio unitario (€)
              <input value={precio} onChange={(e) => setPrecio(e.target.value)} type="number" min="0" step="0.01" required />
            </label>

            <label>
              IVA (%)
              <input value={iva} onChange={(e) => setIva(e.target.value)} type="number" min="0" step="0.01" required />
            </label>
          </div>

          <p className="error" aria-live="polite">{error}</p>

          <div className="actions">
            <button type="submit">Calcular</button>
            <button type="button" className="secondary" onClick={clearForm}>Limpiar</button>
          </div>
        </form>

        <section className="results" aria-live="polite">
          <h2>Resumen</h2>
          <p><span>Concepto:</span> <strong>{conceptoFinal}</strong></p>
          <p><span>Subtotal:</span> <strong>{eur.format(result.subtotal)}</strong></p>
          <p><span>IVA:</span> <strong>{eur.format(result.ivaAmount)}</strong></p>
          <p className="total"><span>Total:</span> <strong>{eur.format(result.total)}</strong></p>
        </section>
      </section>
    </main>
  );
};

export default App;
