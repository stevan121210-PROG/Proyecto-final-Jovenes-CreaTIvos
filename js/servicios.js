// Datos de los paquetes disponibles en ProgramStyle.
const paquetes = [
  {
    nombre: "Landing Page",
    precio: "Desde $2.200.000 COP (aprox. USD 550)",
    caracteristicas: [
      "Diseño responsive para móviles y escritorio",
      "Sección de contacto con formulario",
      "Optimización básica SEO",
      "Integración con WhatsApp para clientes"
    ],
    observacion: "Ideal para presentar tu empresa con presencia profesional en línea."
  },
  {
    nombre: "Sitio Corporativo",
    precio: "Desde $4.500.000 COP (aprox. USD 1.125)",
    caracteristicas: [
      "Múltiples secciones de servicios y equipo",
      "Blog o noticias empresariales",
      "Optimización SEO avanzada",
      "Panel de administración básico"
    ],
    observacion: "Perfecto para empresas que necesitan una presencia digital sólida y escalable."
  },
  {
    nombre: "Descuento especial Landing",
    precio: "40% de descuento en tu siguiente proyecto",
    caracteristicas: [
      "Contrata una Landing Page hoy",
      "Recibe 40% de descuento en tu próximo proyecto",
      "Ideal para fidelizar clientes empresariales",
      "Oferta válida para proyectos posteriores con ProgramStyle"
    ],
    observacion: "Promoción exclusiva: primero una Landing Page y luego un gran ahorro en el siguiente desarrollo."
  },
  {
    nombre: "E-commerce",
    precio: "Desde $7.500.000 COP (aprox. USD 1.875)",
    caracteristicas: [
      "Catálogo de productos con filtros",
      "Pasarela de pago y carrito de compras",
      "Integración de stock y seguimiento de pedidos",
      "Optimización orientada a conversión"
    ],
    observacion: "Para tiendas en línea que desean vender de forma profesional y segura."
  }
];

const WHATSAPP_NUMERO = "573027473875";
const EMAIL_CONTACTO = "Stevan121210@gmail.com";

// Selecciona el contenedor donde se dibujarán las tarjetas del catálogo.
const catalogoContainer = document.getElementById("catalogo-container");

function crearMensajeWhatsApp({ nombre, email, telefono, servicio, mensaje }) {
  const resumen = [
    "Hola, quiero solicitar una cotización.",
    `Nombre: ${nombre}`,
    `Correo: ${email}`,
    telefono ? `Teléfono: ${telefono}` : "Teléfono: No indicado",
    servicio ? `Servicio: ${servicio}` : "Servicio: No especificado",
    `Mensaje: ${mensaje}`
  ].join("\n");

  return `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(resumen)}`;
}

function crearMensajeCorreo({ nombre, email, telefono, servicio, mensaje }) {
  const asunto = encodeURIComponent("Solicitud de cotización ProgramStyle");
  const cuerpo = encodeURIComponent(
    `Nombre: ${nombre}\nCorreo: ${email}\nTeléfono: ${telefono || "No indicado"}\nServicio: ${servicio || "No especificado"}\n\nMensaje:\n${mensaje}`
  );

  return `mailto:${EMAIL_CONTACTO}?subject=${asunto}&body=${cuerpo}`;
}

// Función para crear cada tarjeta de servicio dinámicamente.
function crearTarjeta(paquete) {
  const card = document.createElement("article");
  card.className = "catalog-card";

  const nombre = document.createElement("h3");
  nombre.textContent = paquete.nombre;

  const precio = document.createElement("p");
  precio.className = "precio";
  precio.textContent = paquete.precio;

  const lista = document.createElement("ul");
  paquete.caracteristicas.forEach((item) => {
    const elemento = document.createElement("li");
    elemento.textContent = item;
    lista.appendChild(elemento);
  });

  const nota = document.createElement("p");
  nota.className = "catalog-nota";
  nota.textContent = paquete.observacion;

  const boton = document.createElement("a");
  boton.href = "#";
  boton.className = "btn btn-secondary catalog-cta";
  boton.textContent = "Cotizar este plan";

  card.append(nombre, precio, lista, nota, boton);
  return card;
}

// Renderiza el catálogo completo cuando el DOM está listo.
document.addEventListener("DOMContentLoaded", () => {
  if (!catalogoContainer) return;
  paquetes.forEach((paquete) => {
    const tarjeta = crearTarjeta(paquete);
    catalogoContainer.appendChild(tarjeta);
  });

  const form = document.getElementById("contact-form");
  const feedback = document.getElementById("form-feedback");
  const iaButton = document.getElementById("consultar-ia-btn");
  const iaPanel = document.getElementById("ia-panel");

  if (iaButton && iaPanel) {
    iaButton.addEventListener("click", () => {
      iaPanel.classList.toggle("visible");
    });

    iaPanel.querySelectorAll(".ai-option").forEach((button) => {
      button.addEventListener("click", () => {
        const prompt = button.dataset.prompt || "Necesito asesoría para un proyecto web.";
        const iaLink = crearMensajeWhatsApp({
          nombre: "Cliente con consulta por IA",
          email: "sin-email@consulta.com",
          telefono: "",
          servicio: "Asesoría con IA",
          mensaje: prompt
        });

        window.open(iaLink, "_blank", "noopener,noreferrer");
        feedback.textContent = "Consulta IA enviada por WhatsApp. También puedes escribirnos por correo.";
        feedback.classList.remove("error");
        feedback.classList.add("success");
        iaPanel.classList.remove("visible");
      });
    });
  }

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const nombre = document.getElementById("nombre").value.trim();
      const email = document.getElementById("email").value.trim();
      const telefono = document.getElementById("telefono").value.trim();
      const servicio = document.getElementById("servicio").value;
      const mensaje = document.getElementById("mensaje").value.trim();

      const mensajeError = (texto) => {
        feedback.classList.remove("success");
        feedback.classList.add("error");
        feedback.textContent = texto;
      };

      const mensajeExito = (texto) => {
        feedback.classList.remove("error");
        feedback.classList.add("success");
        feedback.textContent = texto;
      };

      if (!nombre || !email || !mensaje) {
        mensajeError("Por favor completa los campos obligatorios.");
        return;
      }

      if (!validarEmail(email)) {
        mensajeError("Ingresa un correo electrónico válido.");
        return;
      }

      const whatsappLink = crearMensajeWhatsApp({ nombre, email, telefono, servicio, mensaje });
      const correoLink = crearMensajeCorreo({ nombre, email, telefono, servicio, mensaje });

      mensajeExito("Solicitud enviada. Te estamos contactando por WhatsApp y correo.");
      form.reset();

      window.open(whatsappLink, "_blank", "noopener,noreferrer");
      window.location.href = correoLink;

      console.log({ nombre, email, telefono, servicio, mensaje, whatsappLink, correoLink });
    });
  }
});

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
