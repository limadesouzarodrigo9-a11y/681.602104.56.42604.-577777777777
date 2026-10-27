const { session, json, adminIds } = require("../lib/oauth")
module.exports = (req, res) => {
  res.setHeader("Cache-Control", "no-store")
  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" })
  try { const data = session(req); return json(res, 200, data ? { authenticated: true, user: data.user, guilds: data.guilds, isAdmin: adminIds().has(data.user.id) } : { authenticated: false }) }
  catch { return json(res, 503, { error: "Session service is not configured" }) }
}
