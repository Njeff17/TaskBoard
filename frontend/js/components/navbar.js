//Navbar component — renders navigation and handles logout.
import { getCurrentUser } from '../services/api.js';
import { logout } from '../services/auth.service.js';

export const initNavbar = () => {
  const user = getCurrentUser();

  // Populate user name & avatar initial
  const nameEl = document.getElementById('navbar-user-name');
  const avatarEl = document.getElementById('navbar-avatar');

  if (nameEl && user) nameEl.textContent = user.name;
  if (avatarEl && user) avatarEl.textContent = user.name.charAt(0).toUpperCase();

  // Logout button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      logoutBtn.disabled = true;
      await logout();
    });
  }
};

// Guard — redirects to login if the user is not authenticated.
export const requireAuth = () => {
  const token = localStorage.getItem('taskboard_token');
  if (!token) {
    window.location.href = '/pages/login.html';
    return false;
  }
  return true;
};

// Guard — redirects authenticated users away from auth pages.

export const redirectIfAuthenticated = () => {
  const token = localStorage.getItem('taskboard_token');
  if (token) {
    window.location.href = '/pages/projects.html';
  }
};
