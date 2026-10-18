const { sendJson, methodNotAllowed } = require("../../lib/server/http");
const { getAuthSupabase, getCookie, getSupabase, sessionCookies } = require("../../lib/server/supabase");

module.exports = async function session(request, response) {
  if (request.method !== "GET") {
    methodNotAllowed(response, ["GET"]);
    return;
  }

  try {
    const authClient = getAuthSupabase();
    const supabase = getSupabase();
    let accessToken = getCookie(request, "ps_access");
    let refreshToken = getCookie(request, "ps_refresh");
    if (!accessToken && !refreshToken) {
      sendJson(response, 401, { error: "No hay una sesión activa." });
      return;
    }

    let { data, error } = accessToken
      ? await authClient.auth.getUser(accessToken)
      : { data: { user: null }, error: new Error("Falta renovar sesión.") };
    let cookies;

    if (error || !data.user) {
      if (!refreshToken) {
        sendJson(response, 401, { error: "La sesión expiró. Inicia sesión de nuevo." });
        return;
      }

      const refreshed = await authClient.auth.refreshSession({ refresh_token: refreshToken });
      if (refreshed.error || !refreshed.data.user || !refreshed.data.session) {
        sendJson(response, 401, { error: "La sesión expiró. Inicia sesión de nuevo." });
        return;
      }
      data = { user: refreshed.data.user };
      accessToken = refreshed.data.session.access_token;
      refreshToken = refreshed.data.session.refresh_token;
      cookies = sessionCookies(accessToken, refreshToken);
    }

    const { data: admin, error: adminError } = await supabase
      .from("admin_users")
      .select("id, email")
      .eq("id", data.user.id)
      .maybeSingle();

    if (adminError) throw adminError;
    if (!admin) {
      sendJson(response, 403, { error: "Esta cuenta no tiene permisos de administración." });
      return;
    }

    sendJson(response, 200, { admin }, cookies ? { "Set-Cookie": cookies } : {});
  } catch (error) {
    console.error("Error al verificar sesión administrativa:", error);
    sendJson(response, error.statusCode || 500, { error: error.statusCode ? error.message : "No se pudo verificar la sesión." });
  }
};
