import { ContributionChart } from "@/components/contribution-chart/ContributionChart";
import { SocialIcon } from "@/components/ui/icons";
import { Pill } from "@/components/ui/Pill";
import { Reveal } from "@/components/ui/Reveal";
import { RevealGroup } from "@/components/ui/RevealGroup";
import { RichText } from "@/components/ui/RichText";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { intro as introContent } from "@/content/intro";
import { site as siteContent } from "@/content/site";

import type { IntroSectionProps } from "./IntroSection.types";

// Figma 93:2106 (desktop) and 277:4760 (phone): the hero header, three paragraphs, the call to
// action with the social pills, and the chart. LinkedIn stays out until it has a URL (STATE O1).

export function IntroSection({
  contributions,
  content = introContent,
  site = siteContent,
}: IntroSectionProps) {
  const { greeting, greetingEmoji, paragraphs, cta, chartTitle } = content;

  const socials = [
    { name: "x", label: site.twitter.label, href: site.twitter.href },
    { name: "github", label: site.github.label, href: site.github.href },
    { name: "resume", label: site.resume.label, href: site.resume.href },
    { name: "linkedin", label: site.linkedin.label, href: site.linkedin.href },
  ] as const;

  return (
    <section id="achievements" aria-labelledby="intro-title" className="flex flex-col gap-40">
      <Reveal>
        <SectionHeader
          variant="hero"
          titleId="intro-title"
          eyebrow={greeting}
          title={site.title.replace(" & ", " &\n")}
          icons={
            <>
              <span className="pb-3 text-[24px] leading-[24px]">{greetingEmoji.wave}</span>
              <span className="pb-4 text-[22px] leading-[24px]">{greetingEmoji.eyes}</span>
            </>
          }
        />
      </Reveal>
      <div className="flex flex-col gap-32">
        <RevealGroup className="flex flex-col gap-16">
          {paragraphs.map((runs, index) => (
            <Reveal key={runs[0]?.text ?? index}>
              <p className="font-rounded text-p2 text-txt-neutral-p3-active">
                <RichText runs={runs} />
              </p>
            </Reveal>
          ))}
        </RevealGroup>
        <Reveal className="flex flex-col gap-16">
          <p className="font-rounded text-p2 text-txt-neutral-p3-active">
            <RichText runs={cta} />
          </p>
          <ul className="flex flex-wrap gap-8">
            {socials.map(({ name, label, href }) =>
              href === "TODO" ? null : (
                <li key={name}>
                  <Pill href={href} icon={<SocialIcon name={name} />}>
                    {label}
                  </Pill>
                </li>
              ),
            )}
          </ul>
        </Reveal>
        <Reveal>
          <ContributionChart title={chartTitle} contributions={contributions} />
        </Reveal>
      </div>
    </section>
  );
}
