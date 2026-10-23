// PEGÁ AQUÍ TU URL DE GOOGLE APPS SCRIPT
const ENDPOINT_URL = "https://script.google.com/macros/s/AKfycbwDxZfmA9Ahja5BVmsy7Pwanm8e-eEnX7tsLjBsuJ3UlsPaJv70jiBt55ec6pguTnuqKA/exec";

const form = document.getElementById('f');
const btn = document.getElementById('btn');
const msg = document.getElementById('msg');

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

  try {
    await fetch(ENDPOINT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain'
      },
      body: JSON.stringify({ cedula, telefono, factura, total })
    });

    document.getElementById('formWrap').style.display = 'none';
    document.getElementById('done').classList.add('show');
    
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

  } catch (err) {
    msg.className = 'show error';
    msg.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Error de conexión. Intentá de nuevo.';
    btn.disabled = false;
    btn.innerHTML = '<span>Validar y Guardar</span> <i class="fa-solid fa-paper-plane"></i>';
  }
});
