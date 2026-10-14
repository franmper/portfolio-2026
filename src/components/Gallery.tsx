import { useState, useMemo, useEffect, lazy, Suspense } from "react";
import type { GalleryPhoto } from "../lib/photos";

const Lightbox = lazy(() => import("yet-another-react-lightbox"));

interface Props {
  photos: GalleryPhoto[];
  /** Filter tabs. Omit to hide them (e.g. on project pages). */
  categories?: { name: string; slug: string }[];
  pageSize?: number;
  /** Show the photos in a different random order on every page load. */
  shuffle?: boolean;
  labels: {
    all: string;
    viewMore: string;
    noPhotos: string;
    openPhoto: string;
    lightbox: Record<string, string>;
  };
}

const ALL = "all";

function shuffled<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Viewport width (px) from which each column count applies. Narrower than the first entry: 2 columns.
const COLUMN_BREAKPOINTS: [minWidth: number, columns: number][] = [
  [1440, 6],
  [1280, 5],
  [1024, 4],
  [640, 3],
];
const MIN_COLUMNS = 2;
const columnsFor = (width: number) => COLUMN_BREAKPOINTS.find(([min]) => width >= min)?.[1] ?? MIN_COLUMNS;

function useColumnCount() {
  // 5 is the most common desktop layout, so the server render usually matches and nothing reflows.
  const [count, setCount] = useState(5);
  useEffect(() => {
    const update = () => setCount(columnsFor(window.innerWidth));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return count;
}

export default function Gallery({ photos, categories, pageSize = 36, shuffle = false, labels }: Props) {
  const [activeFilter, setActiveFilter] = useState(ALL);
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const columnCount = useColumnCount();

  // The server renders the photos in their original order (so the HTML is stable and indexable).
  // Once in the browser, they are shuffled and the grid fades in, so there is no visible reordering.
  const [ordered, setOrdered] = useState(photos);
  const [ready, setReady] = useState(!shuffle);
  useEffect(() => {
    if (!shuffle) return;
    setOrdered(shuffled(photos));
    setReady(true);
  }, [photos, shuffle]);

  // Old links like "/?c=rally" still pre-select that filter.
  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get("c");
    if (slug) {
      setActiveFilter(slug);
      setVisibleCount(pageSize);
    }
  }, [pageSize]);

  const filteredPhotos = useMemo(
    () => (activeFilter === ALL ? ordered : ordered.filter((p) => p.category === activeFilter)),
    [ordered, activeFilter],
  );
  const visiblePhotos = filteredPhotos.slice(0, visibleCount);

  // Distribute photos into columns (shortest column first), keeping their index for the lightbox.
  const columns = useMemo(() => {
    const cols: { photo: GalleryPhoto; index: number }[][] = Array.from({ length: columnCount }, () => []);
    const heights = new Array(columnCount).fill(0);
    visiblePhotos.forEach((photo, index) => {
      const shortest = heights.indexOf(Math.min(...heights));
      cols[shortest].push({ photo, index });
      heights[shortest] += photo.height / photo.width;
    });
    return cols;
  }, [visiblePhotos, columnCount]);

  const slides = useMemo(
    () =>
      filteredPhotos.map((p) => ({
        src: p.full[p.full.length - 1].src,
        width: p.width,
        height: p.height,
        alt: p.alt,
        srcSet: p.full,
      })),
    [filteredPhotos],
  );

  const tabs = categories && categories.length > 1 ? [{ name: labels.all, slug: ALL }, ...categories] : [];

  return (
    <div>
      {tabs.length > 0 && (
        <div className="flex justify-center gap-2 mb-8 flex-wrap">
          {tabs.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => {
                setActiveFilter(cat.slug);
                setVisibleCount(pageSize);
              }}
              className={`px-3 py-2 rounded-sm text-[11px] tracking-[2px] uppercase transition-colors ${
                activeFilter === cat.slug ? "text-text" : "text-text-60 hover:text-text-70"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Masonry grid. Keyed by filter so the fade-in replays when it changes. */}
      <div
        key={`${activeFilter}-${ready}`}
        className="gallery-grid flex gap-1.5 animate-gallery-in"
        style={ready ? undefined : { opacity: 0 }}
      >
        {columns.map((col, colIdx) => (
          <div key={colIdx} className="flex-1 flex flex-col gap-1.5 min-w-0">
            {col.map(({ photo, index }) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setLightboxIndex(index)}
                className="relative block overflow-hidden rounded-[2px] cursor-zoom-in group bg-bg-light bg-cover bg-center"
                style={{
                  aspectRatio: `${photo.width}/${photo.height}`,
                  backgroundImage: photo.lqip ? `url(${photo.lqip})` : undefined,
                }}
                aria-label={photo.alt || labels.openPhoto}
              >
                <img
                  src={photo.src}
                  srcSet={photo.srcSet}
                  sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, (max-width: 1279px) 25vw, (max-width: 1439px) 20vw, 220px"
                  width={photo.width}
                  height={photo.height}
                  alt={photo.alt}
                  loading={index < 6 ? "eager" : "lazy"}
                  decoding="async"
                  onLoad={(e) => e.currentTarget.classList.add("loaded")}
                  ref={(img) => {
                    // Cached images can finish loading before React attaches onLoad.
                    if (img?.complete) img.classList.add("loaded");
                  }}
                  className="gallery-img w-full h-full object-cover block group-hover:scale-[1.03]"
                />
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Without JavaScript the grid is never shuffled, so it must not stay hidden. */}
      <noscript>
        <style>{".gallery-grid{opacity:1 !important}"}</style>
      </noscript>

      {filteredPhotos.length === 0 && (
        <p className="text-center text-[12px] tracking-[2px] text-text-40 uppercase py-20">{labels.noPhotos}</p>
      )}

      {visibleCount < filteredPhotos.length && (
        <div className="flex justify-center mt-10">
          <button
            onClick={() => setVisibleCount((n) => n + pageSize)}
            className="px-10 py-3 border border-text-30 rounded-[2px] text-[12px] tracking-[3px] text-text-70 uppercase hover:border-text-50 hover:text-text transition-colors"
          >
            {labels.viewMore}
          </button>
        </div>
      )}

      {lightboxIndex >= 0 && (
        <Suspense fallback={null}>
          <Lightbox
            open
            close={() => setLightboxIndex(-1)}
            index={lightboxIndex}
            slides={slides}
            labels={labels.lightbox}
            on={{ view: ({ index }) => setLightboxIndex(index) }}
          />
        </Suspense>
      )}
    </div>
  );
}
