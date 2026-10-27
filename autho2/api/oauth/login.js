const { crypto, encode, setCookie, redirectUri } = require("../../lib/oauth")
module.exports = (req, res) => {
  if (req.method !== "GET") return res.status(405).end()
  try {
    if (!process.env.DISCORD_CLIENT_ID || !process.env.DISCORD_CLIENT_SECRET) throw new Error("Discord OAuth credentials are not configured")
    const state = crypto.randomBytes(32).toString("base64url")
    setCookie(res, "zend_oauth_state", encode({ state, exp: Date.now() + 10 * 60 * 1000 }), 600)
    const url = new URL("https://discord.com/oauth2/authorize")
    url.search = new URLSearchParams({ client_id: process.env.DISCORD_CLIENT_ID, redirect_uri: redirectUri(), response_type: "code", scope: "identify guilds", state }).toString()
    res.statusCode = 302; res.setHeader("Cache-Control", "no-store"); res.setHeader("Location", url.toString()); res.end()
  } catch { res.status(500).send("Autenticação temporariamente indisponível.") }
}
