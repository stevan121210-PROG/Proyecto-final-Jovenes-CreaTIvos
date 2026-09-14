const STORAGE_KEYS = {
  users: "programstyle_admin_users",
  session: "programstyle_admin_session",
  sessions: "programstyle_admin_sessions"
};

const DEFAULT_ADMIN = {
  usuario: "admin",
  password: "programstyle123"
};

let ADMIN_CREDENTIALS = { ...DEFAULT_ADMIN };

const loginForm = document.getElementById("admin-login-form");
const loginError = document.getElementById("login-error");
const loginSection = document.getElementById("login-section");
const adminDashboard = document.getElementById("admin-dashboard");
const createAdminForm = document.getElementById("create-admin-form");
const createAdminMessage = document.getElementById("create-admin-message");
const editAdminForm = document.getElementById("edit-admin-form");
const editAdminMessage = document.getElementById("edit-admin-message");
const sessionList = document.getElementById("session-list");
const sessionMessage = document.getElementById("session-message");
const logoutCurrentBtn = document.getElementById("logout-current-btn");
const clearUnauthorizedBtn = document.getElementById("clear-unauthorized-btn");
const panelToggles = document.querySelectorAll(".panel-toggle");

function getStoredUsers() {
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || "null");
  if (!stored || !stored.length) {
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify([DEFAULT_ADMIN]));
    return [DEFAULT_ADMIN];
  }

  return stored;
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
}

function getCurrentSession() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.session) || "null");
}

function setCurrentSession(user) {
  localStorage.setItem(STORAGE_KEYS.session, JSON.stringify({ user, loggedIn: true }));
}

function clearCurrentSession() {
  localStorage.removeItem(STORAGE_KEYS.session);
}

function getStoredSessions() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.sessions) || "[]");
}

function saveSessions(sessions) {
  localStorage.setItem(STORAGE_KEYS.sessions, JSON.stringify(sessions));
}

function updateSessionList() {
  if (!sessionList) return;

  const sessions = getStoredSessions();
  if (!sessions.length) {
    sessionList.innerHTML = '<p class="panel-message">No hay sesiones registradas.</p>';
    return;
  }

  sessionList.innerHTML = sessions
    .map((entry) => {
      const statusClass = entry.status === "active" ? "active" : "unauthorized";
      const label = entry.status === "active" ? "Activa" : "No autorizada";
      return `
        <div class="session-item" data-user="${entry.user}" data-status="${entry.status}" tabindex="0">
          <strong>${entry.user}</strong>
          <span class="badge ${statusClass}">${label}</span>
        </div>
      `;
    })
    .join("");

  sessionList.querySelectorAll(".session-item").forEach((item) => {
    item.addEventListener("click", () => {
      item.classList.toggle("selected");
    });

    item.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        item.classList.toggle("selected");
      }
    });
  });
}

function ensureAdminSessionState() {
  const users = getStoredUsers();
  const currentUser = getCurrentSession();

  if (users.length) {
    const activeUser = users.find((user) => user.usuario === currentUser?.user);
    if (activeUser) {
      ADMIN_CREDENTIALS = { ...activeUser };
    }
  }

  if (currentUser?.loggedIn) {
    const sessions = getStoredSessions();
    const sessionExists = sessions.some((entry) => entry.user === currentUser.user && entry.status === "active");
    if (!sessionExists) {
      sessions.push({ user: currentUser.user, status: "active" });
      saveSessions(sessions);
    }
  }

  updateSessionList();
}

function validateLogin(usuario, password) {
  const users = getStoredUsers();
  return users.some((user) => user.usuario === usuario && user.password === password);
}

function setMessage(element, text, type) {
  if (!element) return;
  element.textContent = text;
  element.classList.remove("success", "error");
  if (type) element.classList.add(type);
}

function loginToDashboard(user) {
  setCurrentSession(user);
  const sessions = getStoredSessions();
  const normalised = sessions.filter((entry) => entry.user !== user || entry.status === "active");
  normalised.push({ user, status: "active" });
  saveSessions(normalised);

  if (loginSection) loginSection.classList.add("hidden");
  if (adminDashboard) {
    adminDashboard.classList.remove("hidden");
    adminDashboard.classList.add("visible");
  }

  updateSessionList();
}

if (loginForm) {
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const usuario = document.getElementById("usuario").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!usuario || !password) {
      setMessage(loginError, "Completa usuario y contraseña para continuar.", "error");
      return;
    }

    if (validateLogin(usuario, password)) {
      setMessage(loginError, "Acceso correcto.", "success");
      loginToDashboard(usuario);
      loginForm.reset();
      return;
    }

    const sessions = getStoredSessions();
    sessions.push({ user: usuario, status: "unauthorized" });
    saveSessions(sessions);
    updateSessionList();

    setMessage(loginError, "Usuario o contraseña incorrectos.", "error");
    loginForm.reset();
  });
}

if (createAdminForm) {
  createAdminForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const nombre = document.getElementById("new-admin-user").value.trim();
    const password = document.getElementById("new-admin-pass").value.trim();

    if (!nombre || !password) {
      setMessage(createAdminMessage, "Completa usuario y contraseña del nuevo perfil.", "error");
      return;
    }

    const users = getStoredUsers();
    const exists = users.some((user) => user.usuario === nombre);

    if (exists) {
      setMessage(createAdminMessage, "Ese usuario ya existe. Elige otro nombre.", "error");
      return;
    }

    users.push({ usuario: nombre, password });
    saveUsers(users);
    setMessage(createAdminMessage, "Nuevo administrador creado correctamente.", "success");
    createAdminForm.reset();
  });
}

if (editAdminForm) {
  editAdminForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const usuarioActual = document.getElementById("current-admin-user").value.trim();
    const passwordActual = document.getElementById("current-admin-pass").value.trim();
    const nuevoUsuario = document.getElementById("updated-admin-user").value.trim();
    const nuevaPassword = document.getElementById("updated-admin-pass").value.trim();

    if (!usuarioActual || !passwordActual || !nuevoUsuario || !nuevaPassword) {
      setMessage(editAdminMessage, "Debes completar todos los campos para actualizar el perfil.", "error");
      return;
    }

    const users = getStoredUsers();
    const userIndex = users.findIndex(
      (user) => user.usuario === usuarioActual && user.password === passwordActual
    );

    if (userIndex === -1) {
      setMessage(editAdminMessage, "Los datos del perfil actual no coinciden.", "error");
      return;
    }

    const duplicateUser = users.some((user, index) => index !== userIndex && user.usuario === nuevoUsuario);
    if (duplicateUser) {
      setMessage(editAdminMessage, "El nuevo usuario ya está en uso.", "error");
      return;
    }

    users[userIndex] = { usuario: nuevoUsuario, password: nuevaPassword };
    saveUsers(users);
    ADMIN_CREDENTIALS = { usuario: nuevoUsuario, password: nuevaPassword };
    setCurrentSession(nuevoUsuario);

    setMessage(editAdminMessage, "Perfil actualizado correctamente.", "success");
    editAdminForm.reset();
  });
}

if (logoutCurrentBtn) {
  logoutCurrentBtn.addEventListener("click", () => {
    const current = getCurrentSession();
    const sessions = getStoredSessions().filter((entry) => !(entry.user === current?.user && entry.status === "active"));
    saveSessions(sessions);
    clearCurrentSession();
    updateSessionList();

    if (loginSection) loginSection.classList.remove("hidden");
    if (adminDashboard) {
      adminDashboard.classList.add("hidden");
      adminDashboard.classList.remove("visible");
    }

    setMessage(sessionMessage, "Sesión actual cerrada.", "success");
  });
}

if (clearUnauthorizedBtn) {
  clearUnauthorizedBtn.addEventListener("click", () => {
    const selectedSessions = Array.from(document.querySelectorAll(".session-item.selected"));
    const selectedUsers = selectedSessions.map((item) => item.dataset.user);

    const sessions = getStoredSessions().filter((entry) => {
      if (!selectedUsers.length) return entry.status !== "unauthorized";
      return !(selectedUsers.includes(entry.user));
    });

    saveSessions(sessions);
    updateSessionList();
    setMessage(sessionMessage, selectedUsers.length ? "Sesiones seleccionadas cerradas." : "Sesiones no autorizadas cerradas.", "success");
  });
}

if (panelToggles.length) {
  panelToggles.forEach((button) => {
    button.addEventListener("click", () => {
      const panel = document.getElementById(button.dataset.target);
      if (!panel) return;
      panel.classList.toggle("hidden-panel");
    });
  });
}

ensureAdminSessionState();

if (getCurrentSession()?.loggedIn) {
  if (loginSection) loginSection.classList.add("hidden");
  if (adminDashboard) {
    adminDashboard.classList.remove("hidden");
    adminDashboard.classList.add("visible");
  }
}
