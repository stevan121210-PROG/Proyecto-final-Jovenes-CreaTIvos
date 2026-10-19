export function corsHeaders(request: Request): HeadersInit {
  const origin = request.headers.get("origin");
  const allowedOrigins = (Deno.env.get("ALLOWED_ORIGINS") ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const originAllowed = !origin || allowedOrigins.includes(origin);

  return {
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info, x-supabase-api-version",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
    "Vary": "Origin",
    ...(origin && originAllowed ? { "Access-Control-Allow-Origin": origin } : {})
  };
}

export function jsonResponse(
  request: Request,
  status: number,
  body: Record<string, unknown>
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: corsHeaders(request)
  });
}

export function isAllowedOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const allowedOrigins = (Deno.env.get("ALLOWED_ORIGINS") ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  return allowedOrigins.includes(origin);
}

export function handleOptions(request: Request): Response | null {
  if (request.method !== "OPTIONS") return null;
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}

export function getBearerToken(request: Request): string | null {
  const authorization = request.headers.get("authorization") ?? "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

export async function checkRateLimit(
  supabase: { rpc: (name: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: Error | null }> },
  scope: string,
  request: Request,
  maxRequests: number,
  windowSeconds: number
): Promise<boolean> {
  const clientIp = request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-real-ip") ??
    "unknown";
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(clientIp));
  const identifier = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  const { data, error } = await supabase.rpc("consume_api_rate_limit", {
    p_scope: scope,
    p_identifier: identifier,
    p_max_requests: maxRequests,
    p_window_seconds: windowSeconds
  });
  if (error) throw error;
  return data === true;
}

export function validateAllowedOrigin(request: Request): Response | null {
  if (isAllowedOrigin(request)) return null;
  return jsonResponse(request, 403, { error: "Este origen no está autorizado para usar el servicio." });
}
