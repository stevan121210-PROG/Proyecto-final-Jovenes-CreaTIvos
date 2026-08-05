// Datos de los paquetes disponibles en ProgramStyle.
const paquetes = [
  {
    nombre: "Landing Page",
    precio: "Desde $450.000 CLP",
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
    precio: "Desde $950.000 CLP",
    caracteristicas: [
      "Múltiples secciones de servicios y equipo",
      "Blog o noticias empresariales",
      "Optimización SEO avanzada",
      "Panel de administración básico"
    ],
    observacion: "Perfecto para empresas que necesitan una presencia digital sólida y escalable."
  },
  {
    nombre: "E-commerce",
    precio: "Desde $1.600.000 CLP",
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
});
