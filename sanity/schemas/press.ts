import { defineType, defineField } from "sanity";

// A link to a media outlet that published the photos.
export default defineType({
  name: "press",
  title: "Press",
  type: "document",
  fields: [
    defineField({
      name: "outlet",
      title: "Outlet",
      type: "string",
      description: "Media name, e.g. Olé, Rolling Stone, Motorsport.com",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "url",
      title: "Link",
      type: "url",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "title",
      title: "Article title",
      type: "string",
      description: "Optional.",
    }),
    defineField({
      name: "date",
      title: "Date",
      type: "date",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "project",
      title: "Project",
      type: "reference",
      to: [{ type: "project" }],
      description: "Optional. Also lists this link on the project page.",
    }),
  ],
  orderings: [{ title: "Date", name: "dateDesc", by: [{ field: "date", direction: "desc" }] }],
  preview: {
    select: { outlet: "outlet", title: "title", date: "date" },
    prepare: ({ outlet, title, date }) => ({
      title: outlet,
      subtitle: [date, title].filter(Boolean).join(" · "),
    }),
  },
});
