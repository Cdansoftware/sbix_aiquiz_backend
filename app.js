const express = require("express");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const quizRoutes = require("./routes/quiz");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

if (process.env.TRUST_PROXY === "true") app.set("trust proxy", 1);

// 1. Dynamic Allowed Origins Setup
const clientUrls = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((o) => o.trim()).filter(Boolean)
  : [];

// Localhost Vite (5173), React App (3000), aur process.env.CLIENT_URL ko allow karta hai
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  ...clientUrls,
];

// 2. CORS setup - Helmet se PEHLE lagana zaroori hai
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like Mobile Apps, cURL, Postman)
      if (!origin) return callback(null, true);
      
      // If CLIENT_URL is set to '*', allow everything
      if (process.env.CLIENT_URL === "*") return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      } else {
        return callback(null, true); // Safe fallback to avoid blocking during quiz
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(helmet());
app.use(express.json({ limit: "50kb" }));

// 3. Health Check Route
app.get("/", (req, res) => {
  res.json({ status: "ok", service: "quiz-backend" });
});

// 4. API Routes
app.use("/api/quiz", quizRoutes);

// 5. Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

module.exports = app;