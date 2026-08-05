import { api } from './api.js';

let categoriaActual = 'historia';
let temporizador = null;

export function initEscritura() {
  document.querySelectorAll('.cat-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      categoriaActual = pill.dataset.cat;
    });
  });

  document.getElementById('write-submit').addEventListener('click', enviarMensaje);
}

export function iniciarCuentaAtras(segundosRestantes, onExpirar) {
  clearInterval(temporizador);
  const el = document.getElementById('write-timer');

  const tick = () => {
    if (segundosRestantes <= 0) {
      clearInterval(temporizador);
      onExpirar();
      return;
    }
    const h = Math.floor(segundosRestantes / 3600);
    const m = Math.floor((segundosRestantes % 3600) / 60);
    const s = segundosRestantes % 60;
    el.textContent = `⏱ ${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    segundosRestantes--;
  };

  tick();
  temporizador = setInterval(tick, 1000);
}

async function enviarMensaje() {
  const texto = document.getElementById('write-text').value.trim();
  const errorEl = document.getElementById('write-error');
  errorEl.style.display = 'none';

  if (!texto) {
    errorEl.textContent = 'Escribe algo antes de encender el faro.';
    errorEl.style.display = 'block';
    return;
  }

  try {
    clearInterval(temporizador);
    await api.enviarMensaje({ categoria: categoriaActual, texto });
    document.dispatchEvent(new CustomEvent('faro:mensaje-enviado'));
  } catch (err) {
    errorEl.textContent = err.message || 'No se pudo enviar el mensaje.';
    errorEl.style.display = 'block';
  }
}

export function pintarMensajeDifundido(mensaje) {
  document.getElementById('msg-name').textContent = mensaje.nombre;
  document.getElementById('msg-role').textContent = `${mensaje.familia} · escrito esta noche`;
  document.getElementById('msg-cat').textContent = mensaje.categoria.toUpperCase();
  document.getElementById('msg-text').textContent = mensaje.texto;
}
