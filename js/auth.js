import { api, setToken, setSession } from './api.js';

export function initAuthForms(onLoggedIn) {
  const loginBtn = document.getElementById('login-submit');
  const loginError = document.getElementById('login-error');

  loginBtn.addEventListener('click', async () => {
    const username = document.getElementById('login-user').value.trim();
    const password = document.getElementById('login-pass').value;
    loginError.style.display = 'none';

    if (!username || !password) {
      loginError.textContent = 'Escribe tu usuario y tu contraseña.';
      loginError.style.display = 'block';
      return;
    }

    try {
      const { token, user } = await api.login({ username, password });
      setToken(token);
      setSession(user);
      onLoggedIn(user);
    } catch (err) {
      loginError.textContent = 'El acceso no es correcto. El faro no puede iluminarte.';
      loginError.style.display = 'block';
    }
  });

  const regBtn = document.getElementById('register-submit');
  const regError = document.getElementById('register-error');
  const regSuccess = document.getElementById('register-success');

  regBtn.addEventListener('click', async () => {
    const payload = {
      username: document.getElementById('reg-user').value.trim(),
      password: document.getElementById('reg-pass').value,
      password2: document.getElementById('reg-pass2').value,
      nombre: document.getElementById('reg-name').value.trim(),
      familia: document.getElementById('reg-family').value.trim()
    };
    regError.style.display = 'none';
    regSuccess.style.display = 'none';

    if (!payload.username || !payload.password || !payload.nombre) {
      regError.textContent = 'Rellena al menos usuario, contraseña y nombre.';
      regError.style.display = 'block';
      return;
    }
    if (payload.password !== payload.password2) {
      regError.textContent = 'Las contraseñas no coinciden.';
      regError.style.display = 'block';
      return;
    }

    try {
      await api.register(payload);
      regSuccess.style.display = 'block';
      regSuccess.textContent = 'Ya formas parte del faro. Espera a que anochezca.';
    } catch (err) {
      regError.textContent = err.status === 409
        ? 'Ese usuario ya existe en el faro.'
        : (err.message || 'No se pudo completar el registro.');
      regError.style.display = 'block';
    }
  });
}
