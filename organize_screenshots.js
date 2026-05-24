const fs = require('fs');
const path = require('path');

const brainDir = 'C:\\Users\\melka\\.gemini\/\/antigravity\\brain\\627114a8-4e05-44c4-823b-30aedd3aea02';
const publicScreenshotsDir = path.join(process.cwd(), 'public', 'screenshots');

if (!fs.existsSync(publicScreenshotsDir)) {
  fs.mkdirSync(publicScreenshotsDir, { recursive: true });
}

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
        results.push({ name: file, path: filePath, mtime: stat.mtime, size: stat.size });
      }
    }
  }
  return results;
}

const allImages = scanDir(brainDir);
allImages.sort((a, b) => a.mtime - b.mtime); // Chronological order

console.log(`Found total ${allImages.length} images. Mapping them to public/screenshots...`);

// Let's identify images based on specific naming or timestamps
const map = {};

allImages.forEach(img => {
  const name = img.name.toLowerCase();
  
  if (name.includes('public_theology')) {
    map['public_theology.png'] = img.path;
  } else if (name.includes('login_page')) {
    map['login_page.png'] = img.path;
  } else if (name.includes('student_dashboard')) {
    map['student_dashboard.png'] = img.path;
  } else if (name.includes('enrollment_console')) {
    map['student_enrollment.png'] = img.path;
  } else if (name.includes('student_academics')) {
    map['student_academics.png'] = img.path;
  } else if (name.includes('student_attendance')) {
    map['student_attendance.png'] = img.path;
  } else if (name.includes('admin_dashboard')) {
    map['admin_dashboard.png'] = img.path;
  } else if (name.includes('admin_settings')) {
    map['admin_settings.png'] = img.path;
  } else if (name.includes('admin_transcripts')) {
    map['admin_transcripts.png'] = img.path;
  } else if (name.includes('manage_admins')) {
    map['manage_admins.png'] = img.path;
  }
});

// Let's do chronological fallback for missing ones from the recent tour (the last ~10 files in .tempmediaStorage)
const tempMediaDir = path.join(brainDir, '.tempmediaStorage');
if (fs.existsSync(tempMediaDir)) {
  const tempFiles = fs.readdirSync(tempMediaDir)
    .filter(f => f.endsWith('.png'))
    .map(f => {
      const p = path.join(tempMediaDir, f);
      const s = fs.statSync(p);
      return { name: f, path: p, mtime: s.mtime, size: s.size };
    })
    .sort((a, b) => a.mtime - b.mtime); // Chronological ascending

  // Let's print out and map the chronologically captured tour pages:
  // We know our student logged in around 20:04, visited dashboard, enrollment, academics, attendance.
  // Then logged out and logged in as faculty!
  // Let's map chronologically:
  let studentTourFiles = tempFiles.filter(f => {
    const hours = f.mtime.getHours();
    const minutes = f.mtime.getMinutes();
    // We ran it around 20:04 - 20:07 EDT
    return f.mtime.getDate() === 23 && hours === 20 && minutes >= 4 && minutes <= 8;
  });

  console.log(`\nFound ${studentTourFiles.length} student/faculty tour files:`);
  studentTourFiles.forEach((f, idx) => {
    console.log(`[${idx}] ${f.name} - ${f.mtime.toLocaleTimeString()} - Size: ${f.size}`);
  });

  // Let's map chronologically:
  // [0] public landing (first navigation)
  // [1] public theology
  // [2] login page
  // [3] student dashboard
  // [4] student enrollment
  // [5] student academics
  // [6] student attendance
  // [7] student finance
  // [8] student settings
  // [9] faculty dashboard
  // [10] faculty attendance
  // [11] faculty gradebook
  // [12] faculty profile
  
  if (studentTourFiles.length >= 1) map['public_landing.png'] = studentTourFiles[0].path;
  if (studentTourFiles.length >= 2) map['public_theology.png'] = studentTourFiles[1].path;
  if (studentTourFiles.length >= 3) map['login_page.png'] = studentTourFiles[2].path;
  if (studentTourFiles.length >= 4) map['student_dashboard.png'] = studentTourFiles[3].path;
  if (studentTourFiles.length >= 5) map['student_enrollment.png'] = studentTourFiles[4].path;
  if (studentTourFiles.length >= 6) map['student_academics.png'] = studentTourFiles[5].path;
  if (studentTourFiles.length >= 7) map['student_attendance.png'] = studentTourFiles[6].path;
  if (studentTourFiles.length >= 8) map['student_finance.png'] = studentTourFiles[7].path;
  if (studentTourFiles.length >= 9) map['student_settings.png'] = studentTourFiles[8].path;
  if (studentTourFiles.length >= 10) map['faculty_dashboard.png'] = studentTourFiles[9].path;
  if (studentTourFiles.length >= 11) map['faculty_attendance.png'] = studentTourFiles[10].path;
  if (studentTourFiles.length >= 12) map['faculty_gradebook.png'] = studentTourFiles[11].path;
  if (studentTourFiles.length >= 13) map['faculty_profile.png'] = studentTourFiles[12].path;
}

// Perform copy
console.log("\n=== COPYING MAPPED IMAGES ===");
Object.keys(map).forEach(destName => {
  const srcPath = map[destName];
  const destPath = path.join(publicScreenshotsDir, destName);
  fs.copyFileSync(srcPath, destPath);
  console.log(`✓ Copied ${path.basename(srcPath)} -> public/screenshots/${destName}`);
});
