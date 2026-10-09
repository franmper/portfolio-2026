// Dereference the asset so we get dimensions + blur placeholder in one go.
// Photos without an uploaded asset (e.g. an upload still in progress) are skipped.
const photo = `{
  _key, alt, caption, crop, hotspot,
  "asset": asset->{ _id, metadata { lqip, dimensions { width, height } } }
}`;

const photos = `"photos": coalesce(photos[defined(asset)]${photo}, [])`;

export const siteDataQuery = `{
  "settings": *[_type == "siteSettings"] | order(_updatedAt desc)[0] {
    name, tagline, email, instagram, instagramUrl, behanceUrl, shopUrl, seoDescription,
    "hero": coalesce(hero[defined(image.asset) && defined(category)] {
      "image": image${photo},
      "category": category->{ name, "slug": slug.current }
    }, [])
  },
  "categories": *[_type == "category" && defined(slug.current)] | order(orderRank) {
    _id, name, "slug": slug.current, ${photos}
  },
  "projects": *[_type == "project" && defined(slug.current)] | order(orderRank) {
    _id, name, "slug": slug.current, date, description,
    "category": category->{ name, "slug": slug.current },
    "coverImage": select(defined(coverImage.asset) => coverImage${photo}),
    ${photos}
  },
  "press": *[_type == "press" && defined(url)] | order(date desc) {
    _id, outlet, url, title, date,
    "project": project->{ "slug": slug.current }
  }
}`;
