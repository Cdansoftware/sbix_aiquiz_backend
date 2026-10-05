const express = require("express");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const quizRoutes = require("./routes/quiz");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

if (process.env.TRUST_PROXY === "true") app.set("trust proxy", 1);

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5000")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(helmet());
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: "50kb" }));

app.get("/", (req, res) => {
  res.json({ status: "ok", service: "quiz-backend" });
});

app.get("/", (req, res) => {
  app.use(express.static(path.resolve(__dirname, "frontend", "build")));
  res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"));
});

app.use("/api/quiz", quizRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
