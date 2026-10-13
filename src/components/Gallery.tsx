import { useState, useMemo, useEffect, lazy, Suspense } from "react";
import type { GalleryPhoto } from "../lib/photos";

const Lightbox = lazy(() => import("yet-another-react-lightbox"));

interface Props {
  photos: GalleryPhoto[];
  /** Filter tabs. Omit to hide them (e.g. on project pages). */
  categories?: { name: string; slug: string }[];
  pageSize?: number;
  labels: {
    all: string;
    viewMore: string;
    noPhotos: string;
    openPhoto: string;
    lightbox: Record<string, string>;
  };
}

const ALL = "all";

function useColumnCount() {
  const [count, setCount] = useState(3);
  useEffect(() => {
    const sm = window.matchMedia("(max-width: 639px)");
    const lg = window.matchMedia("(max-width: 1023px)");
    const update = () => setCount(sm.matches ? 1 : lg.matches ? 2 : 3);
    update();
    sm.addEventListener("change", update);
    lg.addEventListener("change", update);
    return () => {
      sm.removeEventListener("change", update);
      lg.removeEventListener("change", update);
    };
  }, []);
  return count;
}

export default function Gallery({ photos, categories, pageSize = 24, labels }: Props) {
  const [activeFilter, setActiveFilter] = useState(ALL);
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const columnCount = useColumnCount();

  // Old links like "/?c=rally" still pre-select that filter.
  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get("c");
    if (slug) {
      setActiveFilter(slug);
      setVisibleCount(pageSize);
    }
  }, [pageSize]);

  const filteredPhotos = useMemo(
    () => (activeFilter === ALL ? photos : photos.filter((p) => p.category === activeFilter)),
    [photos, activeFilter],
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
      <div key={activeFilter} className="flex gap-2 max-sm:flex-col animate-gallery-in">
        {columns.map((col, colIdx) => (
          <div key={colIdx} className="flex-1 flex flex-col gap-2 min-w-0">
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
                  sizes={`(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw`}
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
