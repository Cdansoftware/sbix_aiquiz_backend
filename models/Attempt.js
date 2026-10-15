const mongoose = require("mongoose");

// One document per team code. Created the first time the team starts the quiz.
// startedAt is set by the SERVER, so the browser cannot fake or reset it.
const attemptSchema = new mongoose.Schema(
  {
    tCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: 50,
    },
    startedAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

module.exports = mongoose.model("Attempt", attemptSchema);