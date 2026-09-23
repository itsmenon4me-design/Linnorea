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
              S.documentTypeListItem("heroSlide").title("Hero slides (headline, poster, video)"),
              S.listItem()
                .title("Project highlights (choose from Projects)")
                .child(
                  S.documentList()
                    .title("Projects marked as featured")
                    .filter('_type == "project" && featured == true')
                ),
              S.listItem()
                .title("Home text and highlight settings (shared document)")
                .child(
                  S.document().schemaType("siteSettings").documentId("siteSettings").title("Site settings - Home section")
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
                .title("About text and sections (shared document)")
                .child(
                  S.document().schemaType("siteSettings").documentId("siteSettings").title("Site settings - About section")
                ),
              S.listItem()
                .title("Studio visual (shared document)")
                .child(
                  S.document().schemaType("siteSettings").documentId("siteSettings").title("Site settings - Studio visual")
                ),
              S.documentTypeListItem("teamMember").title("Team members (name, role, bio, photo)"),
            ])
        ),
      S.listItem()
        .title("Projects")
        .child(
          S.list()
            .title("Projects")
            .items([
              S.documentTypeListItem("project").title("All projects (add and edit project pages)"),
            ])
        ),
      S.listItem()
        .title("Services")
        .child(
          S.list()
            .title("Services")
            .items([
              S.documentTypeListItem("service").title("Service list (title, image, description)"),
              S.listItem()
                .title("Services page text and process (shared document)")
                .child(
                  S.document().schemaType("siteSettings").documentId("siteSettings").title("Site settings - Services section")
                ),
            ])
        ),
      S.listItem()
        .title("Products")
        .child(
          S.list()
            .title("Products")
            .items([
              S.documentTypeListItem("product").title("All products (name, images, description)"),
            ])
        ),
      S.listItem()
        .title("Insights")
        .child(
          S.list()
            .title("Insights")
            .items([
              S.documentTypeListItem("insight").title("All insights (articles and related content)"),
            ])
        ),
      S.listItem()
        .title("Contact")
        .child(
          S.list()
            .title("Contact")
            .items([
              S.listItem()
                .title("Contact details (address, Maps, WhatsApp)")
                .child(
                  S.document().schemaType("siteSettings").documentId("siteSettings").title("Site settings - Contact details")
                ),
            ])
        ),
      S.divider(),
      S.listItem()
        .title("Global settings (logo, footer, social, SEO)")
        .child(
          S.document().schemaType("siteSettings").documentId("siteSettings").title("Site settings - Global sections")
        ),
      S.listItem()
        .title("Privacy notice (footer legal page)")
        .child(
          S.document().schemaType("privacyNotice").documentId("privacyNotice").title("Privacy notice")
        ),
    ]);
}
