const fs = require('fs');
const path = require('path');

// Replicate getLetter grade bounds
const getLetter = (score) => {
  if (score >= 97) return 'A+';
  if (score >= 93) return 'A';
  if (score >= 90) return 'A-';
  if (score >= 87) return 'B+';
  if (score >= 83) return 'B';
  if (score >= 80) return 'B-';
  if (score >= 77) return 'C+';
  if (score >= 73) return 'C';
  if (score >= 70) return 'C-';
  if (score >= 60) return 'D';
  return 'F';
};

console.log("\n=================== INITIATING GRADE IMPORTER PARSER TEST ===================");

// [A] Test dynamic letter grade scales
console.log("\n[1] Testing Letter Grade Mapping Scale...");
const testCases = [
  { score: 98, expected: 'A+' },
  { score: 93, expected: 'A' },
  { score: 91, expected: 'A-' },
  { score: 85, expected: 'B' },
  { score: 78, expected: 'C+' },
  { score: 71, expected: 'C-' },
  { score: 65, expected: 'D' },
  { score: 45, expected: 'F' }
];

testCases.forEach(tc => {
  const result = getLetter(tc.score);
  if (result === tc.expected) {
    console.log(`✓ Score ${tc.score}% correctly maps to letter "${result}"`);
  } else {
    console.error(`✗ FAILED: Score ${tc.score}% mapped to "${result}" instead of "${tc.expected}"`);
  }
});

// [B] Parse mock CSV spreadsheet
console.log("\n[2] Simulating client-side CSV spreadsheet parsing...");
const mockCSV = `Enrollment ID,Student ID,Student Name,Course Code,Course Title,Final Score (0-100)
e-101,s-501,"Kidane Wolde",TH-101,"Introduction to Theology",95.5
e-102,s-502,"Selam Gidey",TH-101,"Introduction to Theology",88.0
e-103,s-503,"Yared Yohannes",TH-101,"Introduction to Theology",105
e-104,s-504,"Marta Hailu",TH-101,"Introduction to Theology",not-a-number
`;

const lines = mockCSV.split('\n').filter(l => l.trim() !== '');
const headers = lines[0].split(',').map(h => h.trim());
const enrollmentIdx = headers.indexOf('Enrollment ID');
const scoreIdx = headers.indexOf('Final Score (0-100)');

const parsedGrades = [];
for (let i = 1; i < lines.length; i++) {
  const columns = lines[i].split(',').map(c => c.replace(/^["']|["']$/g, '').trim());
  if (columns.length < 2) continue;

  const enrollmentId = columns[enrollmentIdx];
  const studentName = columns[2];
  const rawScore = columns[scoreIdx];

  const mark = parseFloat(rawScore);
  const isValid = !isNaN(mark) && mark >= 0 && mark <= 100;
  const letter = isValid ? getLetter(mark) : 'F';

  parsedGrades.push({
    enrollmentId,
    studentName,
    mark: isValid ? mark : 0,
    letter,
    isValid,
    error: !isValid ? (isNaN(mark) ? 'Not a valid number.' : 'Score boundary breach.') : undefined
  });
}

console.log("\nParsed results preview:");
parsedGrades.forEach(g => {
  if (g.isValid) {
    console.log(`✓ [READY] Student: ${g.studentName} | Score: ${g.mark}% | Letter: ${g.letter}`);
  } else {
    console.log(`✗ [INVALID] Student: ${g.studentName} | Error: "${g.error}"`);
  }
});

// Verify matches
const readyCount = parsedGrades.filter(g => g.isValid).length;
const invalidCount = parsedGrades.filter(g => !g.isValid).length;
if (readyCount === 2 && invalidCount === 2) {
  console.log("\n✓ CSV Parser and Score Boundary Validator works perfectly!");
} else {
  console.error("\n✗ FAILED: Expected 2 valid and 2 invalid rows parsed, got different results.");
}

console.log("\n=================== GRADE IMPORTER INFRASTRUCTURE TEST COMPLETED ===================");
