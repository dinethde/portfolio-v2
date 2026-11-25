import Image from "next/image";

import { ProjectRow } from "./ProjectRow";
import { TimelineDot } from "./TimelineDot";
import type { TimelineEntryProps } from "./TimelineEntry.types";

// Figma 350:7686. One layout in the markup, two looks in CSS: from the tablet breakpoint up the
// place and dates hang in a left column; on the phone they sit inline above the organisation.
// The rail is an empty 20px column that puts the dot 51px below the entry's top (Figma's own
// number). ProgressPath draws the dashed line and the blue line through the dots.

export function TimelineEntry({
  org,
  logo,
  current = false,
  currentLabel = "CURRENT",
  jobTitle,
  description,
  place,
  period,
  projects,
  className,
}: TimelineEntryProps) {
  const hasDates = place !== undefined || period !== undefined;
  const dates = (
    <>
      {place !== undefined && <span className="text-txt-neutral-p3-active">{place}</span>}
      {period !== undefined && <span className="text-txt-neutral-p3-hover">{period}</span>}
    </>
  );

  return (
    <article className={["flex items-start gap-16", className].filter(Boolean).join(" ")}>
      {hasDates ? (
        <p className="hidden w-64 shrink-0 flex-col items-end gap-4 pt-46 text-p2 font-medium whitespace-nowrap tablet:flex">
          {dates}
        </p>
      ) : (
        // Keeps the rail in the same place when a stop has no dates.
        <div aria-hidden="true" className="hidden w-64 shrink-0 tablet:block" />
      )}
      <div aria-hidden="true" className="flex w-20 shrink-0 flex-col items-center pt-51">
        <TimelineDot />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-14 pb-48">
        <Image
          src={logo.image}
          alt={logo.alt}
          sizes="28px"
          className="size-28 shrink-0 rounded-full border border-solid border-outline-neutral-main-active object-cover"
        />
        {hasDates && (
          <p className="flex items-center gap-8 overflow-clip text-p2 font-medium whitespace-nowrap tablet:hidden">
            {dates}
          </p>
        )}
        <div className="flex flex-col gap-10">
          <div className="flex items-center gap-12 pt-4 font-medium whitespace-nowrap">
            <h3 className="text-p1 text-txt-neutral-p1-active">{org}</h3>
            {current && (
              <span className="text-p2 text-timeline-default-status_text">{currentLabel}</span>
            )}
          </div>
          <p className="text-p2 font-medium text-txt-neutral-p1-active">{jobTitle}</p>
          <p className="text-p2 text-txt-neutral-p2-active">{description}</p>
        </div>
        {projects.length > 0 && (
          <div className="flex w-full flex-col gap-12">
            {/* -m-8 cancels the row padding so the thumbs sit on the content edge, as in Figma. */}
            {projects.map((project) => (
              <ProjectRow key={project.title} {...project} className="-m-8" />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
