const ADMIN_CREDENTIALS = {
  usuario: "admin",
  password: "programstyle123"
};

const loginForm = document.getElementById("admin-login-form");
const loginError = document.getElementById("login-error");
const loginSection = document.getElementById("login-section");
const adminDashboard = document.getElementById("admin-dashboard");

if (loginForm) {
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const usuario = document.getElementById("usuario").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!usuario || !password) {
      loginError.textContent = "Completa usuario y contraseña para continuar.";
      loginError.classList.remove("success");
      return;
    }

    if (usuario === ADMIN_CREDENTIALS.usuario && password === ADMIN_CREDENTIALS.password) {
      loginError.textContent = "Acceso correcto.";
      loginError.classList.add("success");
      loginError.classList.remove("error");

      if (loginSection) loginSection.classList.add("hidden");
      if (adminDashboard) {
        adminDashboard.classList.remove("hidden");
        adminDashboard.classList.add("visible");
      }

      return;
    }

    loginError.textContent = "Usuario o contraseña incorrectos.";
    loginError.classList.remove("success");
    loginError.classList.add("error");
    loginForm.reset();
  });
}
