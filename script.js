// PEGÁ AQUÍ TU URL DE GOOGLE APPS SCRIPT
const ENDPOINT_URL = "https://script.google.com/macros/s/AKfycbyMeyqzDS-D-Hr4FbtTHFBKtiSTrpgEDa1zfCwhxrSD2DgDno_sE4YJgTgHhuS3ailG/exec";

const form = document.getElementById('f');
const btn = document.getElementById('btn');
const msg = document.getElementById('msg');

// Al cargar la página, intentamos sincronizar si hay facturas guardadas offline
window.addEventListener('load', () => {
  sincronizarPendientes();
});

// También escuchamos cuando el navegador recupera la conexión a internet
window.addEventListener('online', () => {
  sincronizarPendientes();
});

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

  // Verificamos si hay internet
  if (!navigator.onLine) {
    // Si no hay internet, guardamos localmente en el cel/compu
    guardarLocalmente(datosFactura);
    mostrarExito();
    return;
  }

  try {
    const params = new URLSearchParams();
    params.append('cedula', cedula);
    params.append('telefono', telefono);
    params.append('factura', factura);
    params.append('total', total);

    await fetch(ENDPOINT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    mostrarExito();

  } catch (err) {
    // Si falla el envío por red, lo salvamos localmente
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
      const params = new URLSearchParams();
      params.append('cedula', datos.cedula);
      params.append('telefono', datos.telefono);
      params.append('factura', datos.factura);
      params.append('total', datos.total);

      await fetch(ENDPOINT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      });
    } catch (e) {
      // Si vuelve a fallar, lo mantenemos en la lista de espera
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
