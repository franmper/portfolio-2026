import { defineType, defineField } from "sanity";
import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";
import { photosField } from "./objects/photoList";

export default defineType({
  name: "category",
  title: "Category",
  type: "document",
  orderings: [orderRankOrdering],
  fields: [
    defineField({
      name: "name",
      title: "Name (Spanish)",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "nameEn",
      title: "Name (English)",
      type: "string",
      description: "Optional. Falls back to the name above on the English site.",
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Intro text (Spanish)",
      type: "text",
      rows: 3,
      description: "Optional. Shown at the top of the category page. Good for SEO: say what you shoot and where.",
    }),
    defineField({
      name: "descriptionEn",
      title: "Intro text (English)",
      type: "text",
      rows: 3,
      description: "Optional. Falls back to the Spanish text.",
    }),
    photosField,
    orderRankField({ type: "category" }),
  ],
  preview: {
    select: { title: "name", photos: "photos" },
    prepare({ title, photos }) {
      const count = photos?.length ?? 0;
      return {
        title,
        subtitle: `${count} photo${count === 1 ? "" : "s"}`,
        media: photos?.[0],
      };
    },
  },
});
