import { defineType, defineField } from "sanity";
import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";
import { photosField } from "./objects/photoList";

export default defineType({
  name: "project",
  title: "Project",
  type: "document",
  orderings: [orderRankOrdering],
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "category" }],
      description: "Optional. Used as a label on the project card.",
    }),
    defineField({
      name: "date",
      title: "Date",
      type: "date",
    }),
    defineField({
      name: "description",
      title: "Description (Spanish)",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "descriptionEn",
      title: "Description (English)",
      type: "text",
      rows: 3,
      description: "Optional. Falls back to the description above on the English site.",
    }),
    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "photo",
      description: "Optional. Defaults to the first photo.",
    }),
    photosField,
    orderRankField({ type: "project" }),
  ],
  preview: {
    select: { title: "name", date: "date", cover: "coverImage", photos: "photos" },
    prepare({ title, date, cover, photos }) {
      const count = photos?.length ?? 0;
      return {
        title,
        subtitle: [date, `${count} photo${count === 1 ? "" : "s"}`].filter(Boolean).join(" · "),
        media: cover?.asset ? cover : photos?.[0],
      };
    },
  },
});
