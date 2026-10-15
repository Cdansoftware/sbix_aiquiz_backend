require("dotenv").config();

const connectDB = require("./config/db");
const Submission = require("./models/Submission");
const Attempt = require("./models/Attempt");
const app = require("./app");

if (!process.env.MONGO_URI) {
  console.error("Missing environment variable: MONGO_URI");
  process.exit(1);
}

// Admin login needs both of these. Refuse to start with a missing or placeholder value.
for (const name of ["ADMIN_PASSWORD", "JWT_SECRET"]) {
  if (!process.env[name]) {
    console.error(`Missing environment variable: ${name}`);
    process.exit(1);
  }
}
if (
  process.env.JWT_SECRET === "change_this_to_a_long_random_string" ||
  process.env.JWT_SECRET.length < 16
) {
  console.error(
    "JWT_SECRET is a placeholder or too short. Use a long random string (16+ characters)."
  );
  process.exit(1);
}

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    console.log("Connecting to Database...");
    await connectDB();
    console.log("Database connected successfully.");

    await Submission.init();
    await Attempt.init();
    console.log("Database indexes initialized.");

    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
  } catch (error) {
    console.error("Failed to start server due to DB connection error:", error);
    process.exit(1);
  }
})();