const MAX_BODY_BYTES = 1024 * 1024;

function requireObjectBody(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    const error = new Error("El cuerpo JSON debe ser un objeto.");
    error.statusCode = 400;
    throw error;
  }
  if (Buffer.byteLength(JSON.stringify(value), "utf8") > MAX_BODY_BYTES) {
    const error = new Error("El contenido enviado supera el tamaño permitido.");
    error.statusCode = 413;
    throw error;
  }
  return value;
}

function sendJson(response, statusCode, body, headers = {}) {
  response.writeHead(statusCode, {
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
    ...headers
  });
  response.end(JSON.stringify(body));
}

async function readJson(request) {
  if (request.body !== undefined) {
    if (typeof request.body === "string") {
      let parsed;
      try {
        parsed = JSON.parse(request.body);
      } catch {
        const error = new Error("El cuerpo de la solicitud debe ser JSON válido.");
        error.statusCode = 400;
        throw error;
      }
      return requireObjectBody(parsed);
    }
    if (!Buffer.isBuffer(request.body)) return requireObjectBody(request.body);
  }

  const chunks = [];
  let size = 0;

  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) {
      const error = new Error("El contenido enviado supera el tamaño permitido.");
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }

  try {
    return requireObjectBody(JSON.parse(Buffer.concat(chunks).toString("utf8")));
  } catch {
    const error = new Error("El cuerpo de la solicitud debe ser JSON válido.");
    error.statusCode = 400;
    throw error;
  }
}

function methodNotAllowed(response, methods) {
  sendJson(response, 405, { error: "Método no permitido." }, { Allow: methods.join(", ") });
}

module.exports = { methodNotAllowed, readJson, sendJson };
