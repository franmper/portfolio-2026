export interface SanityPhoto {
  _key?: string;
  alt?: string;
  caption?: string;
  crop?: { top: number; bottom: number; left: number; right: number };
  hotspot?: { x: number; y: number; width: number; height: number };
  asset: {
    _id: string;
    metadata: {
      lqip?: string;
      dimensions: { width: number; height: number };
    };
  };
}

export interface CategoryRef {
  name: string;
  /** English name; only present on raw data, resolved into `name` by getSiteData(lang). */
  nameEn?: string;
  slug: string;
}

export interface Category extends CategoryRef {
  _id: string;
  description?: string;
  descriptionEn?: string;
  photos: SanityPhoto[];
}

export interface Project {
  _id: string;
  name: string;
  slug: string;
  date?: string;
  description?: string;
  descriptionEn?: string;
  category?: CategoryRef;
  coverImage?: SanityPhoto;
  photos: SanityPhoto[];
}

export interface Press {
  _id: string;
  outlet: string;
  url: string;
  title?: string;
  date: string;
  project?: { slug: string };
}

export interface HeroItem {
  image: SanityPhoto;
  category: CategoryRef;
}

export interface SiteSettings {
  name: string;
  tagline?: string;
  taglineEn?: string;
  email?: string;
  instagram?: string;
  instagramUrl?: string;
  behanceUrl?: string;
  shopUrl?: string;
  seoDescription?: string;
  seoDescriptionEn?: string;
  hero: HeroItem[];
}

export interface SiteData {
  settings: SiteSettings;
  categories: Category[];
  projects: Project[];
  press: Press[];
}
