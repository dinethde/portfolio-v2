import { ProgressPath } from "@/components/timeline/ProgressPath";

// A stand-in timeline: a start mark and four dots. Scroll the lab to watch the line draw; the dots
// turn blue as it passes them. The real dots come from TimelineDot (P2-05).

export const title = "Progress path";

const stops = ["2026", "2025", "2024", "2022"];

export function Lab() {
  return (
    <ProgressPath className="max-w-600">
      <div className="flex flex-col gap-96 pb-96">
        <span
          data-timeline-start
          className="size-16 self-center rounded-500 bg-fill-secondary-light-active"
        />
        <ol className="flex flex-col gap-128">
          {stops.map((year) => (
            <li key={year} className="flex items-center gap-16">
              <span
                data-timeline-dot
                className="size-14 rounded-500 border-2 border-timeline-default-line bg-surface-neutral-light-active data-[active=true]:border-fill-secondary-main-active data-[active=true]:bg-fill-secondary-main-active"
              />
              <span className="text-p2 text-txt-neutral-p2-active">{year}</span>
            </li>
          ))}
        </ol>
      </div>
    </ProgressPath>
  );
}
