import type { StructureBuilder } from "sanity/structure";

export function structure(S: StructureBuilder) {
  return S.list()
    .title("Content")
    .items([
      S.documentTypeListItem("heroSlide").title("Hero Slides"),
      S.documentTypeListItem("project").title("Projects"),
      S.documentTypeListItem("service").title("Services"),
      S.documentTypeListItem("product").title("Products"),
      S.documentTypeListItem("approachItem").title("Approach items"),
      S.documentTypeListItem("teamMember").title("Team members"),
      S.divider(),
      S.documentTypeListItem("siteSettings").title("Site settings"),
    ]);
}
