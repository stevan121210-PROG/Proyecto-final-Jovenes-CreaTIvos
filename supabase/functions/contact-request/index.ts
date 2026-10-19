import { createServiceClient } from "../_shared/admin.ts";
import { checkRateLimit, handleOptions, isAllowedOrigin, jsonResponse } from "../_shared/http.ts";

function validText(value: unknown, maxLength: number): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= maxLength;
}

Deno.serve(async (request: Request) => {
  const options = handleOptions(request);
  if (options) return options;
  if (!isAllowedOrigin(request)) return jsonResponse(request, 403, { error: "Este origen no está autorizado." });
  if (request.method !== "POST") return jsonResponse(request, 405, { error: "Método no permitido." });

  try {
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return jsonResponse(request, 400, { error: "El cuerpo JSON debe ser un objeto." });
    }
    if (!validText(body.name, 120) || !validText(body.email, 254) ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim()) ||
        !validText(body.message, 5000)) {
      return jsonResponse(request, 400, { error: "Revisa el nombre, el correo y el mensaje; todos son obligatorios." });
    }
    if ((body.phone !== undefined && body.phone !== "" && (typeof body.phone !== "string" || body.phone.length > 40)) ||
        (body.service !== undefined && body.service !== "" && (typeof body.service !== "string" || body.service.length > 120))) {
      return jsonResponse(request, 400, { error: "El teléfono o el servicio supera el tamaño permitido." });
    }

    const supabase = createServiceClient();
    if (!(await checkRateLimit(supabase, "contact-request", request, 5, 900))) {
      return jsonResponse(request, 429, { error: "Se alcanzó el límite temporal de solicitudes. Inténtalo más tarde." });
    }

    const { error } = await supabase.from("contact_requests").insert({
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      phone: typeof body.phone === "string" ? body.phone.trim() || null : null,
      service: typeof body.service === "string" ? body.service.trim() || null : null,
      message: body.message.trim()
    });
    if (error) throw error;
    return jsonResponse(request, 201, { message: "Solicitud recibida." });
  } catch (error) {
    console.error("Error al registrar una solicitud de contacto:", error);
    return jsonResponse(request, 500, { error: "No se pudo registrar la solicitud. Inténtalo de nuevo." });
  }
});
