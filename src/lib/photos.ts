import { urlFor } from "./sanity/client";
import type { SanityPhoto } from "./sanity/types";

export interface GalleryPhoto {
  id: string;
  src: string;
  srcSet: string;
  width: number;
  height: number;
  lqip?: string;
  alt: string;
  caption?: string;
  category?: string;
  /** Large versions for the lightbox. */
  full: { src: string; width: number; height: number }[];
}

const THUMB_WIDTHS = [300, 500, 800, 1200, 1600];
const FULL_WIDTHS = [1080, 1920, 2560];

/** Size of the photo after applying the crop set in the Studio. */
export function photoSize(photo: SanityPhoto) {
  const { width, height } = photo.asset.metadata.dimensions;
  const c = photo.crop;
  return c
    ? { width: Math.round(width * (1 - c.left - c.right)), height: Math.round(height * (1 - c.top - c.bottom)) }
    : { width, height };
}

export function srcSet(photo: SanityPhoto, widths = THUMB_WIDTHS) {
  const { width } = photoSize(photo);
  const usable = widths.filter((w) => w <= width);
  return (usable.length ? usable : [width]).map((w) => `${urlFor(photo).width(w).url()} ${w}w`).join(", ");
}

export function toGalleryPhoto(photo: SanityPhoto, category?: string, fallbackAlt = ""): GalleryPhoto {
  const { width, height } = photoSize(photo);
  const fullWidths = FULL_WIDTHS.filter((w) => w < width).concat(width);
  return {
    id: photo._key ?? photo.asset._id,
    src: urlFor(photo).width(800).url(),
    srcSet: srcSet(photo),
    width,
    height,
    lqip: photo.asset.metadata.lqip,
    alt: photo.alt || fallbackAlt,
    caption: photo.caption,
    category,
    full: fullWidths.map((w) => ({
      src: urlFor(photo).width(w).url(),
      width: w,
      height: Math.round((height * w) / width),
    })),
  };
}

/**
 * Descriptive alt text for photos that have none written in the Studio:
 * "<event name>, photo 12", or just the event/category name when there is no position.
 */
export function autoAlt(name: string, position: number | undefined, word: string) {
  return position ? `${name}, ${word} ${position}` : name;
}

/**
 * Maps each asset to the first event (project) it belongs to, with its position in that event,
 * so category galleries can describe photos as "<event>, photo N".
 */
export function eventPositions(projects: { name: string; photos: SanityPhoto[] }[]) {
  const map = new Map<string, { name: string; position: number }>();
  for (const project of projects) {
    project.photos.forEach((p, i) => {
      if (!map.has(p.asset._id)) map.set(p.asset._id, { name: project.name, position: i + 1 });
    });
  }
  return map;
}
