// middleware/turnstile.js
const { verifyTurnstileToken } = require("../utils/turnstile");

async function requireTurnstile(req, res, next) {
  try {
    const token =
      req.body?.captchaToken ||
      req.body?.["cf-turnstile-response"] ||
      req.headers["cf-turnstile-response"];

    const remoteip =
      req.headers["cf-connecting-ip"] ||
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.ip;

    const result = await verifyTurnstileToken({ token, remoteip });

    if (!result.success) {
      return res.status(403).json({
        message: "Captcha verification failed",
        details: result.data || {}
      });
    }

    next();
  } catch (e) {
    console.error("Turnstile error:", e);
    res.status(500).json({ message: "Captcha verification error" });
  }
}

module.exports = { requireTurnstile };
