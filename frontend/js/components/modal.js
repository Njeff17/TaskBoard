// Modal component using Bootstrap 5 Modal API.
export const closeModal = () => {
  const el = document.getElementById('appModal');
  if (el) bootstrap.Modal.getInstance(el)?.hide();
};


export const openModal = ({
  title,
  body,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  dangerous = false,
}) => {
  const el = document.getElementById('appModal');
  if (!el) { console.error('#appModal element not found'); return; }

  // Set content
  el.querySelector('#modal-title').textContent = title;

  const bodyEl = el.querySelector('#modal-body');
  if (typeof body === 'string') {
    bodyEl.innerHTML = body;
  } else {
    bodyEl.innerHTML = '';
    bodyEl.appendChild(body);
  }

  // Configure buttons
  const cancelBtn = el.querySelector('#modal-cancel');
  const confirmBtn = el.querySelector('#modal-confirm');

  cancelBtn.textContent = cancelText;
  confirmBtn.textContent = confirmText;
  confirmBtn.className = `btn ${dangerous ? 'btn-danger' : 'btn-primary'}`;

  // Replace confirm button to clear old listeners
  const freshConfirm = confirmBtn.cloneNode(true);
  confirmBtn.replaceWith(freshConfirm);

  if (onConfirm) {
    freshConfirm.addEventListener('click', async () => {
      freshConfirm.disabled = true;
      freshConfirm.innerHTML =
        '<span class="spinner-border spinner-border-sm me-1" role="status"></span>Working…';
      try {
        await onConfirm(el);
      } catch (_err) {
        // onConfirm is responsible for showing the error in the modal body.
        // We just reset the button so the user can try again.
      } finally {
        if (document.contains(freshConfirm)) {
          freshConfirm.disabled = false;
          freshConfirm.textContent = confirmText;
          freshConfirm.className = `btn ${dangerous ? 'btn-danger' : 'btn-primary'}`;
        }
      }
    });
  }

  // Show via Bootstrap API
  const instance = bootstrap.Modal.getOrCreateInstance(el);
  instance.show();

  // Auto-focus first input
  el.addEventListener('shown.bs.modal', () => {
    bodyEl.querySelector('input, textarea, select')?.focus();
  }, { once: true });
};
