"use client";

import appsStore1 from "@/assets/timeline/apps-store-1.png";
import appsStore2 from "@/assets/timeline/apps-store-2.png";
import appsStore3 from "@/assets/timeline/apps-store-3.png";
import openSource from "@/assets/timeline/logo-open-source.jpg";
import { ProjectRow } from "@/components/timeline/ProjectRow";
import { TimelineDot } from "@/components/timeline/TimelineDot";
import { TimelineEntry } from "@/components/timeline/TimelineEntry";

// Figma 350:7686 (entry), 350:7563 (dot), 350:7582 (project row).
// A client file only so the lab can set the attributes ProgressPath sets in the real page.

export const title = "Timeline";

const appsStore = {
  title: "apps-store",
  description: "Open-source enterprise app catalog",
  thumbs: [
    { image: appsStore1, alt: "" },
    { image: appsStore2, alt: "" },
    { image: appsStore3, alt: "" },
  ],
};

function DotWith({ attrs }: { attrs: Record<string, string> }) {
  return (
    <span
      ref={(el) => {
        const dot = el?.querySelector("[data-timeline-dot]");
        for (const [key, value] of Object.entries(attrs)) dot?.setAttribute(key, value);
      }}
    >
      <TimelineDot />
    </span>
  );
}

export function Lab() {
  return (
    <div className="flex flex-col gap-32">
      <div className="flex items-center gap-24">
        <TimelineDot />
        <DotWith attrs={{ "data-active": "true" }} />
        <DotWith attrs={{ "data-active": "true", "data-ping": "true" }} />
      </div>
      <div className="flex w-full max-w-480 flex-col gap-16">
        <ProjectRow {...appsStore} />
        <ProjectRow {...appsStore} href="#story" />
        <div data-force-state="hover">
          <ProjectRow {...appsStore} />
        </div>
      </div>
      <TimelineEntry
        org="Open Source"
        logo={{ image: openSource, alt: "" }}
        jobTitle="Open-Source Contributor"
        description="Contributed to open-source projects and ranked among the top 10 open-source contributors in Sri Lanka."
        place="REMOTE"
        period="2024"
        projects={[appsStore]}
        current
        className="w-full max-w-700"
      />
    </div>
  );
}
