/**
 * Bulk import: one folder per project, photos uploaded to Sanity.
 *
 *   npm run upload -- <photos root> [--dry-run] [--gallery 6] [--only "F1 Spa 2024"]
 *
 * - Creates the categories and projects listed in scripts/import-manifest.json
 *   (existing ones are kept; nothing is overwritten or removed).
 * - Photos are sorted by the date they were taken (falls back to file name).
 * - Safe to re-run: photos already in Sanity are skipped, photos already in a
 *   project/category are not added twice, and manual reordering is preserved.
 * - `--gallery N` also puts N photos per project, spread across the event, in
 *   the category's gallery (the one shown on the home page). 0 disables it.
 */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { createReadStream, readFileSync, readdirSync, statSync } from "node:fs";
import { basename, extname, join } from "node:path";
import { getCliClient } from "sanity/cli";

interface Manifest {
  categories: { name: string; slug: string }[];
  projects: { folder: string; name: string; category: string }[];
}

interface LocalPhoto {
  path: string;
  name: string;
  sha1: string;
  takenAt: Date;
}

const args = process.argv.slice(2);
const flag = (name: string) => args.includes(`--${name}`);
const option = (name: string) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};

const root = args.find((a) => !a.startsWith("--") && a !== option("gallery") && a !== option("only"));
const dryRun = flag("dry-run");
const galleryPerProject = Number(option("gallery") ?? 6);
const only = option("only");
const CONCURRENCY = 4;

if (!root) {
  console.error('Usage: npm run upload -- <photos root> [--dry-run] [--gallery 6] [--only "Folder"]');
  process.exit(1);
}

const manifest: Manifest = JSON.parse(readFileSync(new URL("./import-manifest.json", import.meta.url), "utf8"));
const client = getCliClient({ apiVersion: "2026-02-21" });

const slugify = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function sha1Of(path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = createHash("sha1");
    createReadStream(path).on("data", (d) => hash.update(d)).on("end", () => resolve(hash.digest("hex"))).on("error", reject);
  });
}

// Date taken, from Spotlight (macOS reads the EXIF). Falls back to the file's modified time.
function takenAt(path: string): Date {
  try {
    const out = execFileSync("mdls", ["-raw", "-name", "kMDItemContentCreationDate", path]).toString().trim();
    const d = new Date(out.replace(" +0000", "Z").replace(" ", "T"));
    if (!Number.isNaN(d.getTime())) return d;
  } catch {}
  return statSync(path).mtime;
}

async function readFolder(dir: string): Promise<LocalPhoto[]> {
  const files = readdirSync(dir).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
  const photos: LocalPhoto[] = [];
  for (const name of files) {
    const path = join(dir, name);
    photos.push({ path, name, sha1: await sha1Of(path), takenAt: takenAt(path) });
  }
  return photos.sort((a, b) => a.takenAt.getTime() - b.takenAt.getTime() || a.name.localeCompare(b.name, undefined, { numeric: true }));
}

async function pool<T>(items: T[], worker: (item: T, i: number) => Promise<void>) {
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        await worker(items[i], i);
      }
    }),
  );
}

// Evenly spread `n` picks across the list.
const spread = <T,>(items: T[], n: number): T[] =>
  n >= items.length ? items : Array.from({ length: n }, (_, i) => items[Math.floor(((i + 0.5) * items.length) / n)]);

const photoItem = (p: LocalPhoto, assetId: string) => ({
  _key: p.sha1.slice(0, 12),
  _type: "photo",
  asset: { _type: "reference", _ref: assetId },
});

async function main() {
  console.log(`${dryRun ? "[DRY RUN] " : ""}Source: ${root}\n`);

  const entries = manifest.projects.filter((p) => !only || p.folder === only);
  const folders = readdirSync(root!).filter((f) => statSync(join(root!, f)).isDirectory());
  const missing = entries.filter((e) => !folders.includes(e.folder));
  if (missing.length) {
    console.error(`Folders not found: ${missing.map((m) => m.folder).join(", ")}`);
    process.exit(1);
  }
  const unlisted = folders.filter((f) => !manifest.projects.some((p) => p.folder === f));
  if (unlisted.length) console.log(`Ignoring folders not in the manifest: ${unlisted.join(", ")}\n`);

  // 1. Categories + projects (create only if missing).
  if (!dryRun) {
    for (const c of manifest.categories) {
      await client.createIfNotExists({ _id: `category-${c.slug}`, _type: "category", name: c.name, slug: { _type: "slug", current: c.slug } });
    }
  }

  const galleryAdds = new Map<string, Record<string, unknown>[]>();
  let totalNew = 0;
  let totalSkipped = 0;

  for (const entry of entries) {
    const photos = await readFolder(join(root!, entry.folder));
    const existing = await client.fetch<{ _id: string; sha1hash: string }[]>(
      `*[_type == "sanity.imageAsset" && sha1hash in $hashes]{ _id, sha1hash }`,
      { hashes: photos.map((p) => p.sha1) },
    );
    const assetBySha = new Map(existing.map((a) => [a.sha1hash, a._id]));
    const toUpload = photos.filter((p) => !assetBySha.has(p.sha1));
    totalNew += toUpload.length;
    totalSkipped += photos.length - toUpload.length;

    const first = photos[0]?.takenAt;
    console.log(`${entry.name} → ${entry.category}: ${photos.length} photos (${toUpload.length} to upload)${first ? `, from ${first.toISOString().slice(0, 10)}` : ""}`);
    if (dryRun) continue;

    let done = 0;
    await pool(toUpload, async (p) => {
      const asset = await client.assets.upload("image", createReadStream(p.path), { filename: basename(p.path, extname(p.path)) + extname(p.path) });
      assetBySha.set(p.sha1, asset._id);
      process.stdout.write(`\r  uploaded ${++done}/${toUpload.length}   `);
    });
    if (toUpload.length) process.stdout.write("\n");

    // 2. Project document: create if missing, then append only photos it doesn't have yet.
    const slug = slugify(entry.name);
    const id = `project-${slug}`;
    await client.createIfNotExists({
      _id: id,
      _type: "project",
      name: entry.name,
      slug: { _type: "slug", current: slug },
      category: { _type: "reference", _ref: `category-${entry.category}` },
      date: first?.toISOString().slice(0, 10),
      photos: [],
    });
    const current = await client.fetch<string[]>(`*[_id == $id][0].photos[]._key`, { id });
    const have = new Set(current ?? []);
    const items = photos.filter((p) => !have.has(p.sha1.slice(0, 12))).map((p) => photoItem(p, assetBySha.get(p.sha1)!));
    if (items.length) await client.patch(id).setIfMissing({ photos: [] }).insert("after", "photos[-1]", items).commit();

    // 3. Pick photos for the category gallery.
    if (galleryPerProject > 0) {
      const picks = spread(photos, galleryPerProject).map((p) => photoItem(p, assetBySha.get(p.sha1)!));
      galleryAdds.set(entry.category, [...(galleryAdds.get(entry.category) ?? []), ...picks]);
    }
  }

  if (!dryRun) {
    for (const [slug, picks] of galleryAdds) {
      const id = `category-${slug}`;
      const current = await client.fetch<string[]>(`*[_id == $id][0].photos[]._key`, { id });
      const have = new Set(current ?? []);
      const items = picks.filter((p) => !have.has(p._key as string));
      if (items.length) await client.patch(id).setIfMissing({ photos: [] }).insert("after", "photos[-1]", items).commit();
      console.log(`Gallery "${slug}": +${items.length} photos`);
    }
  }

  console.log(`\n${dryRun ? "Would upload" : "Uploaded"} ${totalNew} photos${totalSkipped ? ` (${totalSkipped} already in Sanity)` : ""}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
