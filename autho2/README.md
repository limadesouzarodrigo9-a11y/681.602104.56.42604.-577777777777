# Zend Applications OAuth2 (Vercel)

Deploy this directory as the Vercel project root. Set the variables from `.env.example` in the Vercel project settings for Production, Preview, and Development as appropriate. Use a unique random `SESSION_SECRET` of at least 32 bytes. Never commit `.env` files.

In the Discord Developer Portal, create an OAuth2 application (or use the bot's application), add the exact `DISCORD_REDIRECT_URI` to OAuth2 Redirects, and provide `identify` and `guilds` scopes. Keep the client secret only in Vercel environment variables. The callback exchanges the code server-side, checks signed state, fetches the user's profile and guild list, then discards OAuth tokens. A signed HttpOnly cookie holds only the profile and authorized guild metadata.

`ADMIN_DISCORD_IDS` is a comma-separated list of Discord user IDs authorized for the admin endpoint. Server access lists use the Discord `owner` flag or `MANAGE_GUILD`/`ADMINISTRATOR` permission. This standalone OAuth site does not yet share sessions with the existing `admin-panel.js`; production integration requires moving both applications to a shared persistent session store and common domain/session design.

Run locally with Vercel CLI from this directory (`vercel dev`) after setting environment variables. The OAuth callback must match the portal URL exactly.
