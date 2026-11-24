import { ProgressPath } from "@/components/timeline/ProgressPath";
import { TimelineEntry } from "@/components/timeline/TimelineEntry";
import { PlaneIcon } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { story as storyContent } from "@/content/timeline";

import { StoryPhotoFan } from "./StoryPhotoFan";
import type { StorySectionProps } from "./StorySection.types";

// Figma 93:2106 (desktop) and 277:4760 (phone). The entries sit 85px left of the column on tablet
// and up so the rail lands at x=5 and the dates hang in the margin; on phones the rail is the left
// edge and the dates move inline (TimelineEntry). ProgressPath draws the line from the plane
// through every dot to the end mark (STATE D-53). The "Flight plan" label and "CURRENT" tag have
// no content slot, so they stay here as fixed text (STATE D-41).

export function StorySection({ content = storyContent }: StorySectionProps) {
  const { header, intro, entries, signOff, photos } = content;

  return (
    <section id="story" aria-labelledby="story-title" className="flex flex-col gap-32">
      <Reveal>
        <SectionHeader
          variant="section"
          underline
          titleId="story-title"
          eyebrow={header.eyebrow}
          title={header.title}
          description={header.description}
        />
      </Reveal>
      {/* The 88px clears the hand-drawn underline, which hangs below the header. */}
      <ProgressPath className="pt-88">
        <div className="relative flex flex-col gap-12 tablet:h-105 tablet:gap-0">
          <Reveal className="flex flex-col gap-8 text-center tablet:absolute tablet:-top-30 tablet:left-97 tablet:w-376 tablet:text-left">
            <p className="font-rounded text-p1 font-medium text-txt-neutral-p1-active">
              {intro.title}
            </p>
            <p className="font-rounded text-p2 text-txt-neutral-p2-active opacity-80">
              {intro.subtitle}
            </p>
          </Reveal>
          <div
            aria-hidden="true"
            className="flex w-65 flex-col items-center gap-8 self-center tablet:self-start tablet:pl-5"
          >
            <span className="font-rounded text-p3 text-txt-secondary-p1-active">Flight plan</span>
            <span data-timeline-start className="text-fill-secondary-main-active">
              <PlaneIcon />
            </span>
          </div>
          <div aria-hidden="true" className="h-56 tablet:h-53" />
        </div>
        <ol className="flex flex-col tablet:-ml-85 tablet:w-685">
          {entries.map(({ role, ...entry }, index) => (
            <Reveal as="li" key={`${entry.org}-${entry.period ?? index}`}>
              <TimelineEntry {...entry} jobTitle={role} currentLabel="CURRENT" />
            </Reveal>
          ))}
          <Reveal as="li" className="flex items-start gap-16">
            <div className="hidden w-64 shrink-0 tablet:block" />
            <div aria-hidden="true" className="flex w-20 shrink-0 flex-col items-center">
              <span
                data-timeline-dot
                className="h-3 w-8 rounded-4 bg-fill-neutral-strong-active transition-colors duration-300 data-[active=true]:bg-fill-secondary-main-active motion-reduce:transition-none"
              />
            </div>
            <div className="relative flex min-w-0 flex-1 flex-col gap-16 tablet:h-64 tablet:flex-row tablet:gap-32">
              <div className="flex flex-col gap-4 font-rounded text-p2">
                <p className="font-medium text-txt-neutral-p2-active">{signOff.title}</p>
                <p className="text-txt-neutral-p3-active">{signOff.subtitle}</p>
              </div>
              <div className="tablet:absolute tablet:-top-9 tablet:left-327">
                <StoryPhotoFan photos={photos} />
              </div>
            </div>
          </Reveal>
        </ol>
      </ProgressPath>
    </section>
  );
}
