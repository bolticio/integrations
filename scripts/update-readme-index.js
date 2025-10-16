const fs = require('fs');
const path = require('path');

function isDirectory(fullPath) {
  try {
    return fs.statSync(fullPath).isDirectory();
  } catch {
    return false;
  }
}

function hasIntegrationMarkers(dirPath) {
  return (
    isDirectory(path.join(dirPath, 'schemas')) ||
    isDirectory(path.join(dirPath, 'documentation'))
  );
}

function getIntegrationDirs(rootDir) {
  const exclude = new Set([
    'node_modules',
    '.git',
    '.github',
    '.vscode',
    'scripts',
  ]);

  const entries = fs.readdirSync(rootDir, { withFileTypes: true });
  const dirs = entries
    .filter((ent) => ent.isDirectory() && !exclude.has(ent.name))
    .map((ent) => ent.name)
    .filter((name) => hasIntegrationMarkers(path.join(rootDir, name)));

  return dirs.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
}

function ensureIndexSection(readme) {
  const headingRegex = /^##\s+📖\s+Index\s*$/m;
  if (!headingRegex.test(readme)) {
    const insertion = `\n\n## 📖 Index\n\n`;
    return readme.trimEnd() + insertion;
  }
  return readme;
}

function updateIndexInReadme(readmePath, dirs) {
  const startTag = '<!-- INTEGRATIONS_INDEX:START -->';
  const endTag = '<!-- INTEGRATIONS_INDEX:END -->';
  const bulletLines = dirs.map((d) => `- [${d}](./${d}/)`).join('\n');
  const block = `${startTag}\n${bulletLines}\n${endTag}`;

  let readme = fs.readFileSync(readmePath, 'utf8');
  readme = ensureIndexSection(readme);

  const headingMatch = readme.match(/^##\s+📖\s+Index\s*$/m);
  if (!headingMatch) {
    // Should not happen due to ensureIndexSection, but guard anyway
    readme += `\n\n## 📖 Index\n\n${block}\n`;
    fs.writeFileSync(readmePath, readme);
    return;
  }

  const headingIndex = headingMatch.index;
  const afterHeadingIndex = readme.indexOf('\n', headingIndex) + 1;

  // If tags already present, replace between them; otherwise replace until next header
  const startIdx = readme.indexOf(startTag, afterHeadingIndex);
  const endIdx = readme.indexOf(endTag, afterHeadingIndex);

  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    const before = readme.slice(0, startIdx);
    const after = readme.slice(endIdx + endTag.length);
    readme = `${before}${block}${after}`;
  } else {
    const nextHeader = readme.slice(afterHeadingIndex).match(/^##\s+/m);
    if (nextHeader) {
      const nextHeaderIndex = afterHeadingIndex + nextHeader.index;
      const before = readme.slice(0, afterHeadingIndex);
      const after = readme.slice(nextHeaderIndex);
      readme = `${before}${block}\n\n${after}`;
    } else {
      // Append at end of file
      readme = `${readme.trimEnd()}\n\n${block}\n`;
    }
  }

  fs.writeFileSync(readmePath, readme);
}

function main() {
  const root = process.cwd();
  const readmePath = path.join(root, 'README.md');
  const dirs = getIntegrationDirs(root);
  updateIndexInReadme(readmePath, dirs);
  console.log(`Updated README index with ${dirs.length} integrations.`);
}

main();


