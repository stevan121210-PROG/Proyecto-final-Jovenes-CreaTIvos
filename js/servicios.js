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

// Selecciona el contenedor donde se dibujarán las tarjetas del catálogo.
const catalogoContainer = document.getElementById("catalogo-container");

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

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const nombre = document.getElementById("nombre").value.trim();
      const email = document.getElementById("email").value.trim();
      const telefono = document.getElementById("telefono").value.trim();
      const servicio = document.getElementById("servicio").value;
      const mensaje = document.getElementById("mensaje").value.trim();

      if (!nombre || !email || !mensaje) {
        feedback.textContent = "Por favor completa los campos obligatorios.";
        return;
      }

      if (!validarEmail(email)) {
        feedback.textContent = "Ingresa un correo electrónico válido.";
        return;
      }

      feedback.textContent = "Solicitud enviada. Pronto nos pondremos en contacto contigo.";
      form.reset();

      // Aquí puedes extender la lógica para enviar los datos a un servidor.
      console.log({ nombre, email, telefono, servicio, mensaje });
    });
  }
});

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
