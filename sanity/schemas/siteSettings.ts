import { defineType, defineField, defineArrayMember } from "sanity";

export default defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  groups: [
    { name: "hero", title: "Hero", default: true },
    { name: "info", title: "Info" },
  ],
  fields: [
    defineField({
      name: "hero",
      title: "Hero photos",
      type: "array",
      group: "hero",
      description: "Up to 3 photos. The first one is the large one on the left.",
      validation: (Rule) => Rule.max(3),
      of: [
        defineArrayMember({
          name: "heroItem",
          type: "object",
          fields: [
            defineField({
              name: "image",
              title: "Image",
              type: "photo",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "category",
              title: "Category",
              type: "reference",
              to: [{ type: "category" }],
              description: "Label shown on the photo; clicking it filters the gallery.",
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: { title: "category.name", media: "image" },
          },
        }),
      ],
    }),
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      group: "info",
      initialValue: "Francisco Peralta",
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      type: "string",
      group: "info",
      initialValue: "Portfolio 2026",
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      group: "info",
      initialValue: "hello@franciscoperalta.com",
    }),
    defineField({
      name: "instagram",
      title: "Instagram Handle",
      type: "string",
      group: "info",
      initialValue: "@franmper",
    }),
    defineField({
      name: "instagramUrl",
      title: "Instagram URL",
      type: "url",
      group: "info",
      initialValue: "https://instagram.com/franmper",
    }),
    defineField({
      name: "behanceUrl",
      title: "Behance URL",
      type: "url",
      group: "info",
    }),
    defineField({
      name: "shopUrl",
      title: "Shop URL",
      type: "url",
      group: "info",
      description: "Tienda Nube link. Shows the TIENDA link in the header and the framed-prints block on the home. Leave empty to hide both.",
    }),
    defineField({
      name: "seoDescription",
      title: "SEO Description",
      type: "text",
      rows: 3,
      group: "info",
      initialValue: "Photography portfolio featuring motorsports, shows, travel, nature, and people.",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Site Settings" }),
  },
});
