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
const adminChatForm = document.getElementById("admin-chat-form");
const adminChatInput = document.getElementById("admin-chat-input");
const adminChatMessages = document.getElementById("admin-chat-messages");
const chatQuestionButtons = document.querySelectorAll("[data-chat-question]");

let lastAdminHelpTopic = null;

const ADMIN_HELP_TOPICS = [
  {
    id: "admin-create",
    keywords: ["crear administrador", "crear un administrador", "agregar administrador", "agregar un administrador", "agrego un administrador", "añadir administrador", "nuevo administrador", "otro administrador", "sumar un administrador", "crear usuario", "nuevo usuario", "otro usuario", "añadir usuario", "crear una cuenta", "nuevo perfil"],
    responses: [
      "Para sumar a otra persona al panel, abre “Agregar nuevo administrador”, elige su usuario y contraseña y pulsa “Crear perfil”. Ojo: el nombre de usuario debe ser único.",
      "¡Claro! En el panel, despliega “Agregar nuevo administrador”, completa usuario y contraseña y selecciona “Crear perfil”. Si te avisa que ya existe, prueba con otro nombre."
    ]
  },
  {
    id: "admin-credentials",
    keywords: ["credenciales", "cambiar contraseña", "actualizar contraseña", "cambiar usuario", "editar perfil", "cambiar mi clave", "cambiar clave", "clave", "mi contraseña", "mi usuario"],
    responses: [
      "Puedes cambiar ambos datos desde “Editar credenciales”: confirma tu usuario y contraseña actuales, escribe los nuevos y pulsa “Guardar cambios”. Tu sesión seguirá abierta con el nuevo usuario.",
      "Para renovar tu acceso, abre “Editar credenciales”. El formulario te pide primero los datos actuales y después el nuevo usuario y contraseña; al guardar, los cambios quedan aplicados."
    ]
  },
  {
    id: "admin-login",
    keywords: ["iniciar sesion", "entrar al panel", "no puedo entrar", "problema para entrar", "acceso al panel", "login", "olvide mi contraseña", "olvide la contraseña"],
    responses: [
      "El acceso se hace desde la página Admin con el usuario y la contraseña registrados. Si olvidaste la clave, el panel todavía no tiene recuperación de contraseña; si aún tienes una sesión abierta, puedes cambiarla en “Editar credenciales”.",
      "Ve a “Admin” e ingresa tus credenciales. Por ahora no existe un flujo para restablecer una contraseña olvidada, así que no quiero inventarte uno; si sigues dentro del panel, puedes actualizarla en “Editar credenciales”."
    ]
  },
  {
    id: "admin-sessions",
    keywords: ["sesion", "cerrar sesion", "sesiones", "no autorizada", "sesion activa"],
    responses: [
      "En “Sesiones” puedes seleccionar registros y cerrar las sesiones no autorizadas. Si no seleccionas ninguna, ese botón cierra todas las no autorizadas; “Cerrar sesión actual” termina la tuya en este navegador.",
      "La sección “Sesiones” te deja revisar los accesos registrados. Selecciona los que quieras cerrar y pulsa el botón de sesiones no autorizadas; si no marcas ninguno, se cierran todas las no autorizadas."
    ]
  },
  {
    id: "admin-overview",
    priority: -2,
    keywords: ["panel admin", "panel de admin", "panel de administracion", "funciones administrativas", "que hace admin"],
    responses: [
      "El panel Admin reúne la gestión de perfiles y sesiones. También muestra accesos a Solicitudes, Servicios y Clientes, aunque esas tarjetas todavía son informativas y no gestionan datos.",
      "Desde Admin puedes crear otros perfiles, actualizar tus credenciales y revisar sesiones. Las tarjetas de Solicitudes, Servicios y Clientes indican áreas previstas, pero aún no tienen herramientas de gestión."
    ]
  },
  {
    id: "admin-requests",
    keywords: ["solicitud", "solicitudes", "cotizacion", "cotizaciones", "formulario", "mensaje de contacto"],
    responses: [
      "Para pedir una cotización, abre “Servicios” y completa el formulario de contacto. El panel Admin muestra una tarjeta de Solicitudes, pero todavía no recibe ni guarda esos envíos.",
      "Las cotizaciones se solicitan desde el formulario de la página “Servicios”. Importante: aunque Admin muestra una tarjeta de Solicitudes, todavía no hay una bandeja conectada para revisarlas dentro del panel."
    ]
  },
  {
    id: "home-projects",
    keywords: ["proyectos", "casos de exito", "shinsushii", "smph", "compresores", "trabajos realizados", "portafolio", "ejemplos"],
    responses: [
      "En “Inicio”, baja hasta “Proyectos realizados”. Ahí aparecen Shinsushii, una landing para una marca de sushi, y SMPH Compresores, un sitio corporativo industrial; puedes abrir cada proyecto desde su tarjeta.",
      "La página “Inicio” incluye dos proyectos recientes: Shinsushii y SMPH Compresores. Las tarjetas llevan a sus sitios publicados, así que sirven para ver ejemplos reales del trabajo."
    ]
  },
  {
    id: "home",
    keywords: ["pagina de inicio", "pagina principal", "portada", "inicio", "pagina web de programstyle", "que ofrece programstyle"],
    responses: [
      "La portada de “Inicio” presenta el desarrollo de páginas web empresariales y tiene accesos directos a “Servicios” y al panel Admin. Más abajo encontrarás los proyectos recientes.",
      "En “Inicio” se presenta la propuesta de ProgramStyle: sitios empresariales modernos, adaptados a móviles y con identidad visual negra, dorada y blanca. Desde ahí puedes ir a Servicios o ver los proyectos."
    ]
  },
  {
    id: "home-design",
    keywords: ["diseno", "identidad visual", "colores", "responsive", "movil", "celular"],
    responses: [
      "La portada destaca páginas empresariales modernas, adaptadas a móviles, con una identidad visual en negro, dorado y blanco. Esa es la propuesta que presenta ProgramStyle en Inicio.",
      "En Inicio se cuenta que los sitios se diseñan para verse bien tanto en móviles como en escritorio. La identidad visual de la marca combina negro, dorado y blanco."
    ]
  },
  {
    id: "service-overview",
    priority: -3,
    keywords: ["servicios", "catalogo", "paquetes", "planes", "que ofrecen", "ver servicios", "tipos de sitio"],
    responses: [
      "En “Servicios” encontrarás cuatro opciones: Landing Page, Sitio Corporativo, una promoción para un proyecto posterior y E-commerce. Hay precios de referencia y puedes pedir una cotización desde esa página.",
      "La página “Servicios” reúne Landing Page, Sitio Corporativo, E-commerce y una promoción especial. Si me cuentas qué tipo de negocio o página tienes en mente, te ayudo a ubicar el plan que más se parece."
    ]
  },
  {
    id: "service-discount",
    keywords: ["descuento", "promocion", "40%", "oferta"],
    responses: [
      "En “Servicios” aparece una promoción de 40% de descuento para un proyecto posterior, después de contratar una Landing Page. La descripción la presenta como una oferta para proyectos posteriores con ProgramStyle; confirma las condiciones al cotizar.",
      "La promoción publicada es 40% de descuento en el siguiente proyecto al contratar primero una Landing Page. Como los precios y condiciones pueden variar, lo mejor es confirmarlo al solicitar la cotización."
    ]
  },
  {
    id: "service-prices",
    priority: 8,
    keywords: ["precio", "precios", "cuanto cuesta", "cuanto vale", "presupuesto", "valor de", "dolares", "pesos"],
    responses: [
      "Los valores que aparecen en “Servicios” son sugeridos: Landing Page desde $2.200.000 COP (aprox. USD 550), sitio corporativo desde $4.500.000 COP (aprox. USD 1.125) y e-commerce desde $7.500.000 COP (aprox. USD 1.875). Pueden variar según alcance, urgencia e integraciones.",
      "Como referencia, el catálogo publica estos precios iniciales: Landing Page $2.200.000 COP, sitio corporativo $4.500.000 COP y e-commerce $7.500.000 COP. Son aproximados y pueden cambiar según el proyecto; en la página Servicios puedes pedir una cotización."
    ]
  },
  {
    id: "service-landing",
    keywords: ["landing", "pagina de aterrizaje", "pagina para captar clientes"],
    responses: [
      "La Landing Page está pensada para presentar un negocio y captar clientes. Incluye diseño adaptable, formulario de contacto, SEO básico e integración con WhatsApp; figura desde $2.200.000 COP.",
      "Si buscas una página enfocada en una sola propuesta y en conseguir contactos, la Landing Page puede encajar. El plan menciona diseño responsive, contacto, SEO básico y WhatsApp, desde $2.200.000 COP."
    ]
  },
  {
    id: "service-corporate",
    keywords: ["corporativo", "sitio empresarial", "pagina empresarial", "empresa", "blog", "equipo"],
    responses: [
      "El Sitio Corporativo es para una empresa que necesita varias secciones, por ejemplo servicios, equipo y noticias. Incluye SEO avanzado y un panel de administración básico; está publicado desde $4.500.000 COP.",
      "Para una presencia empresarial más completa, el plan corporativo contempla varias secciones, blog o noticias, SEO avanzado y un panel Admin básico. El precio de referencia empieza en $4.500.000 COP."
    ]
  },
  {
    id: "service-ecommerce",
    keywords: ["ecommerce", "e-commerce", "tienda online", "tienda en linea", "carrito", "pasarela de pago", "vender productos"],
    responses: [
      "Para vender en línea está el plan E-commerce: incluye catálogo con filtros, carrito y pasarela de pago, gestión de stock y seguimiento de pedidos. Se publica desde $7.500.000 COP; el alcance final se cotiza según lo que necesites.",
      "El E-commerce es la opción de tienda en línea. El catálogo menciona productos con filtros, pagos, carrito, inventario y seguimiento de pedidos, desde $7.500.000 COP."
    ]
  },
  {
    id: "service-ai",
    keywords: ["asistencia con ia", "consultar con ia", "inteligencia artificial", "consulta rapida", "recomendacion de servicio", "ia"],
    responses: [
      "En “Servicios” hay un botón “Consultar con IA” con opciones para Landing Page, sitio corporativo y e-commerce. Al elegir una, prepara una consulta y la abre por WhatsApp; no es un chatbot que converse dentro del sitio.",
      "La asistencia de Servicios funciona con opciones rápidas: eliges el tipo de proyecto y se abre WhatsApp con un mensaje preparado. No analiza preguntas libres dentro de la página por ahora."
    ]
  },
  {
    id: "contact",
    keywords: ["contacto", "contactar", "whatsapp", "correo", "email", "formulario"],
    responses: [
      "Puedes contactar a ProgramStyle desde “Servicios”: usa el formulario o escribe por WhatsApp al +57 302 747 3875 o al correo Stevan121210@gmail.com. Cuéntales qué tipo de sitio necesitas y qué quieres incluir.",
      "Para pedir una cotización, ve a “Servicios” y completa nombre, correo y mensaje; el teléfono es opcional. Al enviar, se prepara el contacto por WhatsApp y correo. También tienes los enlaces directos en la misma página."
    ]
  },
  {
    id: "admin-limits",
    keywords: ["editar servicios", "editar precios", "cambiar catalogo", "gestionar clientes", "administrar solicitudes", "bandeja de entrada", "modificar pagina", "editar inicio"],
    responses: [
      "Buena pregunta. Aunque el panel muestra tarjetas de Solicitudes, Servicios y Clientes, esas áreas todavía son informativas: aún no permiten editar el sitio, el catálogo ni gestionar datos de clientes.",
      "Por ahora no hay herramientas en Admin para cambiar el contenido de Inicio, modificar precios o gestionar solicitudes y clientes. El panel sí permite administrar perfiles y sesiones."
    ]
  },
  {
    id: "admin-clients",
    keywords: ["cliente", "clientes", "conversacion", "seguimiento"],
    responses: [
      "La tarjeta “Clientes” del panel es una referencia a esa futura gestión, pero todavía no guarda clientes ni conversaciones. El contacto de los visitantes se inicia desde la página Servicios.",
      "Hoy no hay un CRM dentro del panel: la sección de Clientes es informativa. Las consultas de clientes pueden llegar por el formulario y los enlaces de contacto publicados en Servicios."
    ]
  },
  {
    id: "assistant",
    keywords: ["eres ia", "eres una ia", "eres un chatbot", "como funciona el asistente", "asistente administrativo"],
    responses: [
      "Soy una guía local del sitio, no una IA conectada a un servicio externo. Aun así, puedo orientarte sobre las funciones actuales y el contenido de Admin, Inicio y Servicios; si algo no está implementado, te lo diré de frente.",
      "Funciono con información preparada sobre este sitio, no genero respuestas usando un servicio de IA. Puedo conversar de forma más flexible sobre Admin, Inicio y Servicios, aunque no tengo acceso a datos nuevos ni a funciones que todavía no existen."
    ]
  }
];

const ADMIN_HELP_FOLLOW_UPS = {
  "admin-create": "Cuando tengas usuario y contraseña listos, abre el desplegable “Agregar nuevo administrador” en este mismo panel. Los nombres de usuario duplicados no se aceptan.",
  "admin-credentials": "Ten a mano tus credenciales actuales: el formulario las verifica antes de guardar las nuevas. Después de guardar, tu sesión queda con el usuario actualizado.",
  "admin-login": "La página de acceso está enlazada como “Admin” en la navegación. Si ya estás dentro, evita cerrar la sesión antes de actualizar las credenciales.",
  "admin-sessions": "Haz clic en una sesión para seleccionarla; también puedes enfocarla y usar Enter o espacio. El botón de sesiones no autorizadas cambia su alcance si hay elementos seleccionados.",
  "admin-overview": "Las secciones que hoy permiten acciones son la administración de perfiles y las sesiones. El resto del panel sirve como referencia de funciones que se podrían implementar más adelante.",
  "admin-requests": "El formulario está en la página “Servicios”, debajo del catálogo. La recepción de solicitudes dentro de Admin sería una función nueva, aún no implementada.",
  "home-projects": "Puedes volver a la parte superior con “Inicio” en el menú. Los enlaces de proyecto se abren en otra pestaña.",
  "home": "Usa “Ver servicios” para ir al catálogo o baja a “Proyectos realizados” para abrir los ejemplos.",
  "home-design": "La portada describe sitios empresariales adaptables a móviles y escritorio, con la identidad visual de ProgramStyle.",
  "service-discount": "Encontrarás la oferta como una tarjeta propia en el catálogo de Servicios. Para saber si aplica a un caso concreto, envía el formulario de cotización.",
  "service-overview": "El catálogo está en la página “Servicios”, debajo del encabezado. Las tarjetas incluyen características, precio de referencia y acceso a cotización.",
  "service-prices": "Los precios son valores de partida, no tarifas garantizadas: el texto del catálogo indica que pueden variar según urgencia, integraciones de IA y detalle del proyecto.",
  "service-landing": "La opción de cotización de cada tarjeta está prevista en el catálogo, y el formulario general aparece más abajo en la página.",
  "service-corporate": "El precio indicado es inicial; una cotización puede precisar secciones, contenido e integraciones que requiera cada empresa.",
  "service-ecommerce": "Si tienes necesidades específicas de pagos o inventario, descríbelas en el campo de mensaje del formulario para que se consideren al cotizar.",
  "service-ai": "Las tres opciones rápidas preparan mensajes distintos para WhatsApp. La interacción no ocurre en una conversación de IA embebida.",
  "contact": "El formulario solicita nombre, correo y mensaje; el teléfono y el servicio son opcionales. El contacto se abre mediante WhatsApp y correo.",
  "admin-limits": "Las funciones que sí están implementadas son crear perfiles de administrador, cambiar las credenciales del perfil activo y gestionar sesiones.",
  "admin-clients": "La administración de clientes y conversaciones aún no está implementada; puedo ayudarte a localizar las opciones de contacto que sí existen en Servicios.",
  "assistant": "Puedo resolver dudas usando la información del propio proyecto, pero no consulto Internet ni un modelo de IA. Si necesitas algo fuera de Admin, Inicio o Servicios, dime y trataré de orientarte con lo disponible."
};

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

function normaliseChatText(text) {
  return text
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getAdminHelpResponse(question) {
  const normalisedQuestion = normaliseChatText(question);
  if (/^(hola|buenas|buenos dias|buenas tardes|buenas noches|hey|que tal)$/.test(normalisedQuestion)) {
    return "¡Hola! Aquí estoy para ayudarte. Puedes preguntarme por Admin, Inicio o Servicios; por ejemplo, cómo gestionar accesos, qué planes hay o dónde solicitar una cotización.";
  }

  if (/^(gracias|muchas gracias|te agradezco|perfecto gracias|listo gracias)$/.test(normalisedQuestion)) {
    return "¡Con gusto! Si te surge otra duda de Admin, Inicio o Servicios, pregúntame nomás.";
  }

  if (/^(que puedes hacer|en que me ayudas|como me ayudas|ayuda|ayudame)$/.test(normalisedQuestion)) {
    return "Puedo guiarte por el panel Admin, explicar el contenido de Inicio, comparar los servicios y precios, y encontrar las opciones de contacto. También te diré con claridad cuando una función todavía no exista.";
  }

  const topic = ADMIN_HELP_TOPICS
    .map((candidate) => {
      const keywordScore = Math.max(
        0,
        ...candidate.keywords
          .map(normaliseChatText)
          .filter((keyword) => {
            if (keyword.includes(" ")) return normalisedQuestion.includes(keyword);

            const words = normalisedQuestion.split(" ");
            return words.some((word) =>
              word === keyword ||
              word === `${keyword}s` ||
              word === `${keyword}es` ||
              (keyword.endsWith("s") && word === keyword.slice(0, -1))
            );
          })
          .map((keyword) => keyword.length)
      );

      return {
        candidate,
        score: keywordScore ? keywordScore + (candidate.priority || 0) : 0
      };
    })
    .filter(({ score }) => score > 0)
    .sort((first, second) => second.score - first.score)[0]?.candidate;

  if (topic) {
    lastAdminHelpTopic = topic.id;
    return topic.responses[Math.floor(Math.random() * topic.responses.length)];
  }

  if (
    lastAdminHelpTopic &&
    /^(y|pero|entonces|ahora|ok|okay|vale|claro|bien|mas|dime|explica|detalla|puedes|como asi|y eso|que sigue)/.test(normalisedQuestion)
  ) {
    const followUp = ADMIN_HELP_FOLLOW_UPS[lastAdminHelpTopic];
    if (followUp) return followUp;
  }

  return "No tengo ese detalle a mano todavía, pero podemos ubicarlo juntos. Puedo orientarte sobre las cuentas y sesiones de Admin, la portada y los proyectos de Inicio, o los planes, precios y contacto de Servicios. ¿Qué estabas intentando hacer?";
}

function addChatMessage(text, sender) {
  if (!adminChatMessages) return;

  const message = document.createElement("div");
  message.className = `chat-message ${sender}-message`;

  const label = document.createElement("strong");
  label.textContent = sender === "user" ? "Tú" : "Asistente";

  const content = document.createElement("p");
  content.textContent = text;

  message.append(label, content);
  adminChatMessages.append(message);
  adminChatMessages.scrollTop = adminChatMessages.scrollHeight;
}

function sendAdminChatMessage(question) {
  const trimmedQuestion = question.trim();
  if (!trimmedQuestion || !adminChatMessages) return;

  addChatMessage(trimmedQuestion, "user");
  addChatMessage(getAdminHelpResponse(trimmedQuestion), "assistant");
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
    const currentUser = getCurrentSession()?.user || ADMIN_CREDENTIALS.usuario;
    const currentProfile = users.find((user) => user.usuario === currentUser);

    if (!currentProfile) {
      setMessage(editAdminMessage, "No existe un perfil activo para actualizar.", "error");
      return;
    }

    if (usuarioActual !== currentUser || passwordActual !== currentProfile.password) {
      setMessage(editAdminMessage, "Los datos del perfil actual no coinciden.", "error");
      return;
    }

    const duplicateUser = users.some(
      (user, index) => index !== users.indexOf(currentProfile) && user.usuario === nuevoUsuario
    );

    if (duplicateUser) {
      setMessage(editAdminMessage, "El nuevo usuario ya está en uso.", "error");
      return;
    }

    const profileIndex = users.indexOf(currentProfile);
    users[profileIndex] = { usuario: nuevoUsuario, password: nuevaPassword };
    saveUsers(users);

    const sessions = getStoredSessions().map((entry) =>
      entry.user === currentUser ? { ...entry, user: nuevoUsuario } : entry
    );
    saveSessions(sessions);

    ADMIN_CREDENTIALS = { usuario: nuevoUsuario, password: nuevaPassword };
    setCurrentSession(nuevoUsuario);

    setMessage(editAdminMessage, "Perfil actualizado correctamente.", "success");
    editAdminForm.reset();
    updateSessionList();
  });
}

if (adminChatForm && adminChatInput) {
  adminChatForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const question = adminChatInput.value.trim();
    if (!question) return;

    sendAdminChatMessage(question);
    adminChatForm.reset();
    adminChatInput.focus();
  });
}

if (chatQuestionButtons.length) {
  chatQuestionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const question = button.dataset.chatQuestion;
      if (!question) return;

      sendAdminChatMessage(question);
      adminChatInput?.focus();
    });
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
