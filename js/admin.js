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
const siteContentForm = document.getElementById("site-content-form");
const siteContentField = document.getElementById("site-content-field");
const siteContentValue = document.getElementById("site-content-value");
const siteContentSelect = document.getElementById("site-content-custom-select");
const siteContentSelectTrigger = document.getElementById("site-content-select-trigger");
const siteContentSelectLabel = document.getElementById("site-content-selected-label");
const siteContentOptions = document.getElementById("site-content-options");
const changePreview = document.getElementById("admin-change-preview");
const changeTitle = document.getElementById("admin-change-title");
const changeDescription = document.getElementById("admin-change-description");
const confirmChangeBtn = document.getElementById("confirm-admin-change-btn");
const cancelChangeBtn = document.getElementById("cancel-admin-change-btn");

let siteContent = window.ProgramStyleContent.get();
let pendingAdminChange = null;

let lastAdminHelpTopic = null;

const ADMIN_HELP_TOPICS = [
  {
    id: "admin-create",
    keywords: ["crear administrador", "crear un administrador", "agregar administrador", "agregar un administrador", "agrego un administrador", "añadir administrador", "nuevo administrador", "otro administrador", "sumar un administrador", "crear usuario", "nuevo usuario", "otro usuario", "añadir usuario", "crear una cuenta", "nuevo perfil"],
    responses: [
      "Para sumar a otra persona, abre “Agregar nuevo administrador”, completa usuario y contraseña y pulsa “Crear perfil”. Después revisa la propuesta: el perfil solo se guarda cuando confirmas. En esta demo queda solo en el navegador.",
      "¡Claro! Despliega “Agregar nuevo administrador” y completa el formulario, pero no pegues la contraseña en el chat. Al preparar el perfil podrás revisar la propuesta y confirmar; los nombres repetidos no se aceptan."
    ]
  },
  {
    id: "admin-credentials",
    keywords: ["credenciales", "cambiar contraseña", "actualizar contraseña", "cambiar usuario", "editar perfil", "cambiar mi clave", "cambiar clave", "clave", "mi contraseña", "mi usuario"],
    responses: [
      "Puedes cambiar ambos datos desde “Editar credenciales”: confirma tu usuario y contraseña actuales y escribe los nuevos. El panel te mostrará una vista previa antes de guardar el cambio.",
      "Para renovar tu acceso, abre “Editar credenciales”. Al preparar el cambio podrás revisar el nuevo usuario; las credenciales solo se actualizan cuando confirmas."
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
    id: "local-editor",
    priority: 10,
    keywords: ["editar el sitio", "editar inicio", "editar servicios", "editar precios", "editar la pagina", "cambiar contenido", "modificar contenido", "guardar cambios", "confirmar cambios", "publicar cambios", "guardar en este navegador"],
    responses: [
      "Puedes pedirme un cambio con tus palabras o prepararlo en “Preparar un cambio del sitio”. Primero te mostraré una vista previa; solo al pulsar “Confirmar y guardar” se aplicará. En esta versión queda guardado en este navegador, no publicado en Internet.",
      "Sí, puedo ayudarte a modificar el contenido de Inicio o Servicios. Descríbeme qué dato quieres cambiar y por cuál; revisarás la propuesta antes de confirmarla. Este modo local guarda en el navegador, pero no sube el sitio."
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
      "En “Servicios” encontrarás los planes de desarrollo y mantenimiento. Hay precios de referencia y puedes pedir una cotización desde esa página.",
      "La página “Servicios” reúne opciones para crear sitios y mantenerlos. Si me cuentas qué tipo de proyecto tienes, te ayudo a ubicar el plan que más se parece."
    ]
  },
  {
    id: "service-maintenance",
    keywords: ["mantenimiento web", "mantenimiento de pagina", "mantenimiento de sitio", "mantener mi pagina", "mantener el sitio", "descuento mantenimiento", "descuento del 10%", "10% de descuento"],
    responses: [
      "Sí, añadimos el plan “Mantenimiento Web”. Tiene cotización personalizada y ofrece 10% de descuento si el sitio que se mantiene —Landing Page, Sitio Corporativo o E-commerce— fue desarrollado por ProgramStyle.",
      "El mantenimiento web ya aparece en Servicios. El 10% de descuento aplica únicamente si la Landing Page, el Sitio Corporativo o el E-commerce fue creado por ProgramStyle; el precio se define por cotización."
    ]
  },
  {
    id: "service-discount",
    keywords: ["descuento", "promocion", "25%", "oferta"],
    responses: [
      "En “Servicios” aparece una promoción de 25% de descuento para un proyecto posterior, después de contratar una Landing Page. La descripción la presenta como una oferta para proyectos posteriores con ProgramStyle; confirma las condiciones al cotizar.",
      "La promoción publicada es 25% de descuento en el siguiente proyecto al contratar primero una Landing Page. Como los precios y condiciones pueden variar, lo mejor es confirmarlo al solicitar la cotización."
    ]
  },
  {
    id: "service-prices",
    priority: 8,
    keywords: ["precio", "precios", "cuanto cuesta", "cuanto vale", "presupuesto", "valor de", "dolares", "pesos"],
    responses: [
      "En “Servicios” se publican estos precios: Landing Page $1.500.000 COP, Sitio Corporativo $4.300.000 COP, E-commerce $3.000.000 COP y Mantenimiento Web $350.000 COP. Puedes pedir una cotización desde esa página.",
      "Los precios actuales del catálogo son: Landing Page $1.500.000 COP, Sitio Corporativo $4.300.000 COP, E-commerce $3.000.000 COP y Mantenimiento Web $350.000 COP."
    ]
  },
  {
    id: "service-landing",
    keywords: ["landing", "pagina de aterrizaje", "pagina para captar clientes"],
    responses: [
      "La Landing Page está pensada para presentar un negocio y captar clientes. Incluye diseño adaptable, formulario de contacto, SEO básico e integración con WhatsApp; cuesta $1.500.000 COP.",
      "Si buscas una página enfocada en una sola propuesta y en conseguir contactos, la Landing Page puede encajar. El plan menciona diseño responsive, contacto, SEO básico y WhatsApp, por $1.500.000 COP."
    ]
  },
  {
    id: "service-corporate",
    keywords: ["corporativo", "sitio empresarial", "pagina empresarial", "empresa", "blog", "equipo"],
    responses: [
      "El Sitio Corporativo es para una empresa que necesita varias secciones, por ejemplo servicios, equipo y noticias. Incluye SEO avanzado y un panel de administración básico; cuesta $4.300.000 COP.",
      "Para una presencia empresarial más completa, el plan corporativo contempla varias secciones, blog o noticias, SEO avanzado y un panel Admin básico. Su precio es $4.300.000 COP."
    ]
  },
  {
    id: "service-ecommerce",
    keywords: ["ecommerce", "e-commerce", "tienda online", "tienda en linea", "carrito", "pasarela de pago", "vender productos"],
    responses: [
      "Para vender en línea está el plan E-commerce: incluye catálogo con filtros, carrito y pasarela de pago, gestión de stock y seguimiento de pedidos. Cuesta $3.000.000 COP.",
      "El E-commerce es la opción de tienda en línea. El catálogo menciona productos con filtros, pagos, carrito, inventario y seguimiento de pedidos, por $3.000.000 COP."
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
      "Ahora puedes preparar cambios para el contenido de Inicio y Servicios, incluidos planes y precios, desde “Preparar un cambio del sitio”. Se muestra una vista previa y tienes que confirmar; esta versión solo guarda en el navegador. Las tarjetas de Solicitudes y Clientes siguen siendo informativas.",
      "Para editar el catálogo o la portada, prepara el cambio desde este panel y confirma la vista previa. Se guarda localmente, no se publica; la gestión de solicitudes y clientes aún no está implementada."
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
  "admin-create": "Cuando tengas usuario y contraseña listos, abre el desplegable “Agregar nuevo administrador”. El panel te mostrará los datos de la cuenta (sin revelar la contraseña) y pedirá confirmación antes de guardarla localmente.",
  "admin-credentials": "Ten a mano tus credenciales actuales: el formulario las verifica antes de preparar los nuevos datos. Revísalos y confirma para aplicar el cambio en este navegador.",
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
  "admin-limits": "Puedes editar contenido de Inicio y Servicios en modo local, además de crear perfiles, cambiar credenciales y gestionar sesiones. Las solicitudes y clientes aún no tienen una bandeja de administración.",
  "admin-clients": "La administración de clientes y conversaciones aún no está implementada; puedo ayudarte a localizar las opciones de contacto que sí existen en Servicios.",
  "assistant": "Puedo resolver dudas usando la información del propio proyecto, pero no consulto Internet ni un modelo de IA. Si necesitas algo fuera de Admin, Inicio o Servicios, dime y trataré de orientarte con lo disponible.",
  "local-editor": "Puedes editar títulos, descripciones, datos de proyectos, planes, precios, características, contacto y consultas rápidas. Las propuestas requieren confirmación y solo se guardan en este navegador."
};

const CONTENT_FIELD_LABELS = {
  "home.title": "Inicio · título principal",
  "home.description": "Inicio · descripción principal",
  "home.servicesButton": "Inicio · botón de Servicios",
  "home.adminButton": "Inicio · botón de Admin",
  "home.projectsLabel": "Inicio · etiqueta de proyectos",
  "home.projectsTitle": "Inicio · título de proyectos",
  "home.projectsDescription": "Inicio · descripción de proyectos",
  "services.title": "Servicios · título principal",
  "services.description": "Servicios · introducción",
  "services.aiTitle": "Servicios · título de asistencia",
  "services.aiDescription": "Servicios · descripción de asistencia",
  "services.aiButton": "Servicios · botón de asistencia",
  "services.aiPanelTitle": "Servicios · título de consultas rápidas",
  "services.contactTitle": "Servicios · título de contacto",
  "services.phoneLabel": "Servicios · etiqueta del teléfono",
  "services.phone": "Servicios · teléfono de contacto",
  "services.whatsapp": "Servicios · número de WhatsApp",
  "services.emailLabel": "Servicios · etiqueta del correo",
  "services.email": "Servicios · correo de contacto",
  "services.contactNote": "Servicios · nota de contacto",
  "services.nameLabel": "Servicios · etiqueta del nombre",
  "services.namePlaceholder": "Servicios · ejemplo para el nombre",
  "services.emailFieldLabel": "Servicios · etiqueta del correo del formulario",
  "services.emailPlaceholder": "Servicios · ejemplo para el correo",
  "services.phoneFieldLabel": "Servicios · etiqueta del teléfono del formulario",
  "services.phonePlaceholder": "Servicios · ejemplo para el teléfono",
  "services.packageFieldLabel": "Servicios · etiqueta del plan",
  "services.packagePlaceholder": "Servicios · opción inicial del selector",
  "services.otherPackageLabel": "Servicios · opción Otro del selector",
  "services.messageLabel": "Servicios · etiqueta del mensaje",
  "services.messagePlaceholder": "Servicios · ejemplo para el mensaje",
  "services.submitLabel": "Servicios · botón del formulario",
  "services.quoteButtonLabel": "Servicios · botón para cotizar un plan",
  "services.requestGreeting": "Servicios · saludo de la solicitud",
  "services.requestSubject": "Servicios · asunto del correo de solicitud",
  "services.aiSentMessage": "Servicios · confirmación de consulta rápida",
  "services.requestSentMessage": "Servicios · confirmación de solicitud",
  "services.requiredFieldsMessage": "Servicios · aviso de campos obligatorios",
  "services.invalidEmailMessage": "Servicios · aviso de correo no válido"
};

function getSiteContentFields() {
  const fields = Object.entries(CONTENT_FIELD_LABELS).map(([path, label]) => ({ path, label }));

  siteContent.home.projects.forEach((project, index) => {
    const prefix = `home.projects.${index}`;
    ["name", "description", "url", "image", "alt"].forEach((key) => {
      fields.push({ path: `${prefix}.${key}`, label: `Inicio · ${project.name} · ${key}` });
    });
  });

  siteContent.services.packages.forEach((pack, index) => {
    const prefix = `services.packages.${index}`;
    fields.push({ path: `${prefix}.name`, label: `Servicios · ${pack.name} · nombre` });
    fields.push({ path: `${prefix}.price`, label: `Servicios · ${pack.name} · precio` });
    fields.push({ path: `${prefix}.features`, label: `Servicios · ${pack.name} · características (una por línea)` });
    fields.push({ path: `${prefix}.observation`, label: `Servicios · ${pack.name} · descripción` });
  });

  siteContent.services.aiOptions.forEach((option, index) => {
    const prefix = `services.aiOptions.${index}`;
    fields.push({ path: `${prefix}.label`, label: `Servicios · consulta rápida ${index + 1} · nombre` });
    fields.push({ path: `${prefix}.prompt`, label: `Servicios · consulta rápida ${index + 1} · mensaje` });
  });

  return fields;
}

function getValueAtPath(object, path) {
  return path.split(".").reduce((value, key) => value[key], object);
}

function setValueAtPath(object, path, value) {
  const keys = path.split(".");
  const property = keys.pop();
  const target = keys.reduce((current, key) => current[key], object);
  target[property] = value;
}

function isSafeContentValue(path, value) {
  if (typeof value !== "string" || !value.trim()) return false;
  if (/\.(url|image)$/.test(path)) {
    return /^(https?:\/\/|\.{1,2}\/|\/)/i.test(value.trim());
  }
  if (path === "services.email") return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  if (path === "services.phone" || path === "services.whatsapp") {
    return /^\+?\d{8,15}$/.test(value.trim().replace(/[\s()-]/g, ""));
  }
  return true;
}

function renderContentFieldOptions() {
  if (!siteContentField) return;
  siteContentField.replaceChildren();
  siteContentOptions?.replaceChildren();

  getSiteContentFields().forEach(({ path, label }) => {
    const option = document.createElement("option");
    option.value = path;
    option.textContent = label;
    siteContentField.appendChild(option);

    const menuOption = document.createElement("button");
    menuOption.type = "button";
    menuOption.className = "custom-select-option";
    menuOption.id = `site-content-option-${siteContentOptions.children.length}`;
    menuOption.dataset.value = path;
    menuOption.setAttribute("role", "option");
    menuOption.setAttribute("aria-selected", "false");
    menuOption.textContent = label;
    menuOption.addEventListener("click", () => selectContentField(path));
    siteContentOptions?.appendChild(menuOption);
  });

  updateContentFieldValue();
}

function selectContentField(path) {
  if (!siteContentField) return;
  siteContentField.value = path;
  updateContentFieldValue();
  closeContentFieldMenu();
  siteContentSelectTrigger?.focus();
}

function openContentFieldMenu() {
  if (!siteContentOptions || !siteContentSelectTrigger) return;
  siteContentOptions.classList.remove("hidden");
  siteContentSelectTrigger.setAttribute("aria-expanded", "true");
  const selectedOption = siteContentOptions.querySelector('[aria-selected="true"]') || siteContentOptions.firstElementChild;
  selectedOption?.scrollIntoView({ block: "nearest" });
}

function closeContentFieldMenu() {
  if (!siteContentOptions || !siteContentSelectTrigger) return;
  siteContentOptions.classList.add("hidden");
  siteContentSelectTrigger.setAttribute("aria-expanded", "false");
}

function updateContentFieldValue() {
  if (!siteContentField || !siteContentValue) return;
  const value = getValueAtPath(siteContent, siteContentField.value);
  siteContentValue.value = Array.isArray(value) ? value.join("\n") : value;

  if (siteContentSelectLabel) {
    siteContentSelectLabel.textContent = siteContentField.selectedOptions[0]?.textContent || "Selecciona un dato";
  }
  siteContentOptions?.querySelectorAll(".custom-select-option").forEach((option) => {
    const isSelected = option.dataset.value === siteContentField.value;
    option.setAttribute("aria-selected", String(isSelected));
  });
}

function stageAdminChange(change) {
  if (pendingAdminChange) {
    return false;
  }

  pendingAdminChange = change;
  changeTitle.textContent = change.title;
  changeDescription.textContent = change.description;
  changePreview.classList.remove("hidden");
  changePreview.scrollIntoView({ behavior: "smooth", block: "nearest" });
  return true;
}

function stageSiteContentChange(path, rawValue, source) {
  const value = Array.isArray(getValueAtPath(siteContent, path))
    ? rawValue.split(/\r?\n/).map((entry) => entry.trim()).filter(Boolean)
    : rawValue.trim();

  if (!Array.isArray(value) && !isSafeContentValue(path, value)) {
    return false;
  }

  const updatedContent = JSON.parse(JSON.stringify(siteContent));
  const previousValue = getValueAtPath(siteContent, path);
  setValueAtPath(updatedContent, path, value);
  if (path === "services.phone" || path === "services.whatsapp") {
    const phoneDigits = value.replace(/\D/g, "");
    if (path === "services.phone") {
      updatedContent.services.whatsapp = phoneDigits;
    } else {
      updatedContent.services.phone = `+${phoneDigits}`;
    }
  }
  const field = getSiteContentFields().find((entry) => entry.path === path);
  const readablePreviousValue = Array.isArray(previousValue) ? previousValue.join(", ") : previousValue;
  const readableValue = Array.isArray(value) ? value.join(", ") : value;
  const phoneSyncNotice = path === "services.phone" || path === "services.whatsapp"
    ? "\nTambién se actualizará el enlace de WhatsApp y el número visible para mantenerlos sincronizados."
    : "";
  return stageAdminChange({
    type: "site-content",
    content: updatedContent,
    title: "Revisa el cambio propuesto",
    description: `${field?.label || path}\nAntes: “${readablePreviousValue}”\nNuevo: “${readableValue}”.${phoneSyncNotice}${source === "chat" ? "\nPropuesta preparada a partir de tu mensaje." : ""}`
  });
}

function confirmPendingAdminChange() {
  if (!pendingAdminChange) return;

  try {
    if (pendingAdminChange.type === "site-content") {
      window.ProgramStyleContent.save(pendingAdminChange.content);
      siteContent = pendingAdminChange.content;
      renderContentFieldOptions();
      siteContentForm?.reset();
      updateContentFieldValue();
      addChatMessage("¡Listo! El cambio quedó guardado en este navegador. Recarga Inicio o Servicios para verlo. Todavía no está publicado ni subido al sitio.", "assistant");
    } else if (pendingAdminChange.type === "admin-create") {
      const users = getStoredUsers();
      if (users.some((user) => user.usuario === pendingAdminChange.user.usuario)) {
        addChatMessage("No guardé la cuenta: ese usuario ya existe. Cancela esta propuesta y prepara otra con un nombre distinto.", "assistant");
        return;
      }
      users.push(pendingAdminChange.user);
      saveUsers(users);
      createAdminForm?.reset();
      setMessage(createAdminMessage, "Nuevo administrador guardado en este navegador.", "success");
      addChatMessage(`La cuenta “${pendingAdminChange.user.usuario}” quedó guardada localmente después de tu confirmación. No se ha publicado ni sincronizado con otros dispositivos.`, "assistant");
    } else if (pendingAdminChange.type === "admin-profile") {
      const users = getStoredUsers();
      const currentIndex = users.findIndex((user) => user.usuario === pendingAdminChange.currentUser);
      if (currentIndex < 0) {
        addChatMessage("No guardé el cambio porque el perfil actual ya no está disponible.", "assistant");
        return;
      }
      users[currentIndex] = pendingAdminChange.profile;
      saveUsers(users);

      const sessions = getStoredSessions().map((entry) =>
        entry.user === pendingAdminChange.currentUser ? { ...entry, user: pendingAdminChange.profile.usuario } : entry
      );
      saveSessions(sessions);
      ADMIN_CREDENTIALS = { ...pendingAdminChange.profile };
      setCurrentSession(pendingAdminChange.profile.usuario);
      editAdminForm?.reset();
      updateSessionList();
      setMessage(editAdminMessage, "Credenciales guardadas en este navegador.", "success");
      addChatMessage("Credenciales actualizadas tras tu confirmación. El cambio es local a este navegador.", "assistant");
    }
  } catch (error) {
    addChatMessage(`No se pudo guardar el cambio en este navegador: ${error.message}`, "assistant");
    return;
  }

  pendingAdminChange = null;
  changePreview.classList.add("hidden");
}

function cancelPendingAdminChange() {
  if (!pendingAdminChange) return;
  pendingAdminChange = null;
  changePreview.classList.add("hidden");
  createAdminForm?.reset();
  editAdminForm?.reset();
  addChatMessage("Propuesta cancelada. No guardé ningún cambio.", "assistant");
}

function getRequestedContentChange(question) {
  const normalisedQuestion = normaliseChatText(question);
  if (!/\b(cambia|cambiar|actualiza|actualizar|modifica|modificar|edita|editar|pon|poner|reemplaza|reemplazar)\b/.test(normalisedQuestion)) {
    return null;
  }

  const matches = Array.from(question.matchAll(/\b(?:a|por)\s+/gi));
  if (!matches.length) return null;
  const lastConnector = matches[matches.length - 1];
  const value = question.slice(lastConnector.index + lastConnector[0].length).trim().replace(/[?.!]+$/, "");
  if (!value) return null;

  let path = null;
  const selectedProjectIndex = siteContent.home.projects.findIndex((project) =>
    normalisedQuestion.includes(normaliseChatText(project.name))
  );
  const selectedPackageIndex = siteContent.services.packages.findIndex((pack) => {
    const name = normaliseChatText(pack.name);
    if (normalisedQuestion.includes(name)) return true;
    if (name.includes("landing") && /\blanding\b/.test(normalisedQuestion)) return true;
    if (name.includes("corporativo") && /\b(corporativo|empresa)\b/.test(normalisedQuestion)) return true;
    if (name.includes("e commerce") && /\b(e commerce|tienda en linea|tienda online)\b/.test(normalisedQuestion)) return true;
    return name.includes("descuento") && /\b(descuento|promocion|oferta)\b/.test(normalisedQuestion);
  });

  if (selectedProjectIndex >= 0) {
    const property = /\b(nombre|titulo)\b/.test(normalisedQuestion)
      ? "name"
      : /\b(link|enlace|url|direccion)\b/.test(normalisedQuestion)
        ? "url"
        : /\b(imagen|foto)\b/.test(normalisedQuestion)
          ? "image"
          : "description";
    path = `home.projects.${selectedProjectIndex}.${property}`;
  } else if (selectedPackageIndex >= 0) {
    const property = /\b(precio|valor|costo)\b/.test(normalisedQuestion)
      ? "price"
      : /\b(caracteristica|incluye|incluyen|beneficio)\b/.test(normalisedQuestion)
        ? "features"
        : /\b(nombre|titulo)\b/.test(normalisedQuestion)
          ? "name"
          : "observation";
    path = `services.packages.${selectedPackageIndex}.${property}`;
  } else if (/\b(correo|email)\b/.test(normalisedQuestion)) {
    path = "services.email";
  } else if (/\b(whatsapp|telefono)\b/.test(normalisedQuestion)) {
    path = "services.phone";
  } else if (/\b(precio|valor|costo)\b/.test(normalisedQuestion) && selectedPackageIndex < 0) {
    return null;
  } else if (/\b(titulo|encabezado)\b/.test(normalisedQuestion)) {
    path = /\b(asistencia|ia)\b/.test(normalisedQuestion)
      ? "services.aiTitle"
      : /\b(contacto)\b/.test(normalisedQuestion)
        ? "services.contactTitle"
        : /\b(proyectos|casos de exito)\b/.test(normalisedQuestion)
          ? "home.projectsTitle"
          : /\b(servicios|planes|catalogo)\b/.test(normalisedQuestion)
            ? "services.title"
            : "home.title";
  } else if (/\b(proyectos|casos de exito)\b/.test(normalisedQuestion) && /\b(descripcion|texto)\b/.test(normalisedQuestion)) {
    path = "home.projectsDescription";
  } else if (/\b(descripcion|texto|introduccion)\b/.test(normalisedQuestion)) {
    path = /\b(contacto|cotizacion)\b/.test(normalisedQuestion)
      ? "services.contactNote"
      : /\b(asistencia|ia)\b/.test(normalisedQuestion)
        ? "services.aiDescription"
        : /\b(servicios|planes|catalogo)\b/.test(normalisedQuestion)
          ? "services.description"
          : /\b(inicio|portada|principal)\b/.test(normalisedQuestion)
            ? "home.description"
            : null;
  } else if (/\b(etiqueta|boton|nombre del boton)\b/.test(normalisedQuestion)) {
    path = /\b(contacto|solicitud)\b/.test(normalisedQuestion)
      ? "services.submitLabel"
      : /\b(admin|administrador)\b/.test(normalisedQuestion)
        ? "home.adminButton"
        : /\b(servicios)\b/.test(normalisedQuestion)
          ? "home.servicesButton"
          : /\b(cotizar|plan)\b/.test(normalisedQuestion)
            ? "services.quoteButtonLabel"
            : "services.aiButton";
  }

  return path ? { path, value } : null;
}

function getSafeCreateAdminGuidance() {
  const createPanel = document.getElementById("create-admin-panel");
  createPanel?.classList.remove("hidden-panel");
  createPanel?.scrollIntoView({ behavior: "smooth", block: "center" });
  return "Puedo acompañarte, pero no escribas contraseñas en el chat. Abre “Agregar nuevo administrador”, completa el formulario del panel y pulsa “Crear perfil”; te mostraré una vista previa y la cuenta solo se guardará cuando confirmes.";
}

function getDynamicAdminHelpResponse(topic) {
  const packages = siteContent.services.packages;

  if (topic.id === "service-prices") {
    const prices = packages.map(({ name, price }) => `${name}: ${price}`).join("; ");
    return `Los precios que aparecen ahora en Servicios son: ${prices}. Son los valores guardados en este navegador y pueden variar según el proyecto.`;
  }

  if (topic.id === "service-overview") {
    const names = packages.map(({ name }) => name).join(", ");
    return `En Servicios tienes estas opciones: ${names}. Puedes editar sus datos desde “Preparar un cambio del sitio”; los cambios solo se aplican tras confirmarlos.`;
  }

  if (topic.id === "service-maintenance") {
    const plan = packages.find(({ name }) => normaliseChatText(name).includes("mantenimiento"));
    if (plan) {
      return `${plan.name}: ${plan.price}. ${plan.observation} Incluye: ${plan.features.join("; ")}.`;
    }
  }

  const packageIndexByTopic = {
    "service-landing": 0,
    "service-corporate": 1,
    "service-discount": 2,
    "service-ecommerce": 3
  };
  const packageIndex = packageIndexByTopic[topic.id];
  if (packageIndex !== undefined && packages[packageIndex]) {
    const selectedPackage = packages[packageIndex];
    const features = selectedPackage.features.join("; ");
    return `${selectedPackage.name}: ${selectedPackage.price}. ${selectedPackage.observation} Incluye: ${features}.`;
  }

  if (topic.id === "home-projects") {
    const projects = siteContent.home.projects
      .map(({ name, description }) => `${name}: ${description}`)
      .join(" ");
    return `En Inicio aparecen estos proyectos: ${projects}`;
  }

  if (topic.id === "home") {
    return `La portada de Inicio dice “${siteContent.home.title}”. ${siteContent.home.description} Desde allí puedes usar “${siteContent.home.servicesButton}” o bajar a “${siteContent.home.projectsTitle}”.`;
  }

  if (topic.id === "contact") {
    return `Los datos actuales de contacto en Servicios son ${siteContent.services.phone} y ${siteContent.services.email}. ${siteContent.services.contactNote}`;
  }

  if (topic.id === "service-ai") {
    const options = siteContent.services.aiOptions.map(({ label }) => label).join(", ");
    return `${siteContent.services.aiTitle}: ${siteContent.services.aiDescription} Las consultas rápidas disponibles son: ${options}. Al elegir una se prepara el mensaje para WhatsApp.`;
  }

  return null;
}

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
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "panel-message";
    emptyMessage.textContent = "No hay sesiones registradas.";
    sessionList.replaceChildren(emptyMessage);
    return;
  }

  const sessionItems = sessions.map((entry) => {
    const statusClass = entry.status === "active" ? "active" : "unauthorized";
    const label = entry.status === "active" ? "Activa" : "No autorizada";
    const item = document.createElement("div");
    item.className = "session-item";
    item.dataset.user = entry.user;
    item.dataset.status = entry.status;
    item.tabIndex = 0;

    const user = document.createElement("strong");
    user.textContent = entry.user;

    const badge = document.createElement("span");
    badge.className = `badge ${statusClass}`;
    badge.textContent = label;

    item.append(user, badge);
    return item;
  });
  sessionList.replaceChildren(...sessionItems);

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
    return "¡Hola! Aquí estoy para ayudarte. Puedes preguntarme por Admin, Inicio o Servicios; también puedes pedirme un cambio, revisar la propuesta y decidir si quieres guardarla localmente.";
  }

  if (/^(gracias|muchas gracias|te agradezco|perfecto gracias|listo gracias)$/.test(normalisedQuestion)) {
    return "¡Con gusto! Si te surge otra duda de Admin, Inicio o Servicios, pregúntame nomás.";
  }

  if (/^(que puedes hacer|en que me ayudas|como me ayudas|ayuda|ayudame)$/.test(normalisedQuestion)) {
    return "Puedo guiarte por Admin, Inicio y Servicios; editar títulos, descripciones, proyectos, precios, características y datos de contacto; y ayudarte a preparar cuentas admin. Antes de guardar cualquier propuesta te pediré confirmación. En este modo los cambios solo quedan en este navegador, no se publican.";
  }

  if (/\b(crear|agregar|añadir|sumar)\b/.test(normalisedQuestion) && /\b(admin|administrador|usuario|cuenta)\b/.test(normalisedQuestion)) {
    lastAdminHelpTopic = "admin-create";
    return getSafeCreateAdminGuidance();
  }

  const requestedChange = getRequestedContentChange(question);
  if (requestedChange) {
    lastAdminHelpTopic = "local-editor";
    if (pendingAdminChange) return "Primero confirma o cancela la propuesta que ya está pendiente; así no se mezclan cambios.";

    return stageSiteContentChange(requestedChange.path, requestedChange.value, "chat")
      ? "Preparé una vista previa del cambio. Revísala y pulsa “Confirmar y guardar” si estás de acuerdo; puedes cancelarla sin guardar. Se quedará en este navegador, no se publicará."
      : "No pude preparar ese cambio: revisa que el contenido no esté vacío y que los enlaces, el correo o el número tengan un formato válido.";
  }

  if (
    /\b(cambia|cambiar|actualiza|actualizar|modifica|modificar|edita|editar|pon|poner|reemplaza|reemplazar)\b/.test(normalisedQuestion) &&
    /\b(titulo|precio|descripcion|proyecto|servicio|contacto|correo|email|telefono|whatsapp|caracteristica|boton|nombre)\b/.test(normalisedQuestion)
  ) {
    lastAdminHelpTopic = "local-editor";
    if (/\b(precio|valor|costo)\b/.test(normalisedQuestion)) {
      return "¿De cuál plan quieres cambiar el precio: Landing Page, Sitio Corporativo, promoción o E-commerce? Indica también el valor nuevo y te prepararé la vista previa.";
    }
    return "¡Dale! Dime el dato y su nuevo valor, por ejemplo: “Cambia el título de Inicio a Sitios para crecer”. También puedes elegir cualquier campo en “Preparar un cambio del sitio”. Primero verás la propuesta; solo se guarda al confirmarla.";
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
    return getDynamicAdminHelpResponse(topic) || topic.responses[Math.floor(Math.random() * topic.responses.length)];
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

    if (pendingAdminChange) {
      setMessage(createAdminMessage, "Confirma o cancela la propuesta pendiente antes de preparar otra.", "error");
      return;
    }

    const staged = stageAdminChange({
      type: "admin-create",
      user: { usuario: nombre, password },
      title: "Confirma la nueva cuenta administrativa",
      description: `Se creará el usuario “${nombre}”. La contraseña no se muestra en la vista previa.`
    });
    if (staged) {
      setMessage(createAdminMessage, "Propuesta lista. La cuenta solo se guardará al confirmar.", "success");
      addChatMessage(`Tengo lista la propuesta para crear “${nombre}”. Revisa la vista previa y confirma si quieres guardarla localmente.`, "assistant");
    }
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

    if (pendingAdminChange) {
      setMessage(editAdminMessage, "Confirma o cancela la propuesta pendiente antes de preparar otra.", "error");
      return;
    }

    const staged = stageAdminChange({
      type: "admin-profile",
      currentUser,
      profile: { usuario: nuevoUsuario, password: nuevaPassword },
      title: "Confirma la actualización de credenciales",
      description: `El usuario “${currentUser}” cambiará a “${nuevoUsuario}”. La contraseña no se muestra en la vista previa.`
    });
    if (staged) {
      setMessage(editAdminMessage, "Propuesta lista. Las credenciales solo cambiarán al confirmar.", "success");
      addChatMessage("Preparé la actualización de credenciales. Revisa los usuarios en la vista previa y confirma para guardarla en este navegador.", "assistant");
    }
  });
}

if (siteContentSelectTrigger) {
  siteContentSelectTrigger.addEventListener("click", () => {
    const isExpanded = siteContentSelectTrigger.getAttribute("aria-expanded") === "true";
    if (isExpanded) closeContentFieldMenu();
    else openContentFieldMenu();
  });

  siteContentSelectTrigger.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeContentFieldMenu();
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openContentFieldMenu();
      const options = Array.from(siteContentOptions.querySelectorAll(".custom-select-option"));
      const selectedIndex = options.findIndex((option) => option.dataset.value === siteContentField.value);
      const nextIndex = event.key === "ArrowUp"
        ? Math.max(0, selectedIndex - 1)
        : event.key === "ArrowDown"
          ? Math.min(options.length - 1, selectedIndex + 1)
          : selectedIndex;
      options[nextIndex]?.focus();
    }
  });
}

if (siteContentOptions) {
  siteContentOptions.addEventListener("keydown", (event) => {
    const options = Array.from(siteContentOptions.querySelectorAll(".custom-select-option"));
    const currentIndex = options.indexOf(document.activeElement);
    let nextIndex = currentIndex;

    if (event.key === "ArrowDown") nextIndex = Math.min(options.length - 1, currentIndex + 1);
    else if (event.key === "ArrowUp") nextIndex = Math.max(0, currentIndex - 1);
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = options.length - 1;
    else if (event.key === "Escape") {
      closeContentFieldMenu();
      siteContentSelectTrigger?.focus();
      return;
    } else {
      return;
    }

    event.preventDefault();
    options[nextIndex]?.focus();
  });
}

if (siteContentSelect) {
  document.addEventListener("click", (event) => {
    if (!siteContentSelect.contains(event.target)) closeContentFieldMenu();
  });
}

if (siteContentForm && siteContentField && siteContentValue) {
  siteContentForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (pendingAdminChange) {
      addChatMessage("Confirma o cancela la propuesta pendiente antes de preparar otra.", "assistant");
      return;
    }

    if (stageSiteContentChange(siteContentField.value, siteContentValue.value, "editor")) {
      addChatMessage("Ya está lista la vista previa. Revísala y confirma si quieres guardar este cambio localmente.", "assistant");
    } else {
      addChatMessage("No pude preparar el cambio. Comprueba que no esté vacío y que el enlace, correo o teléfono tenga un formato válido.", "assistant");
    }
  });
}

if (confirmChangeBtn) {
  confirmChangeBtn.addEventListener("click", confirmPendingAdminChange);
}

if (cancelChangeBtn) {
  cancelChangeBtn.addEventListener("click", cancelPendingAdminChange);
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
renderContentFieldOptions();

if (getCurrentSession()?.loggedIn) {
  if (loginSection) loginSection.classList.add("hidden");
  if (adminDashboard) {
    adminDashboard.classList.remove("hidden");
    adminDashboard.classList.add("visible");
  }
}
