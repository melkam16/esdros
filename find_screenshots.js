const fs = require('fs');
const path = require('path');

const brainDir = 'C:\\Users\\melka\\.gemini\\antigravity\\brain\\627114a8-4e05-44c4-823b-30aedd3aea02';

function scanDir(dir) {
  if (!fs.existsSync(dir)) return [];
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(scanDir(filePath));
    } else {
      if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.webp')) {
        results.push({ name: file, path: filePath, mtime: stat.mtime });
      }
    }
  }
  return results;
}

const allImages = scanDir(brainDir);

// Filters for specific images
const targets = [
  'public_landing',
  'public_theology',
  'login_page',
  'student_dashboard',
  'enrollment_console',
  'student_academics',
  'student_attendance',
  'student_finance',
  'student_settings',
  'faculty_dashboard',
  'faculty_attendance',
  'faculty_gradebook',
  'faculty_profile',
  'admin_dashboard',
  'admin_settings',
  'admin_transcripts',
  'manage_admins'
];

console.log("=== SCAN TARGET MATCHES ===");
targets.forEach(target => {
  const matches = allImages.filter(img => img.name.toLowerCase().includes(target.toLowerCase()));
  if (matches.length > 0) {
    // Sort by mtime descending (newest first)
    matches.sort((a, b) => b.mtime - a.mtime);
    console.log(`- Target [${target}]: ${matches[0].name} (${matches[0].path})`);
  } else {
    // Look in tempmediaStorage for matching time if not named explicitly
    console.log(`- Target [${target}]: NO EXACT MATCH`);
  }
});

console.log("\n=== ALL RECENT IMAGES IN TEMPMEDIASTORAGE ===");
const tempMediaDir = path.join(brainDir, '.tempmediaStorage');
if (fs.existsSync(tempMediaDir)) {
  const tempFiles = fs.readdirSync(tempMediaDir)
    .filter(f => f.endsWith('.png'))
    .map(f => {
      const p = path.join(tempMediaDir, f);
      const s = fs.statSync(p);
      return { name: f, path: p, mtime: s.mtime, size: s.size };
    })
    .sort((a, b) => b.mtime - a.mtime);

  tempFiles.slice(0, 15).forEach(f => {
    console.log(`- Temp File: ${f.name}\n  Time: ${f.mtime}\n  Size: ${f.size} bytes\n`);
  });
}
