import { requireAuth, initNavbar }    from '../components/navbar.js';
import { openModal, closeModal }       from '../components/modal.js';
import { showToast }                   from '../components/toast.js';
import { getProject, updateProject, deleteProject } from '../services/project.service.js';
import { getTasks, createTask, updateTask, deleteTask } from '../services/task.service.js';

if (!requireAuth()) throw new Error('Unauthenticated');
initNavbar();

// Route param
const params    = new URLSearchParams(window.location.search);
const projectId = params.get('id');
if (!projectId) window.location.href = '/pages/projects.html';

// DOM refs
const projectTitle  = document.getElementById('project-title');
const projectDesc   = document.getElementById('project-desc');
const projectDate   = document.getElementById('project-date');
const editProjBtn   = document.getElementById('edit-project-btn');
const deleteProjBtn = document.getElementById('delete-project-btn');
const addTaskBtn    = document.getElementById('add-task-btn');
const filterBtns    = document.querySelectorAll('.filter-pill');

const colTodo   = document.getElementById('col-todo');
const colInprog = document.getElementById('col-inprog');
const colDone   = document.getElementById('col-done');
const cntTodo   = document.getElementById('cnt-todo');
const cntInprog = document.getElementById('cnt-inprog');
const cntDone   = document.getElementById('cnt-done');

let currentProject = null;
let allTasks = [];
let activeFilter = 'ALL';

// Helpers
const escHtml = (str) => {
  const d = document.createElement('div');
  d.textContent = str || '';
  return d.innerHTML;
};

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

const isOverdue = (d) =>
  d && new Date(d).setHours(0,0,0,0) < new Date().setHours(0,0,0,0);

const bsSpinner = `
  <div class="page-loader">
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">Loading…</span>
    </div>
  </div>`;

const emptyCol = () =>
  `<p class="text-muted small text-center py-3 mb-0">No tasks here</p>`;

// Task card HTML
const taskCardHtml = (t) => {
  const overdue = isOverdue(t.dueDate);
  return `
    <div class="task-card" data-id="${t.id}">
      <div class="task-card-title">${escHtml(t.title)}</div>
      ${t.description ? `<div class="task-card-desc">${escHtml(t.description)}</div>` : ''}
      <div class="task-card-footer">
        <span class="task-due ${overdue ? 'overdue' : ''}">
          ${t.dueDate ? `📅 ${formatDate(t.dueDate)}${overdue ? ' (overdue)' : ''}` : ''}
        </span>
        <div class="task-actions">
          <button class="btn btn-outline-secondary btn-sm task-edit-btn"   data-id="${t.id}" title="Edit">✏️</button>
          <button class="btn btn-outline-danger   btn-sm task-delete-btn" data-id="${t.id}" title="Delete">🗑</button>
        </div>
      </div>
    </div>`;
};

// Render board
const renderBoard = () => {
  const visible = activeFilter === 'ALL' ? allTasks : allTasks.filter((t) => t.status === activeFilter);
  const todo    = visible.filter((t) => t.status === 'TODO');
  const inprog  = visible.filter((t) => t.status === 'IN_PROGRESS');
  const done    = visible.filter((t) => t.status === 'DONE');

  cntTodo.textContent   = todo.length;
  cntInprog.textContent = inprog.length;
  cntDone.textContent   = done.length;

  colTodo.innerHTML   = todo.length   ? todo.map(taskCardHtml).join('')   : emptyCol();
  colInprog.innerHTML = inprog.length ? inprog.map(taskCardHtml).join('') : emptyCol();
  colDone.innerHTML   = done.length   ? done.map(taskCardHtml).join('')   : emptyCol();

  document.querySelectorAll('.task-edit-btn').forEach((btn) =>
    btn.addEventListener('click', (e) => { e.stopPropagation(); openTaskModal(btn.dataset.id); })
  );
  document.querySelectorAll('.task-delete-btn').forEach((btn) =>
    btn.addEventListener('click', (e) => { e.stopPropagation(); openDeleteTaskModal(btn.dataset.id); })
  );
  document.querySelectorAll('.task-card').forEach((card) =>
    card.addEventListener('click', (e) => { if (!e.target.closest('button')) openTaskModal(card.dataset.id); })
  );
};

// Load project
const loadProject = async () => {
  try {
    currentProject = await getProject(projectId);
    projectTitle.textContent = currentProject.name;
    projectDesc.textContent  = currentProject.description || 'No description.';
    projectDate.textContent  = `Created ${formatDate(currentProject.createdAt)}`;
  } catch (err) {
    showToast(err.message, 'error');
    setTimeout(() => window.location.href = '/pages/projects.html', 1500);
  }
};

// Load tasks
const loadTasks = async () => {
  colTodo.innerHTML = colInprog.innerHTML = colDone.innerHTML = bsSpinner;
  try {
    allTasks = await getTasks(projectId);
    renderBoard();
  } catch (err) {
    showToast(err.message, 'error');
  }
};

// Task form HTML
const taskFormHtml = (t = {}) => `
  <div class="mb-3">
    <label class="form-label fw-semibold" for="task-title">Title <span class="text-danger">*</span></label>
    <input id="task-title" class="form-control" type="text"
           placeholder="What needs to be done?" value="${escHtml(t.title || '')}" maxlength="200" />
  </div>
  <div class="mb-3">
    <label class="form-label fw-semibold" for="task-desc">Description <small class="text-muted fw-normal">(optional)</small></label>
    <textarea id="task-desc" class="form-control" rows="3"
              placeholder="Add more detail…" maxlength="2000">${escHtml(t.description || '')}</textarea>
  </div>
  <div class="row g-3 mb-2">
    <div class="col-6">
      <label class="form-label fw-semibold" for="task-status">Status</label>
      <select id="task-status" class="form-select">
        <option value="TODO"        ${(t.status || 'TODO') === 'TODO'        ? 'selected' : ''}>📋 To Do</option>
        <option value="IN_PROGRESS" ${t.status === 'IN_PROGRESS'             ? 'selected' : ''}>⚡ In Progress</option>
        <option value="DONE"        ${t.status === 'DONE'                    ? 'selected' : ''}>✅ Done</option>
      </select>
    </div>
    <div class="col-6">
      <label class="form-label fw-semibold" for="task-due">Due date <small class="text-muted fw-normal">(optional)</small></label>
      <input id="task-due" class="form-control" type="date" value="${t.dueDate || ''}" />
    </div>
  </div>
  <div id="task-modal-error" class="text-danger small d-none"></div>
`;

const collectTask = () => ({
  title:       document.getElementById('task-title').value.trim(),
  description: document.getElementById('task-desc').value.trim() || null,
  status:      document.getElementById('task-status').value,
  dueDate:     document.getElementById('task-due').value || null,
});

// ── Task create/edit modal ────────────────────────────────────────────────────
const openTaskModal = (taskId = null) => {
  const task   = taskId ? allTasks.find((t) => String(t.id) === String(taskId)) : null;
  const isEdit = !!task;
  openModal({
    title: isEdit ? '✏️ Edit Task' : '➕ New Task',
    body:  taskFormHtml(task),
    confirmText: isEdit ? 'Save Changes' : 'Create Task',
    onConfirm: async () => {
      const fields = collectTask();
      const errEl  = document.getElementById('task-modal-error');
      errEl.classList.add('d-none');

      if (!fields.title) {
        errEl.textContent = 'Task title is required.';
        errEl.classList.remove('d-none');
        return;
      }

      try {
        if (isEdit) {
          await updateTask(projectId, taskId, fields);
          showToast('Task updated!', 'success');
        } else {
          await createTask(projectId, fields);
          showToast('Task created!', 'success');
        }
        closeModal();
        await loadTasks();
      } catch (err) {
        errEl.textContent = err.message || 'Something went wrong. Please try again.';
        errEl.classList.remove('d-none');
        throw err; // re-throw so modal.js resets the button
      }
    },
  });
};

// ── Task delete modal ─────────────────────────────────────────────────────────
const openDeleteTaskModal = (taskId) => {
  const t = allTasks.find((x) => String(x.id) === String(taskId));
  openModal({
    title: '🗑 Delete Task',
    body:  `<p class="mb-0">Delete <strong>${escHtml(t?.title)}</strong>? This cannot be undone.</p>`,
    confirmText: 'Delete', dangerous: true,
    onConfirm: async () => {
      await deleteTask(projectId, taskId);
      closeModal();
      showToast('Task deleted.', 'info');
      await loadTasks();
    },
  });
};

// ── Project edit/delete ───────────────────────────────────────────────────────
editProjBtn?.addEventListener('click', () => {
  if (!currentProject) return;
  openModal({
    title: '✏️ Edit Project',
    body: `
      <div class="mb-3">
        <label class="form-label fw-semibold" for="ep-name">Name</label>
        <input id="ep-name" class="form-control" value="${escHtml(currentProject.name)}" maxlength="150" />
      </div>
      <div class="mb-3">
        <label class="form-label fw-semibold" for="ep-desc">Description</label>
        <textarea id="ep-desc" class="form-control" rows="3">${escHtml(currentProject.description || '')}</textarea>
      </div>
      <div id="ep-error" class="text-danger small d-none"></div>`,
    confirmText: 'Save',
    onConfirm: async () => {
      const name  = document.getElementById('ep-name').value.trim();
      const desc  = document.getElementById('ep-desc').value.trim();
      const errEl = document.getElementById('ep-error');
      if (!name) { errEl.textContent = 'Name is required.'; errEl.classList.remove('d-none'); return; }
      await updateProject(projectId, { name, description: desc });
      closeModal();
      showToast('Project updated!', 'success');
      await loadProject();
    },
  });
});

deleteProjBtn?.addEventListener('click', () => {
  openModal({
    title: '🗑 Delete Project',
    body:  `<p class="mb-0">Delete <strong>${escHtml(currentProject?.name)}</strong> and all its tasks?</p>`,
    confirmText: 'Delete', dangerous: true,
    onConfirm: async () => {
      await deleteProject(projectId);
      closeModal();
      showToast('Project deleted.', 'info');
      setTimeout(() => window.location.href = '/pages/projects.html', 700);
    },
  });
});

// ── Filter pills ──────────────────────────────────────────────────────────────
filterBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    filterBtns.forEach((b) => b.className = 'filter-pill');
    activeFilter = btn.dataset.filter;
    const map = { ALL: 'active', TODO: 'active-todo', IN_PROGRESS: 'active-inprog', DONE: 'active-done' };
    btn.classList.add('filter-pill', map[activeFilter] ?? 'active');
    renderBoard();
  });
});

addTaskBtn?.addEventListener('click', () => openTaskModal());

// ── Init ──────────────────────────────────────────────────────────────────────
(async () => {
  await loadProject();
  await loadTasks();
  filterBtns[0]?.classList.add('active');
})();
