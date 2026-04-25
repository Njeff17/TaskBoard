import { requireAuth, initNavbar } from '../components/navbar.js';
import { showToast }               from '../components/toast.js';
import { getProfile, updateProfile } from '../services/auth.service.js';
import { getProjects }               from '../services/project.service.js';

if (!requireAuth()) throw new Error('Unauthenticated');
initNavbar();

const avatarEl     = document.getElementById('profile-avatar');
const emailEl      = document.getElementById('profile-email');
const memberEl     = document.getElementById('profile-member');
const projectCount = document.getElementById('stat-projects');
const nameInput    = document.getElementById('profile-name');
const profileForm  = document.getElementById('profile-form');
const submitBtn    = document.getElementById('profile-submit');
const errorEl      = document.getElementById('profile-error');
const successEl    = document.getElementById('profile-success');

const load = async () => {
  try {
    const [user, projects] = await Promise.all([getProfile(), getProjects()]);
    nameInput.value          = user.name;
    emailEl.textContent      = user.email;
    avatarEl.textContent     = user.name.charAt(0).toUpperCase();
    memberEl.textContent     = `Member since ${new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}`;
    projectCount.textContent = projects.length;
  } catch (err) {
    showToast(err.message, 'error');
  }
};

profileForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorEl.classList.add('d-none');
  successEl.classList.add('d-none');

  const name = nameInput.value.trim();
  if (!name || name.length < 2) {
    errorEl.textContent = 'Name must be at least 2 characters.';
    return errorEl.classList.remove('d-none');
  }

  submitBtn.disabled  = true;
  submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1" role="status"></span>Saving…';

  try {
    const updated = await updateProfile({ name });
    document.getElementById('navbar-user-name')?.textContent !== undefined &&
      (document.getElementById('navbar-user-name').textContent = updated.name);
    document.getElementById('navbar-avatar')?.textContent !== undefined &&
      (document.getElementById('navbar-avatar').textContent = updated.name.charAt(0).toUpperCase());
    avatarEl.textContent    = updated.name.charAt(0).toUpperCase();
    successEl.textContent   = 'Profile updated successfully!';
    successEl.classList.remove('d-none');
    showToast('Profile updated!', 'success');
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.classList.remove('d-none');
  } finally {
    submitBtn.disabled    = false;
    submitBtn.textContent = 'Save Changes';
  }
});

load();
