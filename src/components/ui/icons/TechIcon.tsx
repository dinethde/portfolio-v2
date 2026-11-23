import type { ComponentType } from "react";

import type { TechIconName, TechIconProps } from "./TechIcon.types";
import { DockerIcon } from "./tech/DockerIcon";
import { FigmaIcon } from "./tech/FigmaIcon";
import { GoIcon } from "./tech/GoIcon";
import { PostgreSQLIcon } from "./tech/PostgreSQLIcon";
import { PythonIcon } from "./tech/PythonIcon";
import { ReactIcon } from "./tech/ReactIcon";
import { RustIcon } from "./tech/RustIcon";
import { TanStackIcon } from "./tech/TanStackIcon";
import { TypeScriptIcon } from "./tech/TypeScriptIcon";

const icons: Record<TechIconName, ComponentType> = {
  docker: DockerIcon,
  figma: FigmaIcon,
  go: GoIcon,
  postgresql: PostgreSQLIcon,
  python: PythonIcon,
  react: ReactIcon,
  rust: RustIcon,
  tanstack: TanStackIcon,
  typescript: TypeScriptIcon,
};

export function TechIcon({ name }: TechIconProps) {
  const Icon = icons[name];
  return <Icon />;
}
