export interface SanityImage {
  _type: "image";
  asset: {
    _ref: string;
    _type: "reference";
  };
  hotspot?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  coverImage?: SanityImage;
  order: number;
}

export interface Photo {
  _id: string;
  title?: string;
  image: SanityImage;
  category: {
    name: string;
    slug: string;
  };
  order?: number;
  date?: string;
  featured?: boolean;
  heroPosition?: "left" | "top-right" | "bottom-right";
  lqip?: string;
  dimensions?: {
    width: number;
    height: number;
    aspectRatio: number;
  };
  exif?: {
    camera?: string;
    lens?: string;
    focalLength?: string;
    aperture?: string;
    shutter?: string;
    iso?: number;
  };
}

export interface SiteSettings {
  name: string;
  tagline?: string;
  email: string;
  instagram: string;
  instagramUrl?: string;
  behanceUrl?: string;
  seoDescription?: string;
}
