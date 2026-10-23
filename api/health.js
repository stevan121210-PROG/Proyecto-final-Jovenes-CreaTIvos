const { jsonResponse } = require("./_lib/http");

module.exports = function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return jsonResponse(response, 405, { error: "Método no permitido." });
  }

  return jsonResponse(response, 200, {
    status: "ok",
    service: "programstyle-vercel-api"
  });
};
