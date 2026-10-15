const router = require("express").Router();
const Submission = require("../models/Submission");
const Attempt = require("../models/Attempt");
const { gradeSubmission } = require("../services/scoring");
const { requireAdmin } = require("../middleware/auth");

// Quiz length in seconds. Must match INITIAL_TIME (600) in the frontend Quiz.jsx.
const QUIZ_DURATION_SEC = Number(process.env.QUIZ_DURATION_SEC) || 600;

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

// START THE QUIZ  ->  POST /api/quiz/start
// Body: { tCode }
// Saves the start time on the server (only the FIRST call counts, so a page
// refresh does not reset the clock) and tells the browser how much time is left.
// Returns: { startedAt, durationSec, remainingSec }
router.post("/start", async (req, res, next) => {
  try {
    const code = normalizeCode((req.body || {}).tCode);
    if (!code) {
      return res.status(400).json({ message: "A valid team code is required" });
    }

    if (await Submission.exists({ tCode: code })) {
      return res.status(409).json({
        message: "This team code has already submitted the quiz",
      });
    }

    let attempt;
    try {
      attempt = await Attempt.findOneAndUpdate(
        { tCode: code },
        { $setOnInsert: { startedAt: new Date() } },
        { upsert: true, new: true }
      );
    } catch (err) {
      // Two requests created the same attempt at the same moment: just read it
      if (err.code === 11000) attempt = await Attempt.findOne({ tCode: code });
      else throw err;
    }

    const elapsedSec = Math.floor((Date.now() - attempt.startedAt.getTime()) / 1000);
    const remainingSec = Math.max(0, QUIZ_DURATION_SEC - elapsedSec);

    return res.status(200).json({
      startedAt: attempt.startedAt,
      durationSec: QUIZ_DURATION_SEC,
      remainingSec,
    });
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

    // Score and accuracy are calculated here on the server, never trusted from the browser
    const { ans: graded, score, correct, attempted, accuracy } = gradeSubmission(ans);

    // Time taken comes from the server's own clock.
    // No Attempt record (client never called /start) => worst possible time.
    const attempt = await Attempt.findOne({ tCode: code });
    const submittedAt = new Date();
    let startedAt = null;
    let timeTakenSec = QUIZ_DURATION_SEC;
    if (attempt) {
      startedAt = attempt.startedAt;
      const elapsed = Math.round((submittedAt - startedAt) / 1000);
      timeTakenSec = Math.min(QUIZ_DURATION_SEC, Math.max(0, elapsed));
    }

    await Submission.create({
      tCode: code,
      score,
      correct,
      attempted,
      accuracy,
      startedAt,
      timeTakenSec,
      ans: graded,
      submittedAt,
    });

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

// GET ALL RESPONSES  ->  GET /api/quiz/get-submit      (ADMIN ONLY)
// Needs the header  Authorization: Bearer <token>  from POST /api/admin/login,
// otherwise it answers 401. Students can no longer read scores or the answer key.
// Already sorted as a leaderboard: score, then accuracy, then time, then submit order.
router.get("/get-submit", requireAdmin, async (req, res, next) => {
  try {
    const submissions = await Submission.find().sort({
      score: -1,
      accuracy: -1,
      timeTakenSec: 1,
      submittedAt: 1,
    });
    return res.status(200).json(submissions);
  } catch (err) {
    next(err);
  }
});

module.exports = router;