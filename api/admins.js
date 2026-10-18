const { methodNotAllowed, readJson, sendJson } = require("../lib/server/http");
const { requireAdmin } = require("../lib/server/supabase");

module.exports = async function admins(request, response) {
  try {
    const auth = await requireAdmin(request, response);
    if (!auth) return;

    if (request.method === "GET") {
      const { data, error } = await auth.supabase
        .from("admin_users")
        .select("id, email, created_at")
        .order("created_at", { ascending: true });
      if (error) throw error;
      sendJson(response, 200, { admins: data });
      return;
    }

    if (request.method === "POST") {
      const { email, password } = await readJson(request);
      if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        sendJson(response, 400, { error: "Escribe un correo electrónico válido." });
        return;
      }
      if (typeof password !== "string" || password.length < 12) {
        sendJson(response, 400, { error: "La contraseña debe tener al menos 12 caracteres." });
        return;
      }

      const normalizedEmail = email.trim().toLowerCase();
      const created = await auth.supabase.auth.admin.createUser({
        email: normalizedEmail,
        password,
        email_confirm: true
      });
      if (created.error) {
        sendJson(response, 400, { error: created.error.message });
        return;
      }

      const { error: insertError } = await auth.supabase
        .from("admin_users")
        .insert({ id: created.data.user.id, email: normalizedEmail });
      if (insertError) {
        const rollback = await auth.supabase.auth.admin.deleteUser(created.data.user.id);
        if (rollback.error) console.error("No se pudo revertir el usuario administrativo creado:", rollback.error);
        throw insertError;
      }

      sendJson(response, 201, { admin: { id: created.data.user.id, email: normalizedEmail } });
      return;
    }

    if (request.method === "PATCH") {
      const { email, password } = await readJson(request);
      if ((email !== undefined && (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))) ||
          (password !== undefined && (typeof password !== "string" || password.length < 12)) ||
          (email === undefined && password === undefined)) {
        sendJson(response, 400, { error: "Indica un correo válido o una contraseña de al menos 12 caracteres." });
        return;
      }

      const updates = {};
      if (email !== undefined) {
        updates.email = email.trim().toLowerCase();
        updates.email_confirm = true;
      }
      if (password !== undefined) updates.password = password;

      const updated = await auth.supabase.auth.admin.updateUserById(auth.admin.id, updates);
      if (updated.error) {
        sendJson(response, 400, { error: updated.error.message });
        return;
      }

      const updatedEmail = updates.email || auth.admin.email;
      const { error: updateError } = await auth.supabase
        .from("admin_users")
        .update({ email: updatedEmail })
        .eq("id", auth.admin.id);
      if (updateError) throw updateError;
      sendJson(response, 200, { admin: { id: auth.admin.id, email: updatedEmail } });
      return;
    }

    if (request.method === "DELETE") {
      const targetId = new URL(request.url, "http://localhost").searchParams.get("id");
      if (!targetId || targetId === auth.admin.id) {
        sendJson(response, 400, { error: "No puedes eliminar tu propia cuenta desde esta acción." });
        return;
      }

      const { count, error: countError } = await auth.supabase
        .from("admin_users")
        .select("id", { count: "exact", head: true });
      if (countError) throw countError;
      if ((count || 0) <= 1) {
        sendJson(response, 409, { error: "Debe quedar al menos una cuenta administradora." });
        return;
      }

      const { data: target, error: targetError } = await auth.supabase
        .from("admin_users")
        .select("id")
        .eq("id", targetId)
        .maybeSingle();
      if (targetError) throw targetError;
      if (!target) {
        sendJson(response, 404, { error: "No se encontró esa cuenta administradora." });
        return;
      }

      const deleted = await auth.supabase.auth.admin.deleteUser(targetId);
      if (deleted.error) throw deleted.error;
      sendJson(response, 200, { message: "Cuenta administradora eliminada." });
      return;
    }

    methodNotAllowed(response, ["GET", "POST", "PATCH", "DELETE"]);
  } catch (error) {
    console.error("Error al gestionar cuentas administrativas:", error);
    sendJson(response, error.statusCode || 500, { error: error.statusCode ? error.message : "No se pudo completar la operación de administración." });
  }
};
