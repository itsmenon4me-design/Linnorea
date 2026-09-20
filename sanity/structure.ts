import type { StructureBuilder } from "sanity/structure";

export function structure(S: StructureBuilder) {
  return S.list()
    .title("Linnorea content")
    .items([
      S.listItem()
        .title("Home")
        .child(
          S.list()
            .title("Home")
            .items([
              S.documentTypeListItem("heroSlide").title("Hero slides"),
              S.documentTypeListItem("visionSlide").title("Vision / goals slides"),
              S.listItem()
                .title("Project highlights")
                .child(
                  S.documentList()
                    .title("Projects marked as featured")
                    .filter('_type == "project" && featured == true')
                ),
              S.listItem()
                .title("Home text and highlight settings")
                .child(
                  S.document().schemaType("siteSettings").documentId("siteSettings").title("Home text and highlight settings")
                ),
            ])
        ),
      S.listItem()
        .title("About")
        .child(
          S.list()
            .title("About")
            .items([
              S.listItem()
                .title("About text and sections")
                .child(
                  S.document().schemaType("siteSettings").documentId("siteSettings").title("About text and sections")
                ),
              S.documentTypeListItem("teamMember").title("Team members"),
              S.listItem()
                .title("Studio visual")
                .child(
                  S.document().schemaType("siteSettings").documentId("siteSettings").title("Studio visual")
                ),
            ])
        ),
      S.listItem()
        .title("Projects")
        .child(
          S.documentTypeList("project").title("All projects")
        ),
      S.listItem()
        .title("Services")
        .child(
          S.list()
            .title("Services")
            .items([
              S.documentTypeListItem("service").title("Service list"),
              S.listItem()
                .title("Services page text and process")
                .child(
                  S.document().schemaType("siteSettings").documentId("siteSettings").title("Services page text and process")
                ),
            ])
        ),
      S.listItem()
        .title("Products")
        .child(
          S.documentTypeList("product").title("All products")
        ),
      S.listItem()
        .title("Insights")
        .child(
          S.documentTypeList("insight").title("All insights")
        ),
      S.listItem()
        .title("Contact")
        .child(
          S.list()
            .title("Contact")
            .items([
              S.listItem()
                .title("Contact details and form settings")
                .child(
                  S.document().schemaType("siteSettings").documentId("siteSettings").title("Contact details and form settings")
                ),
            ])
        ),
      S.divider(),
      S.listItem()
        .title("Global settings")
        .child(
          S.document().schemaType("siteSettings").documentId("siteSettings").title("Global settings")
        ),
      S.listItem()
        .title("Privacy notice")
        .child(
          S.document().schemaType("privacyNotice").documentId("privacyNotice").title("Privacy notice")
        ),
    ]);
}
