const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
  {
    q: { type: Number, required: true }, // question id
    sel: { type: Number, default: null }, // option chosen (null = not attempted)
    cor: { type: Number, required: true }, // correct option
  },
  { _id: false }
);

const submissionSchema = new mongoose.Schema(
  {
    // unique => one attempt per team code
    tCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: 50,
    },
    score: { type: Number, required: true, min: 0, max: 100 }, // % of all questions
    correct: { type: Number, default: 0 }, // number of correct answers
    attempted: { type: Number, default: 0 }, // number of questions answered
    accuracy: { type: Number, default: 0, min: 0, max: 100 }, // correct / attempted * 100
    startedAt: { type: Date, default: null }, // from the Attempt record (server time)
    timeTakenSec: { type: Number, default: null }, // submittedAt - startedAt, capped at quiz duration
    ans: { type: [answerSchema], required: true },
    submittedAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

// Leaderboard order: score desc, accuracy desc, time asc, earliest submit first
submissionSchema.index({ score: -1, accuracy: -1, timeTakenSec: 1, submittedAt: 1 });

// Send `id` instead of `_id`, same shape the Admin page expects
submissionSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

module.exports = mongoose.model("Submission", submissionSchema);


// const mongoose = require("mongoose");

// const answerSchema = new mongoose.Schema(
//   {
//     q: { type: Number, required: true }, // question id
//     sel: { type: Number, default: null }, // option chosen (null = not attempted)
//     cor: { type: Number, required: true }, // correct option
//   },
//   { _id: false }
// );

// const submissionSchema = new mongoose.Schema(
//   {
//     // unique => one attempt per team code
//     tCode: {
//       type: String,
//       required: true,
//       unique: true,
//       uppercase: true,
//       trim: true,
//       maxlength: 50,
//     },
//     score: { type: Number, required: true, min: 0, max: 100 },
//     ans: { type: [answerSchema], required: true },
//     submittedAt: { type: Date, default: Date.now },
//   },
//   { versionKey: false }
// );

// // Send `id` instead of `_id`, same shape the Admin page expects
// submissionSchema.set("toJSON", {
//   transform: (doc, ret) => {
//     ret.id = ret._id.toString();
//     delete ret._id;
//     return ret;
//   },
// });

// module.exports = mongoose.model("Submission", submissionSchema);
