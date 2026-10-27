const { cookie, decode, clearCookie, encode, setCookie, redirectUri, discord, crypto } = require("../../lib/oauth")
module.exports = async (req, res) => {
  if (req.method !== "GET") return res.status(405).end()
  const url = new URL(req.url, "https://oauth.invalid")
  const clear = () => clearCookie(res, "zend_oauth_state")
  try {
    const stateCookie = decode(cookie(req, "zend_oauth_state"))
    const state = url.searchParams.get("state") || ""
    const expectedState = Buffer.from(stateCookie?.state || "")
    const receivedState = Buffer.from(state)
    if (!stateCookie?.state || expectedState.length !== receivedState.length || !crypto.timingSafeEqual(expectedState, receivedState)) { clear(); return res.redirect("/?error=state") }
    if (url.searchParams.has("error") || !url.searchParams.get("code")) { clear(); return res.redirect("/?error=cancelled") }
    const token = await discord("/oauth2/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ client_id: process.env.DISCORD_CLIENT_ID || "", client_secret: process.env.DISCORD_CLIENT_SECRET || "", grant_type: "authorization_code", code: url.searchParams.get("code"), redirect_uri: redirectUri() }) })
    if (!token.access_token) throw new Error("Discord did not issue an access token")
    const headers = { Authorization: `Bearer ${token.access_token}` }
    const [user, guilds] = await Promise.all([discord("/users/@me", { headers }), discord("/users/@me/guilds", { headers })])
    const manageableGuilds = guilds.filter(guild => guild.owner || (BigInt(guild.permissions || "0") & (8n | 32n)) !== 0n).map(guild => ({ id: guild.id, name: guild.name, owner: Boolean(guild.owner) })).slice(0, 200)
    const data = { exp: Date.now() + 7 * 24 * 60 * 60 * 1000, user: { id: user.id, username: user.global_name || user.username, avatar: user.avatar || null }, guilds: manageableGuilds, isAdmin: new Set(String(process.env.ADMIN_DISCORD_IDS || "").split(",").map(id => id.trim())).has(user.id) }
    setCookie(res, "zend_session", encode(data), 7 * 24 * 60 * 60)
    clear(); res.setHeader("Cache-Control", "no-store"); res.setHeader("Referrer-Policy", "no-referrer"); return res.redirect("/")
  } catch (error) { clear(); console.error("[oauth] Callback failed:", error.message); return res.redirect("/?error=oauth") }
}
