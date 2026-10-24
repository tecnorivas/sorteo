// PEGÁ AQUÍ TU NUEVO LINK DE GOOGLE APPS SCRIPT
const ENDPOINT_URL = "https://script.google.com/macros/s/AKfycbz2k6S2yS0Gdib1aAXXXFJJMDRWY4r2Uyuk8xFv5OIge0mqGKVTSW4z5_QV8Y6wj9eT/exec";

const form = document.getElementById('f');
const btn = document.getElementById('btn');
const msg = document.getElementById('msg');

window.addEventListener('load', () => sincronizarPendientes());
window.addEventListener('online', () => sincronizarPendientes());

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  msg.className = ''; 
  msg.textContent = '';

  const cedula = document.getElementById('ced').value.trim();
  const telefono = document.getElementById('tel').value.trim();
  const factura = document.getElementById('fac').value.trim();
  const total = parseFloat(document.getElementById('tot').value.trim());

  if (isNaN(total) || total < 1500) {
    msg.className = 'show error';
    msg.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> El total debe ser de al menos C$ 1,500.00 para participar.';
    return;
  }

  btn.disabled = true;
  btn.innerHTML = '<span>Procesando...</span> <i class="fa-solid fa-spinner fa-spin"></i>';

  const datosFactura = { cedula, telefono, factura, total };

  if (!navigator.onLine) {
    guardarLocalmente(datosFactura);
    mostrarExito();
    return;
  }

  try {
    const urlFinal = `${ENDPOINT_URL}?cedula=${encodeURIComponent(cedula)}&telefono=${encodeURIComponent(telefono)}&factura=${encodeURIComponent(factura)}&total=${encodeURIComponent(total)}`;

    await fetch(urlFinal, {
      method: 'GET',
      mode: 'no-cors'
    });

    mostrarExito();

  } catch (err) {
    guardarLocalmente(datosFactura);
    mostrarExito();
  }
});

function guardarLocalmente(datos) {
  let pendientes = JSON.parse(localStorage.getItem('facturas_pendientes')) || [];
  pendientes.push(datos);
  localStorage.setItem('facturas_pendientes', JSON.stringify(pendientes));
}

async function sincronizarPendientes() {
  if (!navigator.onLine) return;
  
  let pendientes = JSON.parse(localStorage.getItem('facturas_pendientes')) || [];
  if (pendientes.length === 0) return;

  let nuevasPendientes = [];

  for (let datos of pendientes) {
    try {
      const urlFinal = `${ENDPOINT_URL}?cedula=${encodeURIComponent(datos.cedula)}&telefono=${encodeURIComponent(datos.telefono)}&factura=${encodeURIComponent(datos.factura)}&total=${encodeURIComponent(datos.total)}`;
      
      await fetch(urlFinal, {
        method: 'GET',
        mode: 'no-cors'
      });
    } catch (e) {
      nuevasPendientes.push(datos);
    }
  }

  localStorage.setItem('facturas_pendientes', JSON.stringify(nuevasPendientes));
}

function mostrarExito() {
  document.getElementById('formWrap').style.display = 'none';
  document.getElementById('done').classList.add('show');
  
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 }
    });
  }
}
