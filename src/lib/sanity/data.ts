import { client } from "./client";
import { siteDataQuery } from "./queries";
import type { SiteData, SiteSettings } from "./types";

const defaultSettings: SiteSettings = {
  name: "Francisco Peralta",
  tagline: "Portfolio 2026",
  email: "hello@franciscoperalta.com",
  instagram: "@franmper",
  instagramUrl: "https://instagram.com/franmper",
  seoDescription: "Photography portfolio featuring motorsports, shows, travel, nature, and people.",
  hero: [],
};

let cached: Promise<SiteData> | undefined;

// Fetched once per build and shared by every page. If Sanity is unreachable the
// build fails, so Vercel keeps serving the previous deploy instead of an empty site.
export function getSiteData(): Promise<SiteData> {
  cached ??= client
    .fetch<{ settings: Partial<SiteSettings> | null } & Omit<SiteData, "settings">>(siteDataQuery)
    .then((data) => ({
      ...data,
      settings: { ...defaultSettings, ...stripNulls(data.settings ?? {}) },
    }));
  return cached;
}

function stripNulls<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v != null)) as Partial<T>;
}
