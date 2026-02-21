import { useState, useMemo, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Lightbox = lazy(() => import("yet-another-react-lightbox"));

interface GalleryPhoto {
  id: string;
  src: string;
  width: number;
  height: number;
  category: string;
  title?: string;
}

interface Props {
  photos: GalleryPhoto[];
  categories: string[];
}

// Sample photos for initial build (will be replaced by Sanity data)
const samplePhotos: GalleryPhoto[] = [
  { id: "1", src: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format", width: 600, height: 800, category: "shows", title: "Concert" },
  { id: "2", src: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&auto=format", width: 600, height: 400, category: "motorsports", title: "Racing" },
  { id: "3", src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&auto=format", width: 600, height: 700, category: "travel", title: "Mountains" },
  { id: "4", src: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&auto=format", width: 600, height: 500, category: "nature", title: "Forest" },
  { id: "5", src: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format", width: 600, height: 750, category: "shows", title: "Drummer" },
  { id: "6", src: "https://images.unsplash.com/photo-1541348263662-e068662d82af?w=600&auto=format", width: 600, height: 450, category: "motorsports", title: "Track" },
  { id: "7", src: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&auto=format", width: 600, height: 600, category: "travel", title: "Road" },
  { id: "8", src: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format", width: 600, height: 800, category: "nature", title: "Bird" },
  { id: "9", src: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format", width: 600, height: 500, category: "shows", title: "Festival" },
  { id: "10", src: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&auto=format", width: 600, height: 650, category: "motorsports", title: "Motorcycle" },
  { id: "11", src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format", width: 600, height: 400, category: "travel", title: "Beach" },
  { id: "12", src: "https://images.unsplash.com/photo-1475855581690-80accde3ae2b?w=600&auto=format", width: 600, height: 700, category: "nature", title: "Mountains" },
];

const allCategories = ["ALL", "MOTORSPORTS", "SHOWS", "TRAVEL", "NATURE", "PEOPLE"];

export default function Gallery({ photos = samplePhotos, categories = allCategories }: Partial<Props>) {
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const filteredPhotos = useMemo(() => {
    if (activeFilter === "ALL") return photos;
    return photos.filter((p) => p.category.toUpperCase() === activeFilter);
  }, [photos, activeFilter]);

  // Distribute photos into 3 columns (shortest column first)
  const columns = useMemo(() => {
    const cols: GalleryPhoto[][] = [[], [], []];
    const heights = [0, 0, 0];

    filteredPhotos.forEach((photo) => {
      const shortestCol = heights.indexOf(Math.min(...heights));
      cols[shortestCol].push(photo);
      heights[shortestCol] += photo.height / photo.width;
    });

    return cols;
  }, [filteredPhotos]);

  const lightboxSlides = filteredPhotos.map((p) => ({ src: p.src }));

  return (
    <section id="gallery" className="max-w-[1440px] mx-auto w-full px-[60px] pt-[50px] pb-5 max-lg:px-6">
      {/* Filter Tabs */}
      <div className="flex justify-center gap-2 mb-8">
        {(categories as string[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={`px-3 py-2 rounded-sm text-[11px] tracking-[2px] uppercase transition-colors ${
              activeFilter === cat
                ? "text-[#f9f0f1]"
                : "text-[#f9f0f199] hover:text-[#f9f0f1cc]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Masonry Grid */}
      <div className="flex gap-2">
        {columns.map((col, colIdx) => (
          <div key={colIdx} className="flex-1 flex flex-col gap-2">
            <AnimatePresence mode="popLayout">
              {col.map((photo) => (
                <motion.div
                  key={photo.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="relative overflow-hidden rounded-[2px] cursor-pointer group"
                  onClick={() => {
                    const idx = filteredPhotos.findIndex((p) => p.id === photo.id);
                    setLightboxIndex(idx);
                    setLightboxOpen(true);
                  }}
                >
                  <img
                    src={photo.src}
                    alt={photo.title || ""}
                    loading="lazy"
                    className="w-full h-auto block transition-transform duration-500 group-hover:scale-[1.03]"
                    style={{ aspectRatio: `${photo.width}/${photo.height}` }}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* View More Button */}
      <div className="flex justify-center mt-10">
        <button className="px-10 py-3 border border-[#f9f0f14d] rounded-[2px] text-[12px] tracking-[3px] text-[#f9f0f1cc] uppercase hover:border-[#f9f0f180] hover:text-[#f9f0f1] transition-colors">
          View More Work
        </button>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <Suspense fallback={null}>
          <Lightbox
            open={lightboxOpen}
            close={() => setLightboxOpen(false)}
            index={lightboxIndex}
            slides={lightboxSlides}
          />
        </Suspense>
      )}
    </section>
  );
}
