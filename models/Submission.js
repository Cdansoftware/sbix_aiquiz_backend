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
    score: { type: Number, required: true, min: 0, max: 100 },
    ans: { type: [answerSchema], required: true },
    submittedAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

// Send `id` instead of `_id`, same shape the Admin page expects
submissionSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

module.exports = mongoose.model("Submission", submissionSchema);
