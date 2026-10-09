import { defineType, defineField } from "sanity";

// A single photo inside a category or project. Camera data (EXIF), blur
// placeholder (lqip) and dimensions are extracted automatically on upload.
export default defineType({
  name: "photo",
  title: "Photo",
  type: "image",
  options: {
    hotspot: true,
    metadata: ["exif", "lqip", "palette"],
  },
  fields: [
    defineField({
      name: "alt",
      title: "Alt text",
      type: "string",
      description: "Optional. Short description for accessibility and SEO.",
    }),
    defineField({
      name: "caption",
      title: "Caption",
      type: "string",
      description: "Optional. Shown in the lightbox.",
    }),
  ],
});
