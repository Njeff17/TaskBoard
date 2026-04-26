import { requireAuth, initNavbar }   from '../components/navbar.js';
import { openModal, closeModal }      from '../components/modal.js';
import { showToast }                  from '../components/toast.js';
import { getProjects, createProject, updateProject, deleteProject } from '../services/project.service.js';

if (!requireAuth()) throw new Error('Unauthenticated');
initNavbar();

// DOM refs 
const grid        = document.getElementById('projects-grid');
const newProjBtn  = document.getElementById('new-project-btn');
const searchInput = document.getElementById('search-input');

let allProjects = [];

// Helpers 
const escHtml = (str) => {
  const d = document.createElement('div');
  d.textContent = str || '';
  return d.innerHTML;
};

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

// Render
const renderProjects = (projects) => {
  if (projects.length === 0) {
    grid.innerHTML = `
      <div class="col-12 text-center py-5">
        <div style="font-size:3.5rem" class="mb-3">📋</div>
        <h4 class="text-secondary mb-2">No projects yet</h4>
        <p class="text-muted mb-4">Create your first project to start organising tasks.</p>
        <button class="btn btn-primary" id="empty-create-btn">+ New Project</button>
      </div>`;
    document.getElementById('empty-create-btn')?.addEventListener('click', openCreateModal);
    return;
  }

  grid.innerHTML = projects.map((p) => `
    <div class="col">
      <div class="card h-100 project-card card-hover" data-id="${p.id}">
        <div class="card-body d-flex flex-column gap-2">
          <div class="d-flex justify-content-between align-items-start">
            <h5 class="card-title mb-0 project-title" data-id="${p.id}" style="cursor:pointer">${escHtml(p.name)}</h5>
            <div class="d-flex gap-1 ms-2 flex-shrink-0">
              <button class="btn btn-outline-secondary btn-sm edit-btn" data-id="${p.id}" title="Edit">✏️</button>
              <button class="btn btn-outline-danger   btn-sm delete-btn" data-id="${p.id}" title="Delete">🗑</button>
            </div>
          </div>
          <p class="card-text text-muted small flex-grow-1 mb-0">
            ${p.description ? escHtml(p.description) : '<em>No description</em>'}
          </p>
          <div class="d-flex justify-content-between align-items-center pt-2 border-top border-secondary-subtle">
            <small class="text-muted">📅 ${formatDate(p.createdAt)}</small>
            <small class="text-primary">View tasks →</small>
          </div>
        </div>
      </div>
    </div>
  `).join('');

  grid.querySelectorAll('.project-title').forEach((el) =>
    el.addEventListener('click', () => navigate(el.dataset.id))
  );
  grid.querySelectorAll('.card.project-card').forEach((el) => {
    el.addEventListener('click', (e) => { if (!e.target.closest('button')) navigate(el.dataset.id); });
  });
  grid.querySelectorAll('.edit-btn').forEach((btn) =>
    btn.addEventListener('click', (e) => { e.stopPropagation(); openEditModal(btn.dataset.id); })
  );
  grid.querySelectorAll('.delete-btn').forEach((btn) =>
    btn.addEventListener('click', (e) => { e.stopPropagation(); openDeleteModal(btn.dataset.id); })
  );
};

const navigate = (id) => { window.location.href = `/pages/project-detail.html?id=${id}`; };

// Load
const loadProjects = async () => {
  grid.innerHTML = `
    <div class="col-12 page-loader">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading…</span>
      </div>
    </div>`;
  try {
    allProjects = await getProjects();
    renderProjects(allProjects);
  } catch (err) {
    grid.innerHTML = `<div class="col-12"><div class="alert alert-danger">${err.message}</div></div>`;
  }
};

// Search
searchInput?.addEventListener('input', () => {
  const q = searchInput.value.toLowerCase();
  renderProjects(allProjects.filter((p) =>
    p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q)
  ));
});

// Project form body
const projectFormHtml = (name = '', desc = '') => `
  <div class="mb-3">
    <label class="form-label fw-semibold" for="modal-proj-name">Project name <span class="text-danger">*</span></label>
    <input id="modal-proj-name" class="form-control" type="text"
           placeholder="e.g. Website Redesign" value="${escHtml(name)}" maxlength="150" />
  </div>
  <div class="mb-3">
    <label class="form-label fw-semibold" for="modal-proj-desc">Description <small class="text-muted fw-normal">(optional)</small></label>
    <textarea id="modal-proj-desc" class="form-control" rows="3"
              placeholder="What is this project about?" maxlength="1000">${escHtml(desc)}</textarea>
  </div>
  <div id="proj-modal-error" class="text-danger small d-none"></div>
`;

// Create modal
const openCreateModal = () => {
  openModal({
    title: '✨ New Project',
    body: projectFormHtml(),
    confirmText: 'Create Project',
    onConfirm: async () => {
      const name  = document.getElementById('modal-proj-name').value.trim();
      const desc  = document.getElementById('modal-proj-desc').value.trim();
      const errEl = document.getElementById('proj-modal-error');
      if (!name) { errEl.textContent = 'Project name is required.'; errEl.classList.remove('d-none'); return; }
      await createProject({ name, description: desc });
      closeModal();
      showToast('Project created!', 'success');
      await loadProjects();
    },
  });
};

// Edit modal
const openEditModal = (id) => {
  const p = allProjects.find((x) => String(x.id) === String(id));
  if (!p) return;
  openModal({
    title: '✏️ Edit Project',
    body: projectFormHtml(p.name, p.description || ''),
    confirmText: 'Save Changes',
    onConfirm: async () => {
      const name  = document.getElementById('modal-proj-name').value.trim();
      const desc  = document.getElementById('modal-proj-desc').value.trim();
      const errEl = document.getElementById('proj-modal-error');
      if (!name) { errEl.textContent = 'Project name is required.'; errEl.classList.remove('d-none'); return; }
      await updateProject(id, { name, description: desc });
      closeModal();
      showToast('Project updated!', 'success');
      await loadProjects();
    },
  });
};

// Delete modal
const openDeleteModal = (id) => {
  const p = allProjects.find((x) => String(x.id) === String(id));
  if (!p) return;
  openModal({
    title: '🗑 Delete Project',
    body: `<p class="mb-0">Delete <strong>${escHtml(p.name)}</strong>?<br>
           <span class="text-muted small">All tasks inside will be permanently removed.</span></p>`,
    confirmText: 'Delete',
    dangerous: true,
    onConfirm: async () => {
      await deleteProject(id);
      closeModal();
      showToast('Project deleted.', 'info');
      await loadProjects();
    },
  });
};

// Init
newProjBtn?.addEventListener('click', openCreateModal);
loadProjects();
