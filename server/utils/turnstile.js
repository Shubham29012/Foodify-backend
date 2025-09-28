// utils/turnstile.js
const fetch = require("node-fetch");

async function verifyTurnstileToken({ token, remoteip }) {
  if (!token) return { success: false, code: "MISSING_TOKEN" };

  const secret = process.env.TURNSTILE_SECRET;
  const body = new URLSearchParams();
  body.append("secret", secret);
  body.append("response", token);
  if (remoteip) body.append("remoteip", remoteip);

  const resp = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body
  });
  const data = await resp.json();

  // data = { success: boolean, "error-codes": [], action, cdata, ... }
  return { success: !!data.success, data };
}

module.exports = { verifyTurnstileToken };
