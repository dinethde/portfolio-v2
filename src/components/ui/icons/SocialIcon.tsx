import type { ComponentType } from "react";

import { GitHubIcon } from "./GitHubIcon";
import { LinkedInIcon } from "./LinkedInIcon";
import { ResumeIcon } from "./ResumeIcon";
import type { SocialIconName, SocialIconProps } from "./SocialIcon.types";
import { XIcon } from "./XIcon";

const icons: Record<SocialIconName, ComponentType> = {
  x: XIcon,
  github: GitHubIcon,
  resume: ResumeIcon,
  linkedin: LinkedInIcon,
};

export function SocialIcon({ name }: SocialIconProps) {
  const Icon = icons[name];
  return <Icon />;
}
