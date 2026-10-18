const siteContent = window.ProgramStyleContent.get();
const serviceContent = siteContent.services;
const paquetes = serviceContent.packages.map((paquete) => ({
  nombre: paquete.name,
  precio: paquete.price,
  caracteristicas: paquete.features,
  observacion: paquete.observation
}));
const WHATSAPP_NUMERO = serviceContent.whatsapp;
const EMAIL_CONTACTO = serviceContent.email;

// Selecciona el contenedor donde se dibujarán las tarjetas del catálogo.
const catalogoContainer = document.getElementById("catalogo-container");

function crearMensajeWhatsApp({ nombre, email, telefono, servicio, mensaje }) {
  const resumen = [
    serviceContent.requestGreeting,
    `Nombre: ${nombre}`,
    `Correo: ${email}`,
    telefono ? `Teléfono: ${telefono}` : "Teléfono: No indicado",
    servicio ? `Servicio: ${servicio}` : "Servicio: No especificado",
    `Mensaje: ${mensaje}`
  ].join("\n");

  return `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(resumen)}`;
}

function crearMensajeCorreo({ nombre, email, telefono, servicio, mensaje }) {
  const asunto = encodeURIComponent(serviceContent.requestSubject);
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
  boton.href = "#contact-form";
  boton.className = "btn btn-secondary catalog-cta";
  boton.textContent = serviceContent.quoteButtonLabel || "Cotizar este plan";
  boton.addEventListener("click", () => {
    document.getElementById("servicio").value = paquete.nombre;
  });

  card.append(nombre, precio, lista, nota, boton);
  return card;
}

// Renderiza el catálogo completo cuando el DOM está listo.
document.addEventListener("DOMContentLoaded", () => {
  if (!catalogoContainer) return;
  document.getElementById("services-title").textContent = serviceContent.title;
  document.getElementById("services-description").textContent = serviceContent.description;
  document.getElementById("services-ai-title").textContent = serviceContent.aiTitle;
  document.getElementById("services-ai-description").textContent = serviceContent.aiDescription;
  document.getElementById("consultar-ia-btn").textContent = serviceContent.aiButton;
  document.querySelector(".ai-panel-title").textContent = serviceContent.aiPanelTitle;
  document.getElementById("contact-title").textContent = serviceContent.contactTitle;
  document.getElementById("contact-phone-label").textContent = serviceContent.phoneLabel;
  document.getElementById("contact-phone").textContent = serviceContent.phone;
  document.getElementById("contact-phone").href = `https://wa.me/${WHATSAPP_NUMERO}`;
  document.getElementById("contact-email-label").textContent = serviceContent.emailLabel;
  document.getElementById("contact-email").textContent = serviceContent.email;
  document.getElementById("contact-email").href = `mailto:${serviceContent.email}`;
  document.getElementById("contact-note").textContent = serviceContent.contactNote;
  document.getElementById("name-label").textContent = serviceContent.nameLabel;
  document.getElementById("nombre").placeholder = serviceContent.namePlaceholder;
  document.getElementById("nombre").setAttribute("aria-label", serviceContent.nameLabel);
  document.getElementById("email-field-label").textContent = serviceContent.emailFieldLabel;
  document.getElementById("email").placeholder = serviceContent.emailPlaceholder;
  document.getElementById("email").setAttribute("aria-label", serviceContent.emailFieldLabel);
  document.getElementById("phone-field-label").textContent = serviceContent.phoneFieldLabel;
  document.getElementById("telefono").placeholder = serviceContent.phonePlaceholder;
  document.getElementById("telefono").setAttribute("aria-label", serviceContent.phoneFieldLabel);
  document.getElementById("package-field-label").textContent = serviceContent.packageFieldLabel;
  document.getElementById("servicio").setAttribute("aria-label", serviceContent.packageFieldLabel);
  document.getElementById("message-label").textContent = serviceContent.messageLabel;
  document.getElementById("mensaje").placeholder = serviceContent.messagePlaceholder;
  document.getElementById("mensaje").setAttribute("aria-label", serviceContent.messageLabel);
  document.getElementById("contact-submit-label").textContent = serviceContent.submitLabel;

  const serviceSelect = document.getElementById("servicio");
  serviceSelect.replaceChildren();
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = serviceContent.packagePlaceholder;
  serviceSelect.appendChild(defaultOption);
  serviceContent.packages.forEach(({ name }) => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    serviceSelect.appendChild(option);
  });
  const otherOption = document.createElement("option");
  otherOption.value = "Otro";
  otherOption.textContent = serviceContent.otherPackageLabel;
  serviceSelect.appendChild(otherOption);

  paquetes.forEach((paquete) => {
    const tarjeta = crearTarjeta(paquete);
    catalogoContainer.appendChild(tarjeta);
  });

  const form = document.getElementById("contact-form");
  const feedback = document.getElementById("form-feedback");
  const iaButton = document.getElementById("consultar-ia-btn");
  const iaPanel = document.getElementById("ia-panel");
  const aiOptions = document.getElementById("services-ai-options");
  serviceContent.aiOptions.forEach(({ label, prompt }) => {
    const option = document.createElement("button");
    option.type = "button";
    option.className = "ai-option";
    option.dataset.prompt = prompt;
    option.textContent = label;
    aiOptions.appendChild(option);
  });

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
        feedback.textContent = serviceContent.aiSentMessage;
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
        mensajeError(serviceContent.requiredFieldsMessage);
        return;
      }

      if (!validarEmail(email)) {
        mensajeError(serviceContent.invalidEmailMessage);
        return;
      }

      const whatsappLink = crearMensajeWhatsApp({ nombre, email, telefono, servicio, mensaje });
      const correoLink = crearMensajeCorreo({ nombre, email, telefono, servicio, mensaje });

      mensajeExito(serviceContent.requestSentMessage);
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
