const form = document.getElementById('budgetForm');
const clearBtn = document.getElementById('clearBtn');
const errorEl = document.getElementById('error');

const rConcepto = document.getElementById('rConcepto');
const rSubtotal = document.getElementById('rSubtotal');
const rIva = document.getElementById('rIva');
const rTotal = document.getElementById('rTotal');

const toMoney = (value) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);

form.addEventListener('submit', (e) => {
  e.preventDefault();
  errorEl.textContent = '';

  const concepto = document.getElementById('concepto').value.trim();
  const cantidad = Number(document.getElementById('cantidad').value);
  const precio = Number(document.getElementById('precio').value);
  const iva = Number(document.getElementById('iva').value);

  if (!concepto) {
    errorEl.textContent = 'El concepto es obligatorio.';
    return;
  }

  if (cantidad <= 0 || precio < 0 || iva < 0 || [cantidad, precio, iva].some(Number.isNaN)) {
    errorEl.textContent = 'Revisa los valores numéricos: deben ser válidos y no negativos.';
    return;
  }

  const subtotal = cantidad * precio;
  const ivaValue = subtotal * (iva / 100);
  const total = subtotal + ivaValue;

  rConcepto.textContent = concepto;
  rSubtotal.textContent = toMoney(subtotal);
  rIva.textContent = toMoney(ivaValue);
  rTotal.textContent = toMoney(total);
});

clearBtn.addEventListener('click', () => {
  form.reset();
  errorEl.textContent = '';
  rConcepto.textContent = '—';
  rSubtotal.textContent = toMoney(0);
  rIva.textContent = toMoney(0);
  rTotal.textContent = toMoney(0);
});
