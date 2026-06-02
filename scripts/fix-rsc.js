const fs = require("fs");
const path = require("path");

const outDir = process.argv[2] || "site";

// Recursively find all __PAGE__.txt files
function findFiles(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fp = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...findFiles(fp));
    else if (entry.name === "__PAGE__.txt" && fp.includes("__next.")) results.push(fp);
  }
  return results;
}

const files = findFiles(outDir);
console.log(`Found ${files.length} RSC files`);

for (const file of files) {
  // e.g., site/admin/articles/__next.admin/articles/__PAGE__.txt
  const relative = path.relative(outDir, file); // admin/articles/__next.admin/articles/__PAGE__.txt
  const parts = relative.split(path.sep); // ["admin", "articles", "__next.admin", "articles", "__PAGE__.txt"]

  // Find the __next.X directory index
  const idx = parts.findIndex(p => p.startsWith("__next."));
  if (idx < 0) continue;

  // Build dot-separated name: __next.admin.articles.__PAGE__.txt
  const afterNext = parts.slice(idx + 1, -1); // ["articles"]
  const nextDir = parts[idx]; // "__next.admin"
  const dotName = [nextDir, ...afterNext, "__PAGE__.txt"].join("."); // "__next.admin.articles.__PAGE__.txt"

  // Target at same level as the __next.X directory
  const prefix = parts.slice(0, idx); // ["admin", "articles"]
  const targetPath = path.join(outDir, ...prefix, dotName); // admin/articles/__next.admin.articles.__PAGE__.txt

  if (!fs.existsSync(targetPath)) {
    fs.copyFileSync(file, targetPath);
    console.log("Fixed:", path.relative(outDir, targetPath));
  }
}

console.log("Done.");
