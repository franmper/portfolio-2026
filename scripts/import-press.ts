/**
 * Import press links from a JSON file:
 *
 *   npm run import-press -- notes.json [--dry-run]
 *
 * File format: [{ outlet, url, title, date (YYYY-MM-DD), project? (slug) }]
 * Safe to re-run: each note gets an id derived from its URL, and existing notes are left untouched.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { getCliClient } from "sanity/cli";

interface Note {
  outlet: string;
  url: string;
  title?: string;
  date: string;
  project?: string | null;
}

const file = process.argv.slice(2).find((a) => !a.startsWith("--"));
const dryRun = process.argv.includes("--dry-run");
if (!file) {
  console.error("Usage: npm run import-press -- notes.json [--dry-run]");
  process.exit(1);
}

const client = getCliClient({ apiVersion: "2026-02-21" });
const notes: Note[] = JSON.parse(readFileSync(file, "utf8"));

// Titles written in ALL CAPS become Title Case; small words and acronyms are handled.
const SMALL = new Set("a al con de del e el en la las lo los me no o para por que se si sin su sus un una y es muy".split(" "));
const KEEP_UPPER = new Set(["TN", "TC", "TCR", "IV", "II", "III", "VI", "F1", "F2", "F3"]);
function titleCase(title: string) {
  if (title !== title.toUpperCase()) return title;
  let first = true;
  return title.toLowerCase().replace(/[\p{L}\p{N}]+/gu, (word) => {
    const upper = word.toUpperCase();
    const isFirst = first;
    first = false;
    if (KEEP_UPPER.has(upper)) return upper;
    return !isFirst && SMALL.has(word) ? word : word[0].toUpperCase() + word.slice(1);
  });
}

async function main() {
  const projectSlugs = [...new Set(notes.map((n) => n.project).filter(Boolean))] as string[];
  const found = await client.fetch<string[]>(`*[_type == "project" && slug.current in $slugs].slug.current`, { slugs: projectSlugs });
  const unknown = projectSlugs.filter((s) => !found.includes(s));
  if (unknown.length) {
    console.error(`Projects not found in Sanity: ${unknown.join(", ")}`);
    process.exit(1);
  }

  let created = 0;
  for (const n of notes) {
    const doc = {
      _id: `press-${createHash("sha1").update(n.url).digest("hex").slice(0, 16)}`,
      _type: "press",
      outlet: n.outlet,
      url: n.url,
      title: n.title ? titleCase(n.title) : undefined,
      date: n.date,
      ...(n.project ? { project: { _type: "reference", _ref: `project-${n.project}` } } : {}),
    };
    if (dryRun) {
      console.log(`${n.date} | ${n.outlet} | ${n.project ?? "-"} | ${doc.title}`);
      continue;
    }
    const before = await client.getDocument(doc._id);
    await client.createIfNotExists(doc);
    if (!before) created++;
  }
  console.log(dryRun ? `\n${notes.length} notes (dry run)` : `Created ${created} notes (${notes.length - created} already existed).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
