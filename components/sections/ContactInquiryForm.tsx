"use client";

import { FormEvent, useState } from "react";
import { projectMarkets } from "@/lib/projectMarkets";

type ContactInquiryFormProps = {
  whatsappNumber: string;
};

const inputClassName =
  "w-full border-b border-white/25 bg-transparent px-0 py-4 text-base text-white outline-none transition-colors placeholder:text-white/35 focus:border-[var(--color-accent-gold)]";

export function ContactInquiryForm({ whatsappNumber }: ContactInquiryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus("idle");

    const form = new FormData(event.currentTarget);
    const message = [
      "Project Consultation Request | Linnorea Design Works",
      "",
      `Name: ${form.get("name") || "-"}`,
      `Email: ${form.get("email") || "-"}`,
      `Company: ${form.get("company") || "-"}`,
      `How they heard about Linnorea: ${form.get("referralSource") || "-"}`,
      `Project market: ${form.get("projectType") || "-"}`,
      `Project location: ${form.get("location") || "-"}`,
      "",
      `Brief: ${form.get("message") || "-"}`,
    ].join("\n");

    try {
      const destination = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
      const whatsappWindow = window.open(destination, "_blank", "noopener,noreferrer");
      if (!whatsappWindow) throw new Error("WhatsApp window was blocked");
      setStatus("success");
      event.currentTarget.reset();
    } catch {
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-10" aria-label="Project inquiry form">
      <div className="grid gap-x-8 md:grid-cols-2">
        <label className="block">
          <span className="text-[10px] uppercase tracking-[0.22em] text-white/55">Name</span>
          <input className={inputClassName} name="name" required autoComplete="name" />
        </label>
        <label className="mt-7 block md:mt-0">
          <span className="text-[10px] uppercase tracking-[0.22em] text-white/55">Email</span>
          <input className={inputClassName} name="email" type="email" required autoComplete="email" />
        </label>
        <label className="mt-7 block">
          <span className="text-[10px] uppercase tracking-[0.22em] text-white/55">Company name</span>
          <input className={inputClassName} name="company" autoComplete="organization" />
        </label>
        <label className="mt-7 block">
          <span className="text-[10px] uppercase tracking-[0.22em] text-white/55">Project location</span>
          <input className={inputClassName} name="location" required placeholder="City, country" />
        </label>
        <label className="mt-7 block">
          <span className="text-[10px] uppercase tracking-[0.22em] text-white/55">Project market</span>
          <select className={`${inputClassName} appearance-none`} name="projectType" defaultValue="" required>
            <option value="" disabled className="bg-[var(--color-bg-base)]">Select a project type</option>
            {projectMarkets.map((market) => <option key={market} className="bg-[var(--color-bg-base)]" value={market}>{market}</option>)}
            <option className="bg-[var(--color-bg-base)]" value="Other">Other</option>
          </select>
        </label>
        <label className="mt-7 block">
          <span className="text-[10px] uppercase tracking-[0.22em] text-white/55">How did you first hear about Linnorea?</span>
          <select className={`${inputClassName} appearance-none`} name="referralSource" defaultValue="" required>
            <option value="" disabled className="bg-[var(--color-bg-base)]">Select an option</option>
            <option className="bg-[var(--color-bg-base)]" value="Recommendation from a friend or colleague">Recommendation from a friend or colleague</option>
            <option className="bg-[var(--color-bg-base)]" value="Social media">Social media</option>
            <option className="bg-[var(--color-bg-base)]" value="Search engine">Search engine</option>
            <option className="bg-[var(--color-bg-base)]" value="Press or editorial feature">Press or editorial feature</option>
            <option className="bg-[var(--color-bg-base)]" value="Event, exhibition, or talk">Event, exhibition, or talk</option>
            <option className="bg-[var(--color-bg-base)]" value="Existing client or professional network">Existing client or professional network</option>
            <option className="bg-[var(--color-bg-base)]" value="Saw a Linnorea project">Saw a Linnorea project</option>
            <option className="bg-[var(--color-bg-base)]" value="Other">Other</option>
          </select>
        </label>
      </div>

      <label className="mt-7 block">
        <span className="text-[10px] uppercase tracking-[0.22em] text-white/55">Project brief</span>
        <textarea className={`${inputClassName} min-h-32 resize-y`} name="message" required />
      </label>

      <div className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-sm text-xs leading-5 text-white/45">Your project brief will open in WhatsApp, where our studio can continue the conversation with you.</p>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex min-h-11 items-center border border-[var(--color-accent-gold)] px-5 text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-accent-gold)] transition-colors hover:bg-[var(--color-accent-gold)] hover:text-[var(--color-bg-base)] disabled:cursor-wait disabled:opacity-50"
        >
          {isSubmitting ? "Preparing brief" : "Begin the conversation"}
        </button>
      </div>

      {status === "success" ? <p className="mt-5 text-sm text-[var(--color-accent-gold)]" role="status">Your brief is ready in WhatsApp.</p> : null}
      {status === "error" ? <p className="mt-5 text-sm text-red-300" role="alert">The brief could not be opened. Please contact the studio directly through WhatsApp.</p> : null}
    </form>
  );
}
