const ANSWER_KEY = require("../data/answerKey");

const TOTAL = ANSWER_KEY.length;
const OPTION_COUNT = 4;

/**
 * Grades a submission on the server.
 * The client's own `score` and `cor` values are ignored, so nobody can
 * send a fake score. Only the chosen option (`sel`) of each question is used.
 */
function gradeSubmission(clientAnswers) {
  const picked = new Map();

  if (Array.isArray(clientAnswers)) {
    for (const item of clientAnswers) {
      if (!item || typeof item !== "object") continue;

      const { q, sel } = item;
      if (!Number.isInteger(q) || q < 1 || q > TOTAL) continue;
      if (picked.has(q)) continue; // first answer for a question wins

      const valid = Number.isInteger(sel) && sel >= 0 && sel < OPTION_COUNT;
      picked.set(q, valid ? sel : null);
    }
  }

  let correct = 0;
  const ans = ANSWER_KEY.map((cor, i) => {
    const q = i + 1;
    const sel = picked.has(q) ? picked.get(q) : null;
    if (sel === cor) correct++;
    return { q, sel, cor };
  });

  const score = Number(((correct / TOTAL) * 100).toFixed(1));
  return { ans, score, correct, total: TOTAL };
}

module.exports = { gradeSubmission };
