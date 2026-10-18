const { methodNotAllowed, sendJson } = require("../../lib/server/http");
const { clearSessionCookies, getCookie, getSupabase } = require("../../lib/server/supabase");

module.exports = async function logout(request, response) {
  if (request.method !== "POST") {
    methodNotAllowed(response, ["POST"]);
    return;
  }

  try {
    const accessToken = getCookie(request, "ps_access");
    if (accessToken) {
      const supabase = getSupabase();
      const { error } = await supabase.auth.admin.signOut(accessToken);
      if (error) throw error;
    }
    sendJson(response, 200, { message: "Sesión cerrada." }, { "Set-Cookie": clearSessionCookies() });
  } catch (error) {
    console.error("Error al cerrar sesión administrativa:", error);
    sendJson(response, 500, { error: "No se pudo cerrar la sesión de forma segura." }, { "Set-Cookie": clearSessionCookies() });
  }
};
