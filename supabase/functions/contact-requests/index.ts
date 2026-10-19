import { createServiceClient, isResponse, requireSiteAdmin } from "../_shared/admin.ts";
import { handleOptions, isAllowedOrigin, jsonResponse } from "../_shared/http.ts";

Deno.serve(async (request: Request) => {
  const options = handleOptions(request);
  if (options) return options;
  if (!isAllowedOrigin(request)) return jsonResponse(request, 403, { error: "Este origen no está autorizado." });

  try {
    const admin = await requireSiteAdmin(request);
    if (isResponse(admin)) return admin;
    const supabase = createServiceClient();

    if (request.method === "GET") {
      const { data, error } = await supabase
        .from("contact_requests")
        .select("id, name, email, phone, service, message, status, created_at")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return jsonResponse(request, 200, { requests: data });
    }

    if (request.method === "POST") {
      const body = await request.json();
      if (!body || typeof body !== "object" || Array.isArray(body) ||
          !Number.isSafeInteger(body.id) || !["new", "contacted"].includes(body.status)) {
        return jsonResponse(request, 400, { error: "La actualización de solicitud no es válida." });
      }
      const { data, error } = await supabase
        .from("contact_requests")
        .update({ status: body.status })
        .eq("id", body.id)
        .select("id, status")
        .maybeSingle();
      if (error) throw error;
      if (!data) return jsonResponse(request, 404, { error: "No se encontró esa solicitud." });
      return jsonResponse(request, 200, { request: data });
    }

    return jsonResponse(request, 405, { error: "Método no permitido." });
  } catch (error) {
    console.error("Error al cargar o actualizar solicitudes:", error);
    return jsonResponse(request, 500, { error: "No se pudieron gestionar las solicitudes." });
  }
});
