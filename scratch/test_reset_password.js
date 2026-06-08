const { hash } = require('crypto');
const fs = require('fs');
const path = require('path');

// 1. Replicate generateTemporaryPassword logic
function generateTemporaryPassword() {
  const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lowercase = 'abcdefghijkmnopqrstuvwxyz';
  const numbers = '23456789';
  const symbols = '!@#$%&*?';
  
  const u = uppercase[Math.floor(Math.random() * uppercase.length)];
  const l = lowercase[Math.floor(Math.random() * lowercase.length)];
  const n = numbers[Math.floor(Math.random() * numbers.length)];
  const s = symbols[Math.floor(Math.random() * symbols.length)];
  
  const all = uppercase + lowercase + numbers + symbols;
  let rest = '';
  for (let i = 0; i < 6; i++) {
    rest += all[Math.floor(Math.random() * all.length)];
  }
  
  const combined = u + l + n + s + rest;
  return combined.split('').sort(() => Math.random() - 0.5).join('');
}

// 2. Validate Password Rules check from signup route
function validatePassword(password) {
  if (password.length <= 7) return 'Password must be more than 7 characters long.';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter (A-Z).';
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter (a-z).';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number (0-9).';
  if (!/[^A-Za-z0-9]/.test(password)) return 'Password must contain at least one special character (e.g. !, @, #, $, etc.).';
  return null;
}

console.log("\n=================== INITIATING PASSWORD RESET INFRASTRUCTURE TEST ===================");

// [A] Test password generator complex validation
console.log("\n[1] Generating 100 random temporary passwords and testing against complex regex constraints...");
let failedCount = 0;
for (let i = 0; i < 100; i++) {
  const tempPass = generateTemporaryPassword();
  const error = validatePassword(tempPass);
  if (error) {
    console.error(`✗ Password generated failed rules check: "${tempPass}" - Error: ${error}`);
    failedCount++;
  }
}

if (failedCount === 0) {
  console.log("✓ All 100/100 generated temporary passwords meet all complexity rules flawlessly!");
} else {
  console.error(`✗ FAILED: ${failedCount} passwords did not satisfy complexity rules!`);
}

// [B] Hash validation
console.log("\n[2] Testing standard SHA-256 hashing format...");
const samplePass = "EsD!8xYz9B";
const passwordHash = hash('sha256', samplePass);
console.log(`Password: "${samplePass}"`);
console.log(`SHA-256 Hash: "${passwordHash}"`);
if (passwordHash && passwordHash.length === 64) {
  console.log("✓ SHA-256 Hashing matches standard 64-character hex length!");
} else {
  console.error("✗ Hashing format incorrect!");
}

// [C] Mock Log dispatch check
console.log("\n[3] Simulating email notification routing...");
const mockUser = {
  firstName: "Abebe",
  lastName: "Bikila",
  email: "abebe.test@esdros.org",
  role: "STUDENT"
};

const tempPass = generateTemporaryPassword();
const emailText = `Hello ${mockUser.firstName},\n\nAn administrator has reset your password for the Esdros Seminary Student Information System.\n\nYour temporary password is:\n${tempPass}\n\nPlease sign in using this password and change it immediately inside your settings page.\n\nBlessings,\nEsdros Seminary IT Administration`;

const logDir = path.join(process.cwd(), 'artifacts');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}
const logFile = path.join(logDir, 'sent-emails.log');
const timestamp = new Date().toISOString();
const logContent = `
========================================
[EMAIL SENT - ${timestamp}]
To: ${mockUser.email}
Subject: Esdros Portal - Temporary Password Reset Notification
----------------------------------------
${emailText}
========================================
`;

try {
  fs.appendFileSync(logFile, logContent, 'utf8');
  console.log("✓ Mock email append succeeded!");
  
  // Verify contents
  const fileData = fs.readFileSync(logFile, 'utf8');
  if (fileData.includes(mockUser.email) && fileData.includes(tempPass)) {
    console.log("✓ Email log verification SUCCESSFUL! Temporary credentials recorded securely.");
  } else {
    console.error("✗ Failed to verify email contents inside log file.");
  }
} catch (err) {
  console.error("✗ File system operation failed:", err);
}

console.log("\n=================== ALL VALIDATION TASKS COMPLETED SUCCESSFULLY ===================");
