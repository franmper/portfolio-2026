import { client } from "./client";
import { siteDataQuery } from "./queries";
import type { Lang } from "../../i18n/ui";
import type { CategoryRef, SiteData, SiteSettings } from "./types";

const defaultSettings: SiteSettings = {
  name: "Francisco Peralta",
  tagline: "Portfolio 2026",
  seoDescription: "Fotógrafo de automovilismo.",
  hero: [],
};

const defaultSettingsEn: Partial<SiteSettings> = {
  seoDescription: "Motorsport photographer.",
};

type RawSiteData = { settings: Partial<SiteSettings> | null } & Omit<SiteData, "settings">;

let cached: Promise<RawSiteData> | undefined;

// Fetched once per build and shared by every page and language. If Sanity is unreachable the
// build fails, so Vercel keeps serving the previous deploy instead of an empty site.
function fetchRaw(): Promise<RawSiteData> {
  cached ??= client.fetch<RawSiteData>(siteDataQuery);
  return cached;
}

function stripNulls<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v != null)) as Partial<T>;
}

// English falls back to the (Spanish) default value when no translation has been written.
const pick = <T,>(lang: Lang, es: T | undefined, en: T | undefined) => (lang === "en" && en ? en : es);

function localizeCategory<T extends CategoryRef>(lang: Lang, c: T): T {
  return { ...c, name: pick(lang, c.name, c.nameEn) ?? c.name };
}

export async function getSiteData(lang: Lang): Promise<SiteData> {
  const raw = await fetchRaw();
  const s = stripNulls(raw.settings ?? {});
  const settings: SiteSettings = {
    ...defaultSettings,
    ...(lang === "en" ? defaultSettingsEn : {}),
    ...s,
    tagline: pick(lang, s.tagline, s.taglineEn) ?? defaultSettings.tagline,
    seoDescription: pick(lang, s.seoDescription, s.seoDescriptionEn) ?? (lang === "en" ? defaultSettingsEn.seoDescription : defaultSettings.seoDescription),
    hero: (s.hero ?? []).map((h) => ({ ...h, category: localizeCategory(lang, h.category) })),
  };
  return {
    settings,
    categories: raw.categories.map((c) => ({ ...localizeCategory(lang, c), description: pick(lang, c.description, c.descriptionEn) })),
    projects: raw.projects.map((p) => ({
      ...p,
      description: pick(lang, p.description, p.descriptionEn),
      category: p.category && localizeCategory(lang, p.category),
    })),
    press: raw.press,
  };
}
