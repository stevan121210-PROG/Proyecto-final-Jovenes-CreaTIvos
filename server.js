const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 3000);
const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp"
};
const API_ROUTES = new Map([
  ["/api/admins", path.join(ROOT, "api", "admins.js")],
  ["/api/auth/login", path.join(ROOT, "api", "auth", "login.js")],
  ["/api/auth/logout", path.join(ROOT, "api", "auth", "logout.js")],
  ["/api/auth/session", path.join(ROOT, "api", "auth", "session.js")],
  ["/api/content", path.join(ROOT, "api", "content.js")]
]);
const PUBLIC_DIRECTORIES = ["assets", "css", "html", "js"];

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  throw new RangeError(`Puerto no válido: ${process.env.PORT}`);
}

function sendText(request, response, statusCode, message) {
  response.writeHead(statusCode, {
    "Content-Type": "text/plain; charset=utf-8",
    "X-Content-Type-Options": "nosniff"
  });
  response.end(request.method === "HEAD" ? undefined : message);
}

const server = http.createServer((request, response) => {
  let requestPath;
  try {
    requestPath = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  } catch {
    sendText(request, response, 400, "La ruta solicitada no es válida.");
    return;
  }

  if (requestPath.includes("\0")) {
    sendText(request, response, 400, "La ruta solicitada no es válida.");
    return;
  }

  const apiHandler = API_ROUTES.get(requestPath.replace(/\/+$/, ""));
  if (apiHandler) {
    try {
      const handler = require(apiHandler);
      Promise.resolve(handler(request, response)).catch((error) => {
        console.error("Error al procesar la solicitud de API:", error);
        if (!response.headersSent) {
          response.writeHead(500, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
          response.end(JSON.stringify({ error: "No se pudo procesar la solicitud." }));
        }
      });
    } catch (error) {
      console.error("No se pudo cargar la función de API:", error);
      response.writeHead(500, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
      response.end(JSON.stringify({ error: "No se pudo iniciar la función de API." }));
    }
    return;
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    response.setHeader("Allow", "GET, HEAD");
    sendText(request, response, 405, "Método no permitido.");
    return;
  }

  const aliases = {
    "/": "/html/index.html",
    "/index.html": "/html/index.html",
    "/servicios.html": "/html/servicios.html",
    "/admin.html": "/html/admin.html"
  };
  requestPath = aliases[requestPath] || requestPath;
  if (requestPath === "/") {
    requestPath = "/html/index.html";
  }

  const filePath = path.resolve(ROOT, `.${requestPath}`);
  const relativePath = path.relative(ROOT, filePath);
  const publicRoot = relativePath.split(path.sep)[0];
  if (
    relativePath === ".." ||
    relativePath.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relativePath) ||
    !PUBLIC_DIRECTORIES.includes(publicRoot)
  ) {
    sendText(request, response, 403, "Acceso denegado.");
    return;
  }

  fs.stat(filePath, (statError, stats) => {
    if (statError) {
      if (statError.code === "ENOENT" || statError.code === "ENOTDIR") {
        sendText(request, response, 404, "No se encontró la página solicitada.");
        return;
      }
      console.error("No se pudo consultar el archivo solicitado:", statError);
      sendText(request, response, 500, "No se pudo procesar la solicitud.");
      return;
    }

    const resolvedFilePath = stats.isDirectory() ? path.join(filePath, "index.html") : filePath;
    fs.readFile(resolvedFilePath, (readError, contents) => {
      if (readError) {
        if (readError.code === "ENOENT" || readError.code === "EISDIR") {
          sendText(request, response, 404, "No se encontró la página solicitada.");
          return;
        }
        console.error("No se pudo leer el archivo solicitado:", readError);
        sendText(request, response, 500, "No se pudo procesar la solicitud.");
        return;
      }

      response.writeHead(200, {
        "Content-Length": contents.length,
        "Content-Type": MIME_TYPES[path.extname(resolvedFilePath).toLowerCase()] || "application/octet-stream",
        "Cache-Control": "no-cache",
        "X-Content-Type-Options": "nosniff"
      });
      response.end(request.method === "HEAD" ? undefined : contents);
    });
  });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`ProgramStyle disponible en http://localhost:${PORT}`);
  console.log("Presiona Ctrl+C para detener el servidor.");
});

server.on("error", (error) => {
  console.error("No se pudo iniciar el servidor local:", error);
  process.exitCode = 1;
});
