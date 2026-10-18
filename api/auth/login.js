const { methodNotAllowed, readJson, sendJson } = require("../../lib/server/http");
const { getAuthSupabase, getSupabase, sessionCookies } = require("../../lib/server/supabase");

module.exports = async function login(request, response) {
  if (request.method !== "POST") {
    methodNotAllowed(response, ["POST"]);
    return;
  }

  try {
    const { email, password } = await readJson(request);
    if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
      sendJson(response, 400, { error: "Escribe tu correo y contraseña." });
      return;
    }

    const authClient = getAuthSupabase();
    const supabase = getSupabase();
    const { data, error } = await authClient.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password
    });

    if (error || !data.user || !data.session) {
      sendJson(response, 401, { error: "Correo o contraseña incorrectos." });
      return;
    }

    const { data: admin, error: adminError } = await supabase
      .from("admin_users")
      .select("id, email")
      .eq("id", data.user.id)
      .maybeSingle();

    if (adminError) throw adminError;
    if (!admin) {
      await authClient.auth.signOut({ scope: "local" });
      sendJson(response, 403, { error: "La cuenta todavía no está autorizada como administradora." });
      return;
    }

    sendJson(response, 200, { admin }, { "Set-Cookie": sessionCookies(data.session.access_token, data.session.refresh_token) });
  } catch (error) {
    console.error("Error al iniciar sesión administrativa:", error);
    sendJson(response, error.statusCode || 500, { error: error.statusCode ? error.message : "No se pudo iniciar sesión." });
  }
};
