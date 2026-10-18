const { createClient } = require("@supabase/supabase-js");
const { sendJson } = require("./http");

function getSupabase() {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    const error = new Error("Falta configurar SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.");
    error.statusCode = 503;
    throw error;
  }

  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

function getAuthSupabase() {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    const error = new Error("Falta configurar SUPABASE_URL o SUPABASE_ANON_KEY.");
    error.statusCode = 503;
    throw error;
  }

  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

function getCookie(request, name) {
  const cookieHeader = request.headers.cookie || "";
  for (const cookie of cookieHeader.split(";")) {
    const separator = cookie.indexOf("=");
    if (separator < 0) continue;
    if (cookie.slice(0, separator).trim() === name) {
      return decodeURIComponent(cookie.slice(separator + 1).trim());
    }
  }
  return "";
}

function sessionCookies(accessToken, refreshToken) {
  const secure = process.env.VERCEL ? "; Secure" : "";
  return [
    `ps_access=${encodeURIComponent(accessToken)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=3600${secure}`,
    `ps_refresh=${encodeURIComponent(refreshToken)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000${secure}`
  ];
}

function clearSessionCookies() {
  const secure = process.env.VERCEL ? "; Secure" : "";
  return [
    `ps_access=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`,
    `ps_refresh=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`
  ];
}

async function requireAdmin(request, response) {
  const accessToken = getCookie(request, "ps_access");
  if (!accessToken) {
    sendJson(response, 401, { error: "Inicia sesión para continuar." });
    return null;
  }

  const supabase = getSupabase();
  const { data: authData, error: authError } = await supabase.auth.getUser(accessToken);
  if (authError || !authData.user) {
    sendJson(response, 401, { error: "La sesión expiró. Inicia sesión de nuevo." });
    return null;
  }

  const { data: admin, error: adminError } = await supabase
    .from("admin_users")
    .select("id, email")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (adminError) throw adminError;
  if (!admin) {
    sendJson(response, 403, { error: "Esta cuenta no tiene permisos de administración." });
    return null;
  }

  return { admin, supabase, accessToken };
}

module.exports = {
  clearSessionCookies,
  getAuthSupabase,
  getCookie,
  getSupabase,
  requireAdmin,
  sessionCookies
};
