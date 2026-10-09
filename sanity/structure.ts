import type { StructureResolver } from "sanity/structure";
import { orderableDocumentListDeskItem } from "@sanity/orderable-document-list";

export const structure: StructureResolver = (S, context) =>
  S.list()
    .title("Portfolio")
    .items([
      S.listItem()
        .title("Site Settings")
        .id("siteSettings")
        .child(S.document().schemaType("siteSettings").documentId("siteSettings")),
      S.divider(),
      orderableDocumentListDeskItem({ type: "category", title: "Categories", S, context }),
      orderableDocumentListDeskItem({ type: "project", title: "Projects", S, context }),
      S.documentTypeListItem("press")
        .title("Press")
        .child(S.documentTypeList("press").title("Press").defaultOrdering([{ field: "date", direction: "desc" }])),
    ]);
