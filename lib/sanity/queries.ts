export const heroSlidesQuery = `
  *[_type == "heroSlide"] | order(order asc, _createdAt asc) {
    _id,
    _type,
    image,
    eyebrow,
    headline,
    subheadline,
    heroVideo {
      asset-> {
        playbackId,
        status
      }
    },
    order
  }
`;

export const visionSlidesQuery = `
  *[_type == "visionSlide"] | order(order asc, _createdAt asc) {
    _id,
    _type,
    label,
    headline,
    description,
    image,
    order
  }
`;

export const projectListQuery = `
  *[_type == "project"] | order(order asc, _createdAt asc) {
    _id,
    _type,
    title,
    slug,
    coverImage,
    category,
    styleTag,
    location,
    year,
    featured,
    order
  }
`;

export const projectBySlugQuery = `
  *[_type == "project" && slug.current == $slug][0] {
    _id,
    _type,
    title,
    slug,
    coverImage,
    gallery,
    heroVideo{asset->{url}},
    category,
    styleTag,
    location,
    year,
    area,
    description,
    scopeOfWork,
    featured,
    order
  }
`;

export const siteSettingsQuery = `
  *[_type == "siteSettings"][0] {
    _id,
    _type,
    logo,
    brandStatement,
    officeAddress,
    googleMapsUrl,
    whatsappNumber,
    whatsappCtaText,
    socialLinks,
    seoDefaults
  }
`;

export const serviceListQuery = `
  *[_type == "service"] | order(order asc, _createdAt asc) {
    _id, title, slug, image, description, order
  }
`;

export const productListQuery = `
  *[_type == "product"] | order(order asc, _createdAt asc) {
    _id, name, images, description, order
  }
`;
