// Correct option index for each question (0 = A, 1 = B, 2 = C, 3 = D).
// Position in the array = question id - 1, so index 0 is question 1.
// Keep this in sync with `answer` in the frontend's questionsData.js.

module.exports = [
  0, 1, 1, 1, 0, // Q1  - Q5   (Answers: 0, 1, 1, 1, 0)
  3, 3, 0, 1, 1, // Q6  - Q10  (Answers: 3, 3, 0, 1, 1)
  2, 3, 2, 1, 3, // Q11 - Q15  (Answers: 2, 3, 2, 1, 3)
  3, 0, 2, 1, 3  // Q16 - Q20  (Answers: 3, 0, 2, 1, 3)
];

// module.exports = [
//   0, 1, 1, 1, 0, // Q1  - Q5
//   0, 0, 1, 0, 0, // Q6  - Q10
//   0, 0, 0, 0, 0, // Q11 - Q15
//   0, 0, 0, 0, 0, // Q16 - Q20
// ];

// module.exports = [
//   1, 1, 2, 0, 1, // Q1  - Q5
//   2, 0, 1, 2, 1, // Q6  - Q10
//   0, 1, 2, 0, 1, // Q11 - Q15
//   2, 1, 0, 2, 1, // Q16 - Q20
// ];
 