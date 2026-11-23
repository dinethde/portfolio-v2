import { FooterCard } from "@/components/footer/FooterCard";
import { FooterCta } from "@/components/footer/FooterCta";
import { contact } from "@/content/contact";
import { nav } from "@/content/nav";
import { site } from "@/content/site";

import type { ContactSectionProps } from "./ContactSection.types";

// ⑤ Contact (DESIGN.md "The page flow"): the sign-off line, then the footer card, in the 750px column.

const { footer } = contact;

const sections = nav
  .filter((item) => item.id !== "contact")
  .map((item) => ({ label: item.label, href: `#${item.id}` }));

const columns = [
  sections,
  [
    { label: footer.twitter, href: site.twitter.href },
    { label: footer.github, href: site.github.href },
    { label: footer.linkedin, href: site.linkedin.href },
  ],
  [
    { label: footer.email, href: `mailto:${site.email}` },
    { label: footer.mobile, href: `tel:${site.phone.replaceAll(" ", "")}` },
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
        primaryAction={{ label: footer.sayHi, href: `mailto:${site.email}` }}
        secondaryAction={{ label: footer.resume, href: site.resume }}
        columns={columns}
      />
    </section>
  );
}
