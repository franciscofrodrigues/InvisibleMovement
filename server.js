import express from "express";
import { google } from "googleapis";

// Routes
import apiRouter from "./routes/api.js";

const app = express();
const PORT = process.env.NODE_PORT || 3000;

app.use(express.json());
app.use(express.static('public'))

// Cliente OAuth2
const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Login
app.get("/", (req, res) => {
  // res.redirect("/auth");
});

// Autenticação OAuth2
app.get("/auth", (req, res) => {
  const url = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/fitness.activity.read",
      "https://www.googleapis.com/auth/fitness.body.read",
      "https://www.googleapis.com/auth/fitness.location.read",
      "https://www.googleapis.com/auth/fitness.sleep.read"
    ],
    prompt: "consent",
  });
  res.redirect(url);
});

// Callback OAuth2
app.get("/auth/callback", async (req, res) => {
  const { code } = req.query;

  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    app.locals.tokens = tokens;

    res.redirect("/dashboard");
  } catch (error) {
    res.send("Autenticação Falhou");
  }
});

// Verificar autenticação
const requireAuth = (req, res, next) => {
  if (!app.locals.tokens) {
    return res.redirect("/auth");
  }
  next();
};

// ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

// Dashboard
app.get("/dashboard", (req, res) => {
  if (!app.locals.tokens) {
    return res.redirect("/auth");
  }
  res.send("Autenticado");
});

// ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

// API Routes
app.use("/api", requireAuth, (req, res, next) => {
  oAuth2Client.setCredentials(app.locals.tokens);
  req.oAuth2Client = oAuth2Client;
  next();
}, apiRouter);

// ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
