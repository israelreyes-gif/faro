import { api, setToken, setSession } from './api.js';
import { mostrarToast } from './toast.js';

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
      mostrarToast('error', 'No se pudo iniciar sesión', 'El acceso no es correcto. El faro no puede iluminarte.');
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
