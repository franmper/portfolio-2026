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
