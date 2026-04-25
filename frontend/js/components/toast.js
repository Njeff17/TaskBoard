/**
 * Toast notifications using Bootstrap 5 Toast API.
 * `bootstrap` is available as a global from the CDN bundle script.
 */

const ICONS = { success: '✓', error: '✕', info: 'ℹ' };
const BG    = { success: 'bg-success', error: 'bg-danger', info: 'bg-primary' };

const getContainer = () => {
  let c = document.getElementById('toast-container');
  if (!c) {
    c = document.createElement('div');
    c.id = 'toast-container';
    c.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    c.style.zIndex = '9999';
    document.body.appendChild(c);
  }
  return c;
};

/**
 * @param {string} message
 * @param {'success'|'error'|'info'} [type='info']
 */
export const showToast = (message, type = 'info') => {
  const icon = ICONS[type] ?? ICONS.info;
  const bg   = BG[type]   ?? BG.info;

  const el = document.createElement('div');
  el.className = `toast align-items-center text-white ${bg} border-0`;
  el.setAttribute('role', 'alert');
  el.setAttribute('aria-live', 'assertive');
  el.innerHTML = `
    <div class="d-flex">
      <div class="toast-body fw-semibold">${icon}&nbsp; ${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto"
              data-bs-dismiss="toast" aria-label="Close"></button>
    </div>`;

  getContainer().appendChild(el);

  const toast = new bootstrap.Toast(el, { delay: 3500 });
  toast.show();
  el.addEventListener('hidden.bs.toast', () => el.remove());
};
