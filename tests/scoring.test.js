const assert = require("node:assert/strict");
const { gradeSubmission } = require("../services/scoring");
const ANSWER_KEY = require("../data/answerKey");

// 1. All correct => 100
{
  const r = gradeSubmission(ANSWER_KEY.map((cor, i) => ({ q: i + 1, sel: cor })));
  assert.equal(r.score, 100);
  assert.equal(r.correct, 20);
}

// 2. Empty / garbage input => 0, still returns all 20 questions
for (const input of [[], undefined, null, "hello", 42, {}]) {
  const r = gradeSubmission(input);
  assert.equal(r.score, 0);
  assert.equal(r.ans.length, 20);
  assert.ok(r.ans.every((a) => a.sel === null));
}

// 3. Client cannot fake the score or the correct answer
{
  const r = gradeSubmission([{ q: 1, sel: 0, cor: 0, score: 100 }]);
  assert.equal(r.ans[0].cor, 1); // server's key, not the client's
  assert.equal(r.score, 0);
}

// 4. Duplicates, out of range ids and invalid options are ignored
{
  const r = gradeSubmission([
    { q: 1, sel: 1 }, // correct
    { q: 1, sel: 0 }, // duplicate, ignored
    { q: 99, sel: 1 }, // unknown question
    { q: 2, sel: 7 }, // invalid option -> null
    { q: "3", sel: 2 }, // wrong type -> ignored
    null,
  ]);
  assert.equal(r.correct, 1);
  assert.equal(r.ans[1].sel, null);
  assert.equal(r.ans[2].sel, null);
  assert.equal(r.score, 5);
}

// 5. Half correct => 50
{
  const r = gradeSubmission(
    ANSWER_KEY.slice(0, 10).map((cor, i) => ({ q: i + 1, sel: cor }))
  );
  assert.equal(r.score, 50);
}

// 6. Same shape as the frontend sample (first answer wrong, rest unattempted)
{
  const r = gradeSubmission([{ q: 1, sel: 0, cor: 1 }]);
  assert.equal(r.score, 0);
  assert.deepEqual(r.ans[0], { q: 1, sel: 0, cor: 1 });
  assert.deepEqual(r.ans[1], { q: 2, sel: null, cor: 1 });
}

console.log("scoring tests passed");
