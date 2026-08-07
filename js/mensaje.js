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
  const fill = document.getElementById('write-progress-fill');
  const label = document.getElementById('write-progress-label');
  const segundosTotal = Math.max(segundosRestantes, 1);

  const tick = () => {
    if (segundosRestantes <= 0) {
      clearInterval(temporizador);
      onExpirar();
      return;
    }

    const porcentaje = Math.max(0, Math.min(100, (segundosRestantes / segundosTotal) * 100));
    fill.style.width = porcentaje + '%';
    label.textContent = textoRestante(segundosRestantes);

    segundosRestantes--;
  };

  tick();
  temporizador = setInterval(tick, 1000);
}

function textoRestante(segundos) {
  const minutos = Math.ceil(segundos / 60);
  if (minutos >= 60) return 'queda 1 hora';
  if (minutos <= 1) return 'queda menos de 1 minuto';
  return `quedan ${minutos} minutos`;
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
  document.getElementById('msg-cat').textContent = mensaje.categoria.toUpperCase();
  document.getElementById('msg-text').textContent = mensaje.texto;
}
