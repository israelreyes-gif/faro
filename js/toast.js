const ICONOS = { success: '✓', error: '⚠' };

export function mostrarToast(tipo, titulo, sub, duracion = 2800) {
  const wrap = document.getElementById('toast-wrap');
  if (!wrap) return;

  const icono = ICONOS[tipo] || ICONOS.success;

  const toast = document.createElement('div');
  toast.className = `toast ${tipo}`;
  toast.innerHTML = `
    <div class="toast-icon">${icono}</div>
    <div class="toast-body">
      <div class="toast-title">${titulo}</div>
      ${sub ? `<div class="toast-sub">${sub}</div>` : ''}
    </div>
  `;
  wrap.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('saliendo');
    setTimeout(() => toast.remove(), 300);
  }, duracion);
}
