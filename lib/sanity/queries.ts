export const heroSlidesQuery = `
  *[_type == "heroSlide"] | order(order asc, _createdAt asc)[0...3] {
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
    status,
    market,
    styleTag,
    homeTagline,
    location,
    year,
    description,
    featured,
    order,
    team
  }
`;

export const projectBySlugQuery = `
  *[_type == "project" && slug.current == $slug][0] {
    _id,
    _type,
    title,
    slug,
    coverImage{..., asset->{metadata{dimensions}}},
    gallery[]{..., asset->{metadata{dimensions}}},
    category,
    status,
    market,
    styleTag,
    location,
    year,
    area,
    description,
    atAGlance,
    scopeOfWork,
    editorialSections[]{label, heading, body, image{..., asset->{metadata{dimensions}}}},
    quote,
    quoteAuthor,
    team,
    featured,
    order
  }
`;

export const siteSettingsQuery = `
  *[_type == "siteSettings"][0] {
    _id,
    _type,
    logo,
    homeHighlightsLabel,
    homeHighlightsTitle,
    homeHighlightsEmpty,
    homeDiscoverLabel,
    brandStatement,
    aboutEstablished,
    aboutDescription,
    aboutKey | order(order asc),
    aboutPrinciplesIntro,
    aboutPrinciplesContext,
    aboutPrinciples | order(order asc),
    aboutVision,
    aboutVisionSupport,
    aboutVisionImage,
    aboutMission,
    aboutMissionLead,
    aboutMissionSupport,
    aboutMissionDetails | order(order asc),
    aboutMissionImage,
    aboutProcess | order(order asc),
    aboutPageLabel,
    aboutPrinciplesLabel,
    aboutVisionLabel,
    aboutMissionLabel,
    aboutProcessLabel,
    aboutPrinciplesAside,
    aboutVisionAside,
    aboutMissionAside,
    aboutProcessAside,
    servicesPageLabel,
    servicesPageHeading,
    servicesPageDescription,
    servicesProcessLabel,
    servicesProcessHeading,
    servicesProcessDescription,
    servicesProcess | order(order asc),
    studioVisualImage,
    studioVisualVideo {
      asset-> {
        playbackId,
        status
      }
    },
    projectHighlightImages,
    officeAddress,
    googleMapsUrl,
    whatsappNumber,
    whatsappCtaText,
    aboutCtaHeading,
    socialLinks,
    seoDefaults
  }
`;

export const approachItemsQuery = `
  *[_type == "approachItem"] | order(order asc, _createdAt asc) {
    _id, title, description, order
  }
`;

export const teamMembersQuery = `
  *[_type == "teamMember"] | order(order asc, _createdAt asc) {
    _id, name, role, bio, photo, order
  }
`;

export const insightListQuery = `
  *[_type == "insight"] | order(order asc, publishedAt desc, _createdAt desc) {
    _id,
    title,
    slug,
    category,
    publishedAt,
    excerpt,
    coverImage,
    order
  }
`;

export const insightBySlugQuery = `
  *[_type == "insight" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    category,
    publishedAt,
    author,
    excerpt,
    atAGlanceLabel,
    coverImage,
    contributors,
    content,
    sections,
    latestInsightsLabel,
    latestInsightsHeading,
    relatedProject->{
      _id,
      title,
      slug,
      coverImage,
      category,
      status,
      styleTag,
      location,
      year,
      description,
      featured,
      order
    },
    relatedInsights[]->{
      _id,
      title,
      slug,
      category,
      excerpt,
      coverImage,
      order
    },
    order
  }
`;

export const serviceListQuery = `
  *[_type == "service"] | order(order asc, _createdAt asc) {
    _id, title, slug, image, description, order
  }
`;

export const privacyNoticeQuery = `
  *[_type == "privacyNotice"][0] {
    _id,
    title,
    intro,
    sections[] {
      title,
      paragraphs
    },
    _updatedAt
  }
`;

export const productListQuery = `
  *[_type == "product"] | order(order asc, _createdAt asc) {
    _id, name, slug, images, description, order
  }
`;
