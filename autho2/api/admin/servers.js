const { session, json, adminIds } = require("../../lib/oauth")
module.exports = (req, res) => {
  res.setHeader("Cache-Control", "no-store")
  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" })
  try {
    const user = session(req)
    if (!user) return json(res, 401, { error: "Authentication required" })
    if (!adminIds().has(user.user.id)) return json(res, 403, { error: "Administrator access required" })
    return json(res, 200, { servers: user.guilds })
  } catch { return json(res, 503, { error: "Admin service is not configured" }) }
}
