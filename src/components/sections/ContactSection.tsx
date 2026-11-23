import { FooterCard } from "@/components/footer/FooterCard";
import { FooterCta } from "@/components/footer/FooterCta";
import { contact } from "@/content/contact";
import { nav } from "@/content/nav";
import { site } from "@/content/site";

import type { ContactSectionProps } from "./ContactSection.types";

// ⑤ Contact (DESIGN.md "The page flow"): the sign-off line, then the footer card, in the 750px column.

const sections = nav
  .filter((item) => item.id !== "contact")
  .map((item) => ({ label: item.label, href: `#${item.id}` }));

const columns = [
  sections,
  [
    { label: site.twitter.label, href: site.twitter.href },
    { label: "GitHub", href: site.github.href },
    { label: "LinkedIn", href: site.linkedin.href },
  ],
  [
    { label: "Email", href: `mailto:${site.email}` },
    { label: "Mobile", href: `tel:${site.phone.replaceAll(" ", "")}` },
  ],
];

export function ContactSection({ className }: ContactSectionProps) {
  return (
    <section
      id="contact"
      aria-label="Contact"
      className={`mx-auto flex w-full max-w-750 flex-col items-center gap-32 ${className ?? ""}`}
    >
      <FooterCta line={contact.line} />
      <FooterCard
        name={site.name}
        primaryAction={{ label: "Say hi", href: `mailto:${site.email}` }}
        secondaryAction={{ label: "Resume", href: site.resume }}
        columns={columns}
      />
    </section>
  );
}
