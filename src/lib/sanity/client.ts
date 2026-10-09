import { createClient } from "@sanity/client";
import { createImageUrlBuilder } from "@sanity/image-url";
import type { SanityPhoto } from "./types";

export const client = createClient({
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID || "vpea4xzr",
  dataset: import.meta.env.PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2026-02-21",
  useCdn: false, // Fetched at build time: always read the latest published content.
  // Only needed if the dataset is private. Server-side only (no PUBLIC_ prefix).
  token: import.meta.env.SANITY_API_READ_TOKEN,
});

const builder = createImageUrlBuilder(client);

export function urlFor(source: SanityPhoto) {
  return builder.image(source).auto("format").fit("max");
}
