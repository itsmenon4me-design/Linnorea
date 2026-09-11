import type { StructureBuilder } from "sanity/structure";

export function structure(S: StructureBuilder) {
  return S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Home")
        .child(
          S.list()
            .title("Home Page Content")
            .items([
              S.documentTypeListItem("heroSlide").title("Hero Slides"),
              S.documentTypeListItem("visionSlide").title("Vision / Goals Slides"),
              S.listItem()
                .title("Collections / Highlight Projects")
                .child(
                  S.documentList()
                    .title("Featured Projects")
                    .filter('_type == "project" && featured == true')
                ),
              S.listItem()
                .title("Home Settings")
                .child(
                  S.documentTypeList("siteSettings").title("Home Settings")
                ),
            ])
        ),
      S.listItem()
        .title("About")
        .child(
          S.list()
            .title("About Page Content")
            .items([
              S.listItem()
                .title("About Settings")
                .child(
                  S.documentTypeList("siteSettings").title("About Settings")
                ),
              S.documentTypeListItem("approachItem").title("Approach Items"),
              S.documentTypeListItem("teamMember").title("Team Members"),
            ])
        ),
      S.listItem()
        .title("Project")
        .child(
          S.documentTypeList("project").title("Projects")
        ),
      S.listItem()
        .title("Service")
        .child(
          S.documentTypeList("service").title("Services")
        ),
      S.listItem()
        .title("Product")
        .child(
          S.documentTypeList("product").title("Products")
        ),
      S.divider(),
      S.listItem()
        .title("Site Settings")
        .child(
          S.documentTypeList("siteSettings").title("Global Site Settings")
        ),
    ]);
}
