import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseConfigError = !supabaseUrl || !supabaseAnonKey
  ? new Error("Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY para conectar el sitio con Supabase.")
  : null;

export const supabase = supabaseConfigError
  ? null
  : createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true
    }
  });

export async function invokeFunction(functionName, options = {}) {
  if (!supabase) throw supabaseConfigError;
  const { data, error } = await supabase.functions.invoke(functionName, options);
  if (error) {
    let message = error.message;
    if (error.context && typeof error.context.json === "function") {
      const details = await error.context.json().catch(() => null);
      if (typeof details?.error === "string") message = details.error;
    }
    throw new Error(message || `Falló la función ${functionName}.`);
  }
  return data;
}
