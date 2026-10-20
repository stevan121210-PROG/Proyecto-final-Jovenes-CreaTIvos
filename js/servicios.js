import { ProgramStyleContent } from "./site-content.js";
import { invokeFunction, supabase, supabaseConfigError } from "./supabase-client.js";

ProgramStyleContent.load().then((siteContent) => {
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
      `\u{1F44B}\uFE0F ${serviceContent.requestGreeting}`,
      "\u{2728}\uFE0F Me gustaría recibir información para mi proyecto.",
      "",
      "\u{1F4CB}\uFE0F *Mis datos:*",
      `\u{1F464}\uFE0F Nombre: ${nombre}`,
      `\u{1F4E7}\uFE0F Correo: ${email}`,
      telefono ? `\u{1F4F1}\uFE0F Teléfono: ${telefono}` : "\u{1F4F1}\uFE0F Teléfono: No indicado",
      servicio ? `\u{1F4BB}\uFE0F Servicio: ${servicio}` : "\u{1F4BB}\uFE0F Servicio: No especificado",
      "",
      "\u{1F4AC}\uFE0F *Mi solicitud:*",
      mensaje,
      "",
      `¡Gracias! Quedo pendiente. \u{1F64C}\uFE0F`
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
  function renderServices() {
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

    const publicAiForm = document.getElementById("public-ai-form");
    const publicAiInput = document.getElementById("public-ai-input");
    const publicAiMessages = document.getElementById("public-ai-messages");
    const publicAiStatus = document.getElementById("public-ai-status");
    publicAiForm?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const question = publicAiInput.value.trim();
      if (!question) return;
      if (!supabase) {
        publicAiStatus.textContent = supabaseConfigError?.message || "No se pudo conectar la IA.";
        publicAiStatus.classList.add("error");
        return;
      }

      const message = document.createElement("div");
      message.className = "chat-message user-message";
      const userLabel = document.createElement("strong");
      userLabel.textContent = "Tú";
      const userQuestion = document.createElement("p");
      userQuestion.textContent = question;
      message.append(userLabel, userQuestion);
      publicAiMessages.append(message);

      const replyMessage = document.createElement("div");
      replyMessage.className = "chat-message assistant-message";
      const assistantLabel = document.createElement("strong");
      assistantLabel.textContent = "ProgramStyle";
      const reply = document.createElement("p");
      reply.textContent = "Estoy revisando nuestros servicios...";
      replyMessage.append(assistantLabel, reply);
      publicAiMessages.append(replyMessage);
      publicAiMessages.scrollTop = publicAiMessages.scrollHeight;
      publicAiInput.value = "";
      publicAiInput.disabled = true;
      const submitButton = publicAiForm.querySelector("button[type='submit']");
      submitButton.disabled = true;
      publicAiStatus.textContent = "";
      publicAiStatus.classList.remove("error");

      try {
        const data = await invokeFunction("ai-chat", {
          body: { message: question, audience: "public" }
        });
        reply.textContent = data.reply;
      } catch (error) {
        replyMessage.classList.add("error");
        reply.textContent = "No pudimos responder ahora. Inténtalo de nuevo más tarde.";
        publicAiStatus.textContent = `No se pudo conectar con la IA: ${error.message}`;
        publicAiStatus.classList.add("error");
      } finally {
        publicAiInput.disabled = false;
        submitButton.disabled = false;
        publicAiInput.focus();
        publicAiMessages.scrollTop = publicAiMessages.scrollHeight;
      }
    });

    const contentLoadError = ProgramStyleContent.getLoadError();
    const contentStatus = document.getElementById("site-content-status");
    if (contentLoadError && contentStatus) {
      contentStatus.textContent = `No se pudo conectar con el contenido actualizado. Se muestran los datos predeterminados. ${contentLoadError.message}`;
      contentStatus.classList.remove("hidden");
      contentStatus.classList.add("error");
    }

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
      form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const nombre = document.getElementById("nombre").value.trim();
        const email = document.getElementById("email").value.trim();
        const telefono = document.getElementById("telefono").value.trim();
        const servicio = document.getElementById("servicio").value;
        const mensaje = document.getElementById("mensaje").value.trim();

        const mostrarEnlacesContacto = () => {
          const salto = document.createElement("br");
          const whatsappLink = document.createElement("a");
          whatsappLink.className = "btn btn-secondary form-contact-action";
          whatsappLink.href = crearMensajeWhatsApp({ nombre, email, telefono, servicio, mensaje });
          whatsappLink.target = "_blank";
          whatsappLink.rel = "noopener noreferrer";
          whatsappLink.textContent = "Continuar por WhatsApp";

          const emailLink = document.createElement("a");
          emailLink.className = "btn btn-secondary form-contact-action";
          emailLink.href = crearMensajeCorreo({ nombre, email, telefono, servicio, mensaje });
          emailLink.textContent = "Enviar por correo";

          feedback.append(salto, whatsappLink, document.createTextNode(" "), emailLink);
        };

        const mensajeError = (texto, showContactLinks = false) => {
          feedback.classList.remove("success");
          feedback.classList.add("error");
          feedback.textContent = texto;
          if (showContactLinks) mostrarEnlacesContacto();
        };

        const mensajeExito = (texto) => {
          feedback.classList.remove("error");
          feedback.classList.add("success");
          feedback.textContent = texto;
          mostrarEnlacesContacto();
        };

        if (!nombre || !email || !mensaje) {
          mensajeError(serviceContent.requiredFieldsMessage);
          return;
        }

        if (!validarEmail(email)) {
          mensajeError(serviceContent.invalidEmailMessage);
          return;
        }

        if (!supabase) {
          mensajeError(
            supabaseConfigError?.message || "No se pudo conectar con el servidor de solicitudes.",
            true
          );
          return;
        }

        const submitButton = form.querySelector("button[type='submit']");
        submitButton.disabled = true;
        feedback.textContent = "Enviando tu solicitud...";
        feedback.classList.remove("error", "success");

        try {
          await invokeFunction("contact-request", {
            body: { name: nombre, email, phone: telefono, service: servicio, message: mensaje }
          });
          mensajeExito("Tu solicitud quedó registrada en el panel Admin. Elige cómo quieres continuar:");
          form.reset();
        } catch (error) {
          mensajeError(
            `No se pudo registrar tu solicitud: ${error.message}. Puedes continuar por uno de estos medios.`,
            true
          );
        } finally {
          submitButton.disabled = false;
        }
      });
    }
  }

  function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderServices, { once: true });
  } else {
    renderServices();
  }
}).catch((error) => {
  console.error("No se pudieron iniciar los servicios:", error);
  const contentStatus = document.getElementById("site-content-status");
  if (contentStatus) {
    contentStatus.textContent = `No se pudieron cargar los servicios: ${error.message}`;
    contentStatus.classList.remove("hidden");
    contentStatus.classList.add("error");
  }
});
