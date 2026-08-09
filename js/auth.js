import { api, setToken, setSession } from './api.js';
import { mostrarToast } from './toast.js';

let temporizadorBloqueo = null;

export function initAuthForms(onLoggedIn) {
  const loginBtn = document.getElementById('login-submit');

  loginBtn.addEventListener('click', async () => {
    const username = document.getElementById('login-user').value.trim();
    const password = document.getElementById('login-pass').value;

    if (!username || !password) {
      mostrarToast('error', 'Faltan datos', 'Escribe tu usuario y tu contraseña.');
      return;
    }

    try {
      const { token, user } = await api.login({ username, password });
      setToken(token);
      setSession(user);
      onLoggedIn(user);
    } catch (err) {
      if (err.locked) {
        iniciarBloqueo(err.segundosRestantes ?? 900);
        return;
      }

      if (err.intentosRestantes === 1) {
        mostrarToast('error', '¡Atención!', 'Un fallo más y se bloqueará 15 minutos.');
      } else if (typeof err.intentosRestantes === 'number') {
        mostrarToast('error', 'No se pudo iniciar sesión', `Te quedan ${err.intentosRestantes} intentos.`);
      } else {
        mostrarToast('error', 'No se pudo iniciar sesión', 'El acceso no es correcto.');
      }
    }
  });

  const regBtn = document.getElementById('register-submit');

  regBtn.addEventListener('click', async () => {
    const payload = {
      username: document.getElementById('reg-user').value.trim(),
      password: document.getElementById('reg-pass').value,
      password2: document.getElementById('reg-pass2').value,
      nombre: document.getElementById('reg-name').value.trim(),
      fechaNacimiento: document.getElementById('reg-birthdate').value || null
    };

    if (!payload.username || !payload.password || !payload.nombre) {
      mostrarToast('error', 'Faltan datos', 'Rellena al menos usuario, contraseña y nombre.');
      return;
    }
    if (payload.password !== payload.password2) {
      mostrarToast('error', 'Las contraseñas no coinciden', 'Revisa que las dos contraseñas sean iguales.');
      return;
    }

    try {
      await api.register(payload);
      mostrarToast('success', 'Cuenta creada', 'Ya formas parte del faro. Espera a que anochezca.');
    } catch (err) {
      const mensaje = err.status === 409
        ? 'Ese usuario ya existe en el faro.'
        : (err.message || 'No se pudo completar el registro.');
      mostrarToast('error', 'No se pudo completar el registro', mensaje);
    }
  });
}

function iniciarBloqueo(segundosRestantes) {
  clearInterval(temporizadorBloqueo);

  const boton = document.getElementById('login-submit');
  const bloque = document.getElementById('login-bloqueo');
  const fill = document.getElementById('login-bloqueo-fill');
  const label = document.getElementById('login-bloqueo-label');
  const segundosTotal = Math.max(segundosRestantes, 1);

  boton.disabled = true;
  boton.style.opacity = '0.4';
  bloque.style.display = 'block';

  const tick = () => {
    if (segundosRestantes <= 0) {
      clearInterval(temporizadorBloqueo);
      boton.disabled = false;
      boton.style.opacity = '1';
      bloque.style.display = 'none';
      return;
    }

    const porcentaje = Math.max(0, Math.min(100, (segundosRestantes / segundosTotal) * 100));
    fill.style.width = porcentaje + '%';

    const minutos = Math.ceil(segundosRestantes / 60);
    label.textContent = minutos <= 1
      ? 'bloqueado, casi listo...'
      : `bloqueado, vuelve a intentarlo en ${minutos} minutos`;

    segundosRestantes--;
  };

  tick();
  temporizadorBloqueo = setInterval(tick, 1000);
}
