const crypto = require("node:crypto")
const cookieName = "zend_session"
function secret() { const value = process.env.SESSION_SECRET || ""; if (Buffer.byteLength(value) < 32) throw new Error("SESSION_SECRET must contain at least 32 bytes"); return value }
function sign(value) { return crypto.createHmac("sha256", secret()).update(value).digest("base64url") }
function encode(value) { const payload = Buffer.from(JSON.stringify(value)).toString("base64url"); return `${payload}.${sign(payload)}` }
function decode(value) {
  const [payload, signature, extra] = String(value || "").split(".")
  if (!payload || !signature || extra) return null
  const expected = sign(payload)
  const a = Buffer.from(signature), b = Buffer.from(expected)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null
  try { const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")); return data.exp > Date.now() ? data : null } catch { return null }
}
function cookie(req, name) { return String(req.headers.cookie || "").split(";").map(x => x.trim()).find(x => x.startsWith(`${name}=`))?.slice(name.length + 1) || "" }
function setCookie(res, name, value, maxAge) { const secure = process.env.NODE_ENV === "production" ? "; Secure" : ""; const cookieValue = `${name}=${value}; Path=/; HttpOnly${secure}; SameSite=Lax; Max-Age=${maxAge}`; const existing = res.getHeader?.("Set-Cookie"); const cookies = existing ? (Array.isArray(existing) ? existing : [existing]) : []; cookies.push(cookieValue); res.setHeader("Set-Cookie", cookies) }
function clearCookie(res, name) { setCookie(res, name, "", 0) }
function json(res, status, body) { res.statusCode = status; res.setHeader("Content-Type", "application/json; charset=utf-8"); res.setHeader("Cache-Control", "no-store"); res.end(JSON.stringify(body)) }
function redirectUri() { const uri = process.env.DISCORD_REDIRECT_URI; if (!uri) throw new Error("DISCORD_REDIRECT_URI is required"); const parsed = new URL(uri); if (parsed.protocol !== "https:" && process.env.NODE_ENV === "production") throw new Error("OAuth callback must use HTTPS in production"); return parsed.toString() }
async function discord(path, init) { const response = await fetch(`https://discord.com/api/v10${path}`, { ...init, signal: AbortSignal.timeout(10000) }); const data = await response.json().catch(() => ({})); if (!response.ok) throw new Error(`Discord API returned ${response.status}`); return data }
function session(req) { return decode(cookie(req, cookieName)) }
function adminIds() { return new Set(String(process.env.ADMIN_DISCORD_IDS || "").split(",").map(id => id.trim()).filter(id => /^\d{17,20}$/.test(id))) }
module.exports = { crypto, cookieName, sign, encode, decode, cookie, setCookie, clearCookie, json, redirectUri, discord, session, adminIds }
