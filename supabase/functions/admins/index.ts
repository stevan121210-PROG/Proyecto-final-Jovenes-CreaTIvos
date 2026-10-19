import { isResponse, requireSiteAdmin, createServiceClient } from "../_shared/admin.ts";
import { handleOptions, isAllowedOrigin, jsonResponse } from "../_shared/http.ts";

Deno.serve(async (request: Request) => {
  const options = handleOptions(request);
  if (options) return options;
  if (!isAllowedOrigin(request)) return jsonResponse(request, 403, { error: "Este origen no está autorizado." });
  if (request.method !== "GET" && request.method !== "POST") {
    return jsonResponse(request, 405, { error: "Método no permitido." });
  }

  try {
    const admin = await requireSiteAdmin(request);
    if (isResponse(admin)) return admin;
    const supabase = createServiceClient();

    if (request.method === "GET") {
      const { data, error } = await supabase
        .from("admin_users")
        .select("id, email, created_at")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return jsonResponse(request, 200, { admins: data });
    }

    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return jsonResponse(request, 400, { error: "El cuerpo JSON debe ser un objeto." });
    }

    if (body.action === "create") {
      if (typeof body.email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) {
        return jsonResponse(request, 400, { error: "Escribe un correo electrónico válido." });
      }
      if (typeof body.password !== "string" || body.password.length < 12) {
        return jsonResponse(request, 400, { error: "La contraseña debe tener al menos 12 caracteres." });
      }

      const email = body.email.trim().toLowerCase();
      const created = await supabase.auth.admin.createUser({
        email,
        password: body.password,
        email_confirm: true
      });
      if (created.error) return jsonResponse(request, 400, { error: created.error.message });

      const { error } = await supabase
        .from("admin_users")
        .insert({ id: created.data.user.id, email });
      if (error) {
        const rollback = await supabase.auth.admin.deleteUser(created.data.user.id);
        if (rollback.error) console.error("No se pudo revertir la nueva cuenta:", rollback.error);
        throw error;
      }
      return jsonResponse(request, 201, { admin: { id: created.data.user.id, email } });
    }

    if (body.action === "update-profile") {
      const updates: { email?: string; password?: string; email_confirm?: boolean } = {};
      if (body.email !== undefined) {
        if (typeof body.email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) {
          return jsonResponse(request, 400, { error: "Escribe un correo electrónico válido." });
        }
        updates.email = body.email.trim().toLowerCase();
        updates.email_confirm = true;
      }
      if (body.password !== undefined) {
        if (typeof body.password !== "string" || body.password.length < 12) {
          return jsonResponse(request, 400, { error: "La contraseña debe tener al menos 12 caracteres." });
        }
        updates.password = body.password;
      }
      if (!Object.keys(updates).length) {
        return jsonResponse(request, 400, { error: "Indica un correo o una contraseña nueva." });
      }

      const updated = await supabase.auth.admin.updateUserById(admin.id, updates);
      if (updated.error) return jsonResponse(request, 400, { error: updated.error.message });
      const email = updates.email ?? admin.email;
      const { error } = await supabase.from("admin_users").update({ email }).eq("id", admin.id);
      if (error) throw error;
      return jsonResponse(request, 200, { admin: { id: admin.id, email } });
    }

    if (body.action === "delete") {
      if (typeof body.id !== "string" || body.id === admin.id) {
        return jsonResponse(request, 400, { error: "No puedes eliminar tu propia cuenta desde esta acción." });
      }
      const { count, error: countError } = await supabase
        .from("admin_users")
        .select("id", { count: "exact", head: true });
      if (countError) throw countError;
      if ((count ?? 0) <= 1) {
        return jsonResponse(request, 409, { error: "Debe quedar al menos una cuenta administradora." });
      }
      const { data: target, error } = await supabase
        .from("admin_users")
        .select("id")
        .eq("id", body.id)
        .maybeSingle();
      if (error) throw error;
      if (!target) return jsonResponse(request, 404, { error: "No se encontró esa cuenta administradora." });
      const deleted = await supabase.auth.admin.deleteUser(body.id);
      if (deleted.error) throw deleted.error;
      return jsonResponse(request, 200, { message: "Cuenta administradora eliminada." });
    }

    return jsonResponse(request, 400, { error: "La acción de administración no es válida." });
  } catch (error) {
    console.error("Error en la función de administradores:", error);
    return jsonResponse(request, 500, { error: "No se pudo completar la operación administrativa." });
  }
});
