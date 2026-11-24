import { ContributionChart } from "@/components/contribution-chart/ContributionChart";
import { SocialIcon } from "@/components/ui/icons";
import { Pill } from "@/components/ui/Pill";
import { RichText } from "@/components/ui/RichText";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { intro as introContent } from "@/content/intro";
import { site as siteContent } from "@/content/site";

import type { IntroSectionProps } from "./IntroSection.types";

// Figma 93:2106 (desktop) and 277:4760 (phone): the hero header, three paragraphs, the call to
// action with the social pills, and the chart. LinkedIn stays out until it has a URL (STATE O1).
// The entrance is plain CSS so the text shows without JavaScript (STATE D-77).

const entranceClass = "animate-entrance motion-reduce:animate-none";

// 60ms between neighbours in page order, matching `stagger` in src/lib/motion.ts.
const delay = (position: number) => ({ animationDelay: `${position * 60}ms` });

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
      <div className={entranceClass} style={delay(0)}>
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
      </div>
      <div className="flex flex-col gap-32">
        <div className="flex flex-col gap-16">
          {paragraphs.map((runs, index) => (
            <p
              key={runs[0]?.text ?? index}
              className={`font-rounded text-p2 text-txt-neutral-p3-active ${entranceClass}`}
              style={delay(index + 1)}
            >
              <RichText runs={runs} />
            </p>
          ))}
        </div>
        <div
          className={`flex flex-col gap-16 ${entranceClass}`}
          style={delay(paragraphs.length + 1)}
        >
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
        </div>
        <div className={entranceClass} style={delay(paragraphs.length + 2)}>
          <ContributionChart title={chartTitle} contributions={contributions} />
        </div>
      </div>
    </section>
  );
}
