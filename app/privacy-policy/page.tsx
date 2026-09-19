import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { dictionary } from "@/lib/i18n/dictionaries";
import { sanityClient } from "@/lib/sanity/client";
import { privacyNoticeQuery } from "@/lib/sanity/queries";
import type { PrivacyNotice } from "@/lib/sanity/types";

export const metadata: Metadata = {
  title: "Privacy Notice | Linnorea Design Works",
  description: "How Linnorea Design Works handles information shared through this website.",
};

const defaultSections = [
  {
    title: "Overview",
    paragraphs: [
      "Linnorea Design Works respects the privacy of people who visit this website and contact the studio. This notice explains what information we receive, why we use it, and the choices available to you.",
      "We do not sell your inquiry information or use it for advertising. This notice describes the website as it currently operates and may be updated when the service changes.",
    ],
  },
  {
    title: "Information we receive",
    paragraphs: [
      "When you send a project inquiry, we may receive your name, email address, company name, project type, project location, how you heard about Linnorea, and the details you include in your project brief.",
    ],
  },
  {
    title: "How we use the information",
    paragraphs: [
      "We use this information to understand your inquiry, assess whether our studio can help, and continue the conversation about your project.",
      "We do not use inquiry information to send marketing messages unless you have separately asked to receive them.",
    ],
  },
  {
    title: "WhatsApp",
    paragraphs: [
      "When you submit the inquiry form, the information is formatted as a message and opened in WhatsApp so you can contact the studio directly. WhatsApp processes information under its own privacy terms.",
    ],
  },
  {
    title: "Third-party services",
    paragraphs: [
      "We engage third-party service providers to host the website, deliver media content, and facilitate communications initiated through the site.",
      "These providers may process limited technical information where necessary to deliver their services and maintain the website.",
    ],
  },
  {
    title: "Cookies and analytics",
    paragraphs: [
      "This website does not currently use advertising cookies or analytics trackers as part of the public site experience. If that changes, this policy will be updated and any required consent choices will be provided.",
    ],
  },
  {
    title: "Data retention",
    paragraphs: [
      "We keep inquiry information only for as long as it is reasonably needed to respond to the inquiry and manage the related studio conversation.",
    ],
  },
  {
    title: "Your privacy choices",
    paragraphs: [
      "You may ask what personal information we hold about your inquiry or request that it be corrected or deleted by contacting the studio.",
    ],
  },
  {
    title: "Contact us",
    paragraphs: [
      "For privacy questions or requests concerning information shared through this website, please contact Linnorea Design Works through the Contact page.",
    ],
  },
];

function formatUpdatedDate(updatedAt?: string) {
  if (!updatedAt) return "Not yet published";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(updatedAt));
}

export default async function PrivacyPolicyPage() {
  const notice = await sanityClient.fetch<PrivacyNotice | null>(
    privacyNoticeQuery,
    {},
    { next: { revalidate: 60 } },
  );
  const sections = notice?.sections?.length ? notice.sections : defaultSections;
  const title = notice?.title || "Privacy Notice";
  const intro = notice?.intro || "A clear overview of how Linnorea Design Works handles information shared through this website.";

  return (
    <main className="bg-[var(--color-bg-base)] text-white">
      <Header dictionary={dictionary} />

      <header className="mx-auto max-w-7xl px-5 pb-20 pt-36 md:px-8 md:pb-32 md:pt-48">
        <div className="grid gap-12 md:grid-cols-[0.55fr_1.45fr] md:gap-20">
          <p className="border-l border-[var(--color-accent-gold)] pl-4 text-sm text-white/70">Privacy</p>
          <div>
            <h1 className="max-w-4xl text-5xl font-medium leading-[0.9] tracking-[-0.08em] md:text-8xl">{title}</h1>
            <p className="mt-8 max-w-2xl text-base leading-7 text-white/65 md:text-lg md:leading-8">
              {intro}
            </p>
          </div>
        </div>
      </header>

      <section className="border-y border-white/15">
        <div className="mx-auto max-w-5xl px-5 py-16 md:px-8 md:py-24">
          <p className="max-w-3xl text-sm leading-7 text-white/50">Last updated: {formatUpdatedDate(notice?._updatedAt)}</p>
          <div className="mt-12 max-w-3xl space-y-12">
            {sections.map((section) => (
              <article key={section.title}>
                <h2 className="text-2xl font-medium tracking-[-0.04em] md:text-3xl">{section.title}</h2>
                <div className="mt-4 space-y-4 text-base leading-8 text-white/70">
                  {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
