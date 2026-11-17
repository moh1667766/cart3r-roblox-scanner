const express = require("express");
const rateLimit = require("express-rate-limit");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.disable("x-powered-by");
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/", rateLimit({
  windowMs: 60_000,
  limit: 45,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many checks. Wait a little and try again." }
}));

app.get("/api/check", async (req, res) => {
  const username = String(req.query.name || "");

  // Roblox usernames are 3–20 characters. This scanner intentionally
  // limits candidates to 3–4 characters.
  if (!/^[A-Za-z0-9_]{3,4}$/.test(username) ||
      username.startsWith("_") || username.endsWith("_") ||
      username.includes("__")) {
    return res.status(400).json({
      username,
      status: "INVALID",
      message: "Candidate does not match the scanner's basic username rules."
    });
  }

  try {
    const url = new URL("https://auth.roblox.com/v1/usernames/validate");
    url.searchParams.set("request.username", username);
    url.searchParams.set("request.birthday", "2000-01-01");
    url.searchParams.set("request.context", "Signup");

    const response = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": "CART3R-Username-Scanner/1.0" },
      signal: AbortSignal.timeout(10000)
    });

    if (response.status === 429) {
      return res.status(429).json({ error: "Roblox rate-limited the check. Pause before scanning again." });
    }
    if (!response.ok) {
      return res.status(502).json({ error: `Roblox returned HTTP ${response.status}.` });
    }

    const data = await response.json();
    // Roblox validation codes can change; preserve the raw code for troubleshooting.
    let status = "UNKNOWN";
    if (data.code === 0) status = "AVAILABLE";
    else if (data.code === 1) status = "TAKEN";
    else if ([2, 6].includes(data.code)) status = "INVALID";

    res.json({ username, status, code: data.code, message: data.message || "" });
  } catch (error) {
    res.status(502).json({ error: "Could not reach Roblox. Try again shortly." });
  }
});

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`CART3R scanner listening on port ${PORT}`);
});
