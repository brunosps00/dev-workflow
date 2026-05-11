const fs = require('fs');
const path = require('path');

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function fileExists(filePath) {
  return fs.existsSync(filePath);
}

function copyFile(src, dest, force = false) {
  const exists = fileExists(dest);
  if (exists && !force) {
    return 'skipped';
  }
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
  return exists ? 'overwritten' : 'created';
}

function writeFile(filePath, content, force = false) {
  const exists = fileExists(filePath);
  if (exists && !force) {
    return 'skipped';
  }
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf-8');
  return exists ? 'overwritten' : 'created';
}

function copyDir(srcDir, destDir, force = false, overridesDir = null) {
  const results = { created: 0, skipped: 0, overwritten: 0 };

  if (!fs.existsSync(srcDir)) {
    return results;
  }

  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    const overridePath = overridesDir ? path.join(overridesDir, entry.name) : null;

    if (entry.isDirectory()) {
      const subOverrides = overridePath && fs.existsSync(overridePath) ? overridePath : null;
      const sub = copyDir(srcPath, destPath, force, subOverrides);
      results.created += sub.created;
      results.skipped += sub.skipped;
      results.overwritten += sub.overwritten;
    } else {
      // Override wins: copy from override path so dest reflects user customization.
      // Always force-copy overrides so a manual edit to overrides/X.md propagates to templates/X.md on next update.
      const effectiveSrc = overridePath && fs.existsSync(overridePath) ? overridePath : srcPath;
      const status = copyFile(effectiveSrc, destPath, effectiveSrc === overridePath ? true : force);
      results[status]++;
    }
  }

  return results;
}

function log(status, filePath) {
  const icons = {
    created: '\x1b[32m+\x1b[0m',
    skipped: '\x1b[33m~\x1b[0m',
    overwritten: '\x1b[36m!\x1b[0m',
  };
  const icon = icons[status] || ' ';
  const relative = path.relative(process.cwd(), filePath);
  console.log(`  ${icon} ${relative} [${status}]`);
}

module.exports = { ensureDir, fileExists, copyFile, writeFile, copyDir, log };
