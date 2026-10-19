import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.57.0";
import { getBearerToken, jsonResponse } from "./http.ts";

export function createServiceClient(): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function requireSiteAdmin(
  request: Request
): Promise<{ id: string; email: string } | Response> {
  const token = getBearerToken(request);
  if (!token) return jsonResponse(request, 401, { error: "Inicia sesión para continuar." });
  const supabase = createServiceClient();
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return jsonResponse(request, 401, { error: "La sesión expiró. Inicia sesión de nuevo." });

  const { data: admin, error: adminError } = await supabase
    .from("admin_users")
    .select("id, email")
    .eq("id", user.id)
    .maybeSingle();
  if (adminError) return jsonResponse(request, 500, { error: "No se pudo verificar el permiso administrativo." });
  if (!admin) return jsonResponse(request, 403, { error: "Esta cuenta no tiene permisos de administración." });
  return admin;
}

export function isResponse(value: unknown): value is Response {
  return value instanceof Response;
}
