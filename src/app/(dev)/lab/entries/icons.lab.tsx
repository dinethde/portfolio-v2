import { SocialIcon, TechIcon } from "@/components/ui/icons";
import { PlaneIcon } from "@/components/ui/icons/PlaneIcon";
import type { SocialIconName } from "@/components/ui/icons/SocialIcon.types";
import type { TechIconName } from "@/components/ui/icons/TechIcon.types";

// Every icon at 14px, in the text colour. Social and tech icons, then the plane.

export const title = "Icons";

const socialNames: SocialIconName[] = ["x", "github", "resume", "linkedin"];
const techNames: TechIconName[] = [
  "docker",
  "figma",
  "go",
  "postgresql",
  "python",
  "react",
  "rust",
  "tanstack",
  "typescript",
];

export function Lab() {
  return (
    <div className="flex flex-col gap-24">
      <div className="flex flex-wrap gap-24">
        {socialNames.map((name) => (
          <div key={name} className="flex flex-col items-start gap-8">
            <span className="text-p3 text-txt-neutral-p3-active">social · {name}</span>
            <SocialIcon name={name} />
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-24">
        {techNames.map((name) => (
          <div key={name} className="flex flex-col items-start gap-8">
            <span className="text-p3 text-txt-neutral-p3-active">tech · {name}</span>
            <TechIcon name={name} />
          </div>
        ))}
      </div>
      <div className="flex flex-col items-start gap-8">
        <span className="text-p3 text-txt-neutral-p3-active">plane</span>
        <PlaneIcon />
      </div>
    </div>
  );
}
