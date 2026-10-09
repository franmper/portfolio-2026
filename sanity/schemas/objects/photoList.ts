import { defineField } from "sanity";

// Shared "photos" field: drag & drop many files at once, reorder by dragging.
export const photosField = defineField({
  name: "photos",
  title: "Photos",
  type: "array",
  of: [{ type: "photo" }],
  options: { layout: "grid" },
  description: "Drag & drop all the photos at once. Drag to reorder.",
});
