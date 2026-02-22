import { defineType, defineField } from "sanity";

export default defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      initialValue: "Francisco Peralta",
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      type: "string",
      initialValue: "Portfolio 2026",
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      initialValue: "hello@franciscoperalta.com",
    }),
    defineField({
      name: "instagram",
      title: "Instagram Handle",
      type: "string",
      initialValue: "@franmper",
    }),
    defineField({
      name: "instagramUrl",
      title: "Instagram URL",
      type: "url",
      initialValue: "https://instagram.com/franmper",
    }),
    defineField({
      name: "behanceUrl",
      title: "Behance URL",
      type: "url",
    }),
    defineField({
      name: "seoDescription",
      title: "SEO Description",
      type: "text",
      rows: 3,
      initialValue: "Photography portfolio featuring motorsports, shows, travel, nature, and people.",
    }),
  ],
});
