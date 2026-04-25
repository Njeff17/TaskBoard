import { redirectIfAuthenticated } from '../components/navbar.js';
import { register }                from '../services/auth.service.js';

redirectIfAuthenticated();

const form      = document.getElementById('register-form');
const errorBox  = document.getElementById('auth-error');
const submitBtn = document.getElementById('submit-btn');

const showError = (msg) => { errorBox.textContent = msg; errorBox.classList.remove('d-none'); };
const hideError = ()    => errorBox.classList.add('d-none');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideError();

  const name     = document.getElementById('name').value.trim();
  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirm  = document.getElementById('confirm-password').value;

  if (!name || !email || !password || !confirm) return showError('Please fill in all fields.');
  if (name.length < 2)         return showError('Name must be at least 2 characters.');
  if (password.length < 6)     return showError('Password must be at least 6 characters.');
  if (password !== confirm)    return showError('Passwords do not match.');

  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1" role="status"></span>Creating account…';

  try {
    await register({ name, email, password });
    window.location.href = '/pages/projects.html';
  } catch (err) {
    showError(err.message || 'Registration failed. Please try again.');
    submitBtn.disabled    = false;
    submitBtn.textContent = 'Create Account';
  }
});
