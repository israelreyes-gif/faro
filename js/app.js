window.__faroLoaded = true;

import { api, getToken, getSession, clearToken, clearSession } from './api.js';
import { initAuthForms } from './auth.js';
import { iniciarGiroVisual, mostrarResultado } from './dado.js';
import { initEscritura, iniciarCuentaAtras, pintarMensajeDifundido } from './mensaje.js';
import { registrarServiceWorker, pedirPermisoYSuscribir } from './push.js';

const SCREENS = [
  'landing', 'login', 'register', 'install',
  'apagado', 'dado', 'esperando', 'escribiendo', 'sinmensaje', 'mensaje'
];

const POLL_MS = 20000;
let pollTimer = null;
let faseAnterior = null;

export function go(nombre) {
  SCREENS.forEach(s => document.getElementById(`screen-${s}`)?.classList.remove('active'));
  document.getElementById(`screen-${nombre}`)?.classList.add('active');
}

function cerrarSesion() {
  clearInterval(pollTimer);
  clearToken();
  clearSession();
  faseAnterior = null;
  go('landing');
}

function bindBackButtons() {
  document.querySelectorAll('[data-back]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.back === 'logout') cerrarSesion();
      else go(btn.dataset.back);
    });
  });
  document.getElementById('nav-login')?.addEventListener('click', () => go('login'));
  document.getElementById('nav-register')?.addEventListener('click', () => go('register'));
  document.getElementById('nav-install')?.addEventListener('click', () => go('install'));
  window.__faroBindDone = true;
}

function bindInstallTabs() {
  document.getElementById('tab-ios')?.addEventListener('click', () => setInstallTab('ios'));
  document.getElementById('tab-android')?.addEventListener('click', () => setInstallTab('android'));
}

function setInstallTab(which) {
  document.getElementById('tab-ios').classList.toggle('active', which === 'ios');
  document.getElementById('tab-android').classList.toggle('active', which === 'android');
  document.getElementById('install-cap').textContent = which === 'ios'
    ? 'Vídeo: Safari → Compartir → "Añadir a pantalla de inicio"'
    : 'Vídeo: Chrome → Menú ⋮ → "Instalar app"';
}

async function refrescarEstado() {
  const session = getSession();
  if (!session) return;

  try {
    const estado = await api.estado();

    if (estado.fase !== faseAnterior) {
      aplicarFase(estado);
      faseAnterior = estado.fase;
    }
  } catch (err) {
    console.error('No se pudo consultar el estado del faro:', err);
  }
}

function aplicarFase(estado) {
  const session = getSession();

  switch (estado.fase) {
    case 'apagado':
      go('apagado');
      break;

    case 'girando':
      go('dado');
      iniciarGiroVisual(estado.totalUsuarios);
      break;

    case 'elegido': {
      const esGanador = estado.ganador?.id === session.id;
      go('dado');
      mostrarResultado({ esGanador, ganador: estado.ganador, numero: estado.numeroElegido });
      break;
    }

    case 'escribiendo': {
      const esGanador = estado.ganador?.id === session.id;
      if (esGanador) {
        go('escribiendo');
        iniciarCuentaAtras(estado.segundosRestantes ?? 3600, () => {
          faseAnterior = null;
          refrescarEstado();
        });
      } else {
        document.getElementById('esperando-title').textContent =
          `Esta noche, el faro ha iluminado a ${estado.ganador.nombre}.`;
        go('esperando');
      }
      break;
    }

    case 'mensaje':
      pintarMensajeDifundido(estado.mensaje);
      go('mensaje');
      break;

    case 'sin_mensaje':
      go('sinmensaje');
      break;
  }
}

function onLoggedIn() {
  go('apagado');
  faseAnterior = null;
  refrescarEstado();
  clearInterval(pollTimer);
  pollTimer = setInterval(refrescarEstado, POLL_MS);
  pedirPermisoYSuscribir().catch(() => {});
}

function initSesionExistente() {
  if (getToken() && getSession()) {
    onLoggedIn();
  }
}

document.addEventListener('faro:mensaje-enviado', () => {
  faseAnterior = null;
  refrescarEstado();
});

document.addEventListener('DOMContentLoaded', () => {
  registrarServiceWorker();
  bindBackButtons();
  bindInstallTabs();
  initEscritura();
  initAuthForms(onLoggedIn);
  initSesionExistente();
});
