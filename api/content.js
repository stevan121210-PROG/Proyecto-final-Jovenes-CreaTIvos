const { methodNotAllowed, readJson, sendJson } = require("../lib/server/http");
const { getSupabase, requireAdmin } = require("../lib/server/supabase");

function isSafePageUrl(value) {
  if (typeof value !== "string") return false;
  if (/^https?:\/\//i.test(value)) {
    try {
      return ["http:", "https:"].includes(new URL(value).protocol);
    } catch {
      return false;
    }
  }
  return /^(?:\/(?!\/)|\.{1,2}\/)[^\s]*$/.test(value);
}

function isSiteContent(value) {
  return value && typeof value === "object" &&
    value.home && typeof value.home === "object" &&
    Array.isArray(value.home.projects) &&
    value.home.projects.every((project) =>
      project && typeof project === "object" &&
      typeof project.name === "string" &&
      typeof project.description === "string" &&
      typeof project.alt === "string" &&
      isSafePageUrl(project.url) &&
      isSafePageUrl(project.image)
    ) &&
    value.services && typeof value.services === "object" &&
    Array.isArray(value.services.packages) &&
    value.services.packages.every((plan) =>
      plan && typeof plan === "object" &&
      typeof plan.name === "string" &&
      typeof plan.price === "string" &&
      Array.isArray(plan.features) &&
      plan.features.every((feature) => typeof feature === "string") &&
      typeof plan.observation === "string"
    ) &&
    typeof value.services.email === "string" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.services.email);
}

module.exports = async function content(request, response) {
  if (request.method === "GET") {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("site_content")
        .select("content")
        .eq("id", 1)
        .maybeSingle();
      if (error) throw error;
      sendJson(response, 200, { content: data?.content || null });
    } catch (error) {
      console.error("Error al cargar el contenido del sitio:", error);
      sendJson(response, error.statusCode || 500, { error: error.statusCode ? error.message : "No se pudo cargar el contenido." });
    }
    return;
  }

  if (request.method !== "PUT") {
    methodNotAllowed(response, ["GET", "PUT"]);
    return;
  }

  try {
    const auth = await requireAdmin(request, response);
    if (!auth) return;
    const body = await readJson(request);
    if (!isSiteContent(body.content)) {
      sendJson(response, 400, { error: "La estructura del contenido del sitio no es válida." });
      return;
    }

    const { error } = await auth.supabase
      .from("site_content")
      .upsert({ id: 1, content: body.content, updated_by: auth.admin.id }, { onConflict: "id" });
    if (error) throw error;
    sendJson(response, 200, { message: "Cambios guardados para todos los visitantes." });
  } catch (error) {
    console.error("Error al guardar el contenido del sitio:", error);
    sendJson(response, error.statusCode || 500, { error: error.statusCode ? error.message : "No se pudieron guardar los cambios." });
  }
};
