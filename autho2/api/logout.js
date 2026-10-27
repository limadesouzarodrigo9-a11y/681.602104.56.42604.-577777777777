const { clearCookie, json } = require("../lib/oauth")
module.exports = (req, res) => {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" })
  const origin = req.headers.origin
  const host = req.headers.host
  if (!origin || !host || new URL(origin).host !== host) return json(res, 403, { error: "Invalid request origin" })
  clearCookie(res, "zend_session"); return json(res, 200, { ok: true })
}
