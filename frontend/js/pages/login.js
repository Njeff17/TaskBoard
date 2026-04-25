import { redirectIfAuthenticated } from '../components/navbar.js';
import { login }                   from '../services/auth.service.js';

redirectIfAuthenticated();

const form      = document.getElementById('login-form');
const errorBox  = document.getElementById('auth-error');
const submitBtn = document.getElementById('submit-btn');

const showError = (msg) => { errorBox.textContent = msg; errorBox.classList.remove('d-none'); };
const hideError = ()    => errorBox.classList.add('d-none');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideError();

  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!email || !password) return showError('Please fill in all fields.');

  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1" role="status"></span>Logging in…';

  try {
    await login({ email, password });
    window.location.href = '/pages/projects.html';
  } catch (err) {
    showError(err.message || 'Login failed. Please try again.');
    submitBtn.disabled   = false;
    submitBtn.textContent = 'Log In';
  }
});
