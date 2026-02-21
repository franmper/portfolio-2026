export const categoriesQuery = `
  *[_type == "category"] | order(order asc) {
    _id,
    name,
    "slug": slug.current,
    coverImage,
    order
  }
`;

export const featuredPhotosQuery = `
  *[_type == "photo" && featured == true] | order(order asc) {
    _id,
    title,
    image,
    heroPosition,
    "category": category->{ name, "slug": slug.current },
    "lqip": image.asset->metadata.lqip,
    "dimensions": image.asset->metadata.dimensions
  }
`;

export const galleryPhotosQuery = `
  *[_type == "photo"] | order(order asc) {
    _id,
    title,
    image,
    "category": category->{ name, "slug": slug.current },
    "lqip": image.asset->metadata.lqip,
    "dimensions": image.asset->metadata.dimensions,
    exif
  }
`;

export const siteSettingsQuery = `
  *[_type == "siteSettings"][0] {
    name,
    tagline,
    email,
    instagram,
    instagramUrl,
    behanceUrl,
    seoDescription
  }
`;
