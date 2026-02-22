import { defineType, defineField } from "sanity";

export default defineType({
  name: "photo",
  title: "Photo",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "category" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "project",
      title: "Project",
      type: "reference",
      to: [{ type: "project" }],
    }),
    defineField({
      name: "featured",
      title: "Featured (Hero)",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "heroPosition",
      title: "Hero Position",
      type: "string",
      options: {
        list: [
          { title: "Left (large)", value: "left" },
          { title: "Top Right", value: "top-right" },
          { title: "Bottom Right", value: "bottom-right" },
        ],
      },
      hidden: ({ parent }) => !parent?.featured,
    }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      initialValue: 0,
    }),
    defineField({
      name: "date",
      title: "Date Taken",
      type: "date",
    }),
    defineField({
      name: "exif",
      title: "EXIF Data",
      type: "object",
      fields: [
        defineField({ name: "camera", title: "Camera", type: "string" }),
        defineField({ name: "lens", title: "Lens", type: "string" }),
        defineField({ name: "focalLength", title: "Focal Length", type: "string" }),
        defineField({ name: "aperture", title: "Aperture", type: "string" }),
        defineField({ name: "shutter", title: "Shutter Speed", type: "string" }),
        defineField({ name: "iso", title: "ISO", type: "number" }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "title",
      media: "image",
      category: "category.name",
    },
    prepare({ title, media, category }) {
      return {
        title: title || "Untitled",
        subtitle: category,
        media,
      };
    },
  },
  orderings: [
    { title: "Order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] },
    { title: "Date", name: "dateDesc", by: [{ field: "date", direction: "desc" }] },
  ],
});
