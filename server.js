require("dotenv").config({ path: require("path").join(__dirname, ".env") });
const express = require("express");
const path = require("path");
const session = require("express-session");
const FileStore = require("session-file-store")(session);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    store: new FileStore({
      path: path.join(__dirname, "data/sessions"),
      ttl: 86400, // 1 day in seconds
      retries: 1,
    }),
    secret: process.env.SESSION_SECRET || "must-quality-change-in-prod",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day in ms
    },
  }),
);

// Serve uploaded forms
app.use("/uploads/forms", express.static(path.join(__dirname, "data/forms")));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/course-file", require("./routes/courseFile"));
app.use("/api/quality-standards", require("./routes/qualityStandards"));
app.use("/api/courses", require("./routes/courses"));
app.use("/api/forms", require("./routes/forms"));

// Serve the frontend (one level up from backend/)
app.use(express.static(path.join(__dirname, "..")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running → http://localhost:${PORT}`);
  const gmailOk =
    process.env.GMAIL_USER?.trim() &&
    process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, "");
  const smtpOk =
    process.env.SMTP_HOST?.trim() &&
    process.env.SMTP_USER?.trim() &&
    process.env.SMTP_PASS?.trim();
  if (!gmailOk && !smtpOk) {
    console.warn(
      "[MUST Quality] No GMAIL_/SMTP_ in backend/.env — in non-production, OTP is sent via Ethereal (preview opens in browser). For real Gmail delivery, set GMAIL_USER + GMAIL_APP_PASSWORD.",
    );
  }
});
