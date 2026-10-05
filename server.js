require("dotenv").config();
const cors = require("cors"); // 1. Import cors

const connectDB = require("./config/db");
const Submission = require("./models/Submission");
const app = require("./app");

if (!process.env.MONGO_URI) {
  console.error("Missing environment variable: MONGO_URI");
  process.exit(1);
}

// 2. Enable CORS Middleware before routes execute
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*", // Production me specific CLIENT_URL ya dev me '*'
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    console.log("Connecting to Database...");
    await connectDB();
    console.log("Database connected successfully.");

    await Submission.init();
    console.log("Database indexes initialized.");

    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
  } catch (error) {
    console.error("Failed to start server due to DB connection error:", error);
    process.exit(1);
  }
})();