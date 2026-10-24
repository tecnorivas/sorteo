// PEGÁ AQUÍ TU URL DE GOOGLE APPS SCRIPT
const ENDPOINT_URL = "PEGAR_AQUI_TU_LINK_DE_APPS_SCRIPT";

// CONTROL DE VIDEO / BANNER INTEGRADO
const introVideo = document.getElementById('introVideo');
const bannerFallback = document.getElementById('bannerFallback');

function mostrarBanner() {
  if (introVideo) introVideo.style.display = 'none';
  if (bannerFallback) bannerFallback.classList.remove('hidden');
}

if (introVideo) {
  introVideo.addEventListener('ended', mostrarBanner);
  introVideo.addEventListener('error', mostrarBanner);

  // Intentar reproducir de forma segura
  const playPromise = introVideo.play();
  if (playPromise !== undefined) {
    playPromise.catch(() => {
      mostrarBanner();
    });
  }

  // Respaldo por si el navegador bloquea el video de inicio
  setTimeout(() => {
    if (introVideo.paused && bannerFallback.classList.contains('hidden')) {
      mostrarBanner();
    }
  }, 1500);
}

// MANEJO DEL FORMULARIO Y ENVÍO A GOOGLE SHEETS
const form = document.getElementById('f');
const btn = document.getElementById('btn');
const msg = document.getElementById('msg');

window.addEventListener('load', () => sincronizarPendientes());
window.addEventListener('online', () => sincronizarPendientes());

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (msg) {
      msg.className = ''; 
      msg.textContent = '';
    }

    const cedula = document.getElementById('ced').value.trim();
    const telefono = document.getElementById('tel').value.trim();
    const factura = document.getElementById('fac').value.trim();
    const total = parseFloat(document.getElementById('tot').value.trim());

    if (isNaN(total) || total < 1500) {
      if (msg) {
        msg.className = 'show error';
        msg.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> El total debe ser de al menos C$ 1,500.00 para participar.';
      }
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

    enviarViaFormularioOculto(datosFactura);
  });
}

function enviarViaFormularioOculto(datos) {
  try {
    let iframe = document.getElementById('hidden_iframe');
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.name = 'hidden_iframe';
      iframe.id = 'hidden_iframe';
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
    }

    const tempForm = document.createElement('form');
    tempForm.method = 'POST';
    tempForm.action = ENDPOINT_URL;
    tempForm.target = 'hidden_iframe';

    for (const key in datos) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = datos[key];
      tempForm.appendChild(input);
    }

    document.body.appendChild(tempForm);
    tempForm.submit();

    setTimeout(() => {
      document.body.removeChild(tempForm);
      mostrarExito();
    }, 1000);

  } catch (err) {
    guardarLocalmente(datos);
    mostrarExito();
  }
}

function guardarLocalmente(datos) {
  let pendientes = JSON.parse(localStorage.getItem('facturas_pendientes')) || [];
  pendientes.push(datos);
  localStorage.setItem('facturas_pendientes', JSON.stringify(pendientes));
}

function sincronizarPendientes() {
  if (!navigator.onLine) return;
  
  let pendientes = JSON.parse(localStorage.getItem('facturas_pendientes')) || [];
  if (pendientes.length === 0) return;

  pendientes.forEach(datos => {
    enviarViaFormularioOculto(datos);
  });

  localStorage.removeItem('facturas_pendientes');
}

function mostrarExito() {
  const formWrap = document.getElementById('formWrap');
  const done = document.getElementById('done');
  
  if (formWrap) formWrap.style.display = 'none';
  if (done) done.classList.add('show');
  
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 }
    });
  }
}
