const router = require("express").Router();
const Submission = require("../models/Submission");
const { gradeSubmission } = require("../services/scoring");

// Team codes are case-insensitive: "ed123" and "ED123" are the same team.
const normalizeCode = (value) => {
  if (typeof value !== "string") return null; // blocks NoSQL injection like {"$ne": ""}
  const code = value.trim().toUpperCase();
  if (!code || code.length > 50) return null;
  return code;
};

// CHECK TEAM CODE  ->  GET /api/quiz/check-code?tCode=ed123
// Returns: { allowed: true }  or  { allowed: false, message }
router.get("/check-code", async (req, res, next) => {
  try {
    const code = normalizeCode(req.query.tCode);
    if (!code) {
      return res.status(400).json({ message: "A valid team code is required" });
    }

    // exists() is lighter than find(): it only checks, it doesn't load the document
    const alreadySubmitted = await Submission.exists({ tCode: code });

    if (alreadySubmitted) {
      return res.status(409).json({
        allowed: false,
        message: "This team code has already submitted the quiz",
      });
    }

    return res.status(200).json({ allowed: true });
  } catch (err) {
    next(err);
  }
});

// SAVE A QUIZ  ->  POST /api/quiz/submit
// Body: { tCode, ans: [{ q, sel }, ...] }   (extra fields like score/cor are ignored)
router.post("/submit", async (req, res, next) => {
  try {
    const { tCode, ans } = req.body || {};

    const code = normalizeCode(tCode);
    if (!code) {
      return res.status(400).json({ message: "A valid team code is required" });
    }

    // Score is calculated here on the server, never trusted from the browser
    const { ans: graded, score } = gradeSubmission(ans);

    await Submission.create({ tCode: code, score, ans: graded });

    return res.status(201).json({ message: "Submission recorded successfully" });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ message: "This team code has already submitted the quiz" });
    }
    next(err);
  }
});

// GET ALL RESPONSES  ->  GET /api/quiz/get-submit
// Returns a plain array: [{ id, tCode, score, submittedAt, ans: [{ q, sel, cor }] }]
router.get("/get-submit", async (req, res, next) => {
  try {
    const submissions = await Submission.find().sort({ submittedAt: -1 });
    return res.status(200).json(submissions);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
