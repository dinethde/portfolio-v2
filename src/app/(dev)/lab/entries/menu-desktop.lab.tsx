import { MenuLink } from "@/components/menu/MenuLink";

// The menu link in every Figma state (347:9267). The fixed side panel (296:7564) needs the real
// page sections to show which one is active, so it is checked on the page itself.

export const title = "Menu link (desktop)";

const states = ["default", "hover", "focus", "active"] as const;

export function Lab() {
  return (
    <div className="flex flex-wrap gap-24 rounded-12 bg-surface-page-active p-16">
      {states.map((state) => (
        <div
          key={state}
          data-force-state={state === "default" || state === "active" ? undefined : state}
          className="flex flex-col items-start gap-8"
        >
          <span className="text-p3 text-txt-neutral-p3-active">{state}</span>
          <MenuLink id="story" label="Story so far" active={state === "active"} />
        </div>
      ))}
    </div>
  );
}
