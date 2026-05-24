const fs = require('fs');
const path = require('path');

const targetDirs = [
  path.join(process.cwd(), 'app'),
  path.join(process.cwd(), 'prisma'),
  path.join(process.cwd(), 'lib')
];

function walkDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    if (file === 'node_modules' || file === '.next' || file === '.git') continue;
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkDir(filePath));
    } else {
      results.push(filePath);
    }
  }
  return results;
}

function updateFile(filePath) {
  // Skip binary files
  const ext = path.extname(filePath).toLowerCase();
  if (['.png', '.jpg', '.jpeg', '.gif', '.ico', '.pdf', '.docx', '.webp', '.zip', '.xlsx'].includes(ext)) {
    return;
  }

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;

    // Replace various forms of Esdros with Esderos
    if (content.includes('Esdros EOTC Theological Seminary')) {
      content = content.replace(/Esdros EOTC Theological Seminary/g, 'Esderos EOTC Theological Seminary');
      hasChanges = true;
    }
    if (content.includes('Esdros Theological Seminary')) {
      content = content.replace(/Esdros Theological Seminary/g, 'Esderos EOTC Theological Seminary');
      hasChanges = true;
    }
    if (content.includes('Esdros')) {
      content = content.replace(/Esdros/g, 'Esderos');
      hasChanges = true;
    }
    if (content.includes('esdros')) {
      content = content.replace(/esdros/g, 'esderos');
      hasChanges = true;
    }
    if (content.includes('ESDROS')) {
      content = content.replace(/ESDROS/g, 'ESDEROS');
      hasChanges = true;
    }

    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Updated branding in: ${path.relative(process.cwd(), filePath)}`);
    }
  } catch (e) {
    console.error(`Error processing file ${filePath}:`, e);
  }
}

console.log("Starting brand update across targeted directories...");
targetDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    const files = walkDir(dir);
    files.forEach(updateFile);
  }
});
console.log("Brand update completed successfully!");
