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
              S.documentTypeListItem("heroSlide").title("HOME - Hero slides (tambah/edit)"),
              S.documentTypeListItem("visionSlide").title("HOME - Vision / goals slides"),
              S.listItem()
                .title("HOME - Project highlight")
                .child(
                  S.documentList()
                    .title("Project yang tampil di Home")
                    .filter('_type == "project" && featured == true')
                ),
              S.listItem()
                .title("HOME - Teks & pengaturan highlight")
                .child(
                  S.document().schemaType("siteSettings").documentId("siteSettings").title("HOME - Teks & pengaturan highlight")
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
                .title("ABOUT - Teks halaman & media")
                .child(
                  S.document().schemaType("siteSettings").documentId("siteSettings").title("ABOUT - Teks halaman & media")
                ),
              S.documentTypeListItem("teamMember").title("ABOUT - Team members"),
              S.documentTypeListItem("insight").title("ABOUT - Insights"),
            ])
        ),
      S.listItem()
        .title("Projects")
        .child(
          S.documentTypeList("project").title("PROJECTS - Daftar project")
        ),
      S.listItem()
        .title("Services")
        .child(
          S.documentTypeList("service").title("SERVICES - Daftar layanan")
        ),
      S.divider(),
      S.listItem()
        .title("GLOBAL - Kontak, footer & SEO")
        .child(
          S.document().schemaType("siteSettings").documentId("siteSettings").title("GLOBAL - Kontak, footer & SEO")
        ),
    ]);
}
