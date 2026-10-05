require("dotenv").config();

const connectDB = require("./config/db");
const Submission = require("./models/Submission");
const app = require("./app");

if (!process.env.MONGO_URI) {
  console.error("Missing environment variable: MONGO_URI");
  process.exit(1);
}

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