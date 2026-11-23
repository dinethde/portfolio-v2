import Image from "next/image";

import { ProjectGlow } from "./glows/ProjectGlow";
import type { ProjectCardProps } from "./ProjectCard.types";

// Figma 251:3651. A header, a 600x500 mat with a soft glow and the picture inset in it, and a short
// description. On hover the picture rises and the glow grows (DESIGN.md "Project card"). Hover and
// focus are CSS states. With an href the whole card is the link.

const root =
  "group flex w-full max-w-[600px] flex-col gap-16 rounded-20 text-txt-neutral-p2-active focus-visible:focus-ring";

export function ProjectCard({
  title,
  tag,
  description,
  image,
  glow,
  href,
  className,
}: ProjectCardProps) {
  const classes = [root, className].filter(Boolean).join(" ");

  const content = (
    <>
      <div className="flex items-center gap-16 px-16">
        {/* STATE D-40: no icon artwork yet, so the header shows Figma's dark placeholder square. */}
        <span
          aria-hidden="true"
          className="size-32 shrink-0 rounded-4 bg-fill-neutral-dark-active"
        />
        <h3 className="min-w-0 flex-1 font-sans text-h1 font-medium text-txt-neutral-p1-active">
          {title}
        </h3>
        {tag !== undefined && (
          <span className="font-rounded text-p2 font-medium text-txt-neutral-p2-active">{tag}</span>
        )}
      </div>
      <div className="relative aspect-[6/5] w-full">
        {/* The mat and the glow sit below the page content (-z-20, -z-10), so a glow bleeding past one card never tints a neighbour's text. */}
        <span aria-hidden="true" className="absolute inset-0 -z-20 rounded-20 bg-card-default-bg" />
        <ProjectGlow glow={glow} />
        <div className="absolute inset-x-[4.67%] inset-y-[12%] transition-transform duration-300 ease-soft group-hover:-translate-y-4 in-data-[force-state~=hover]:-translate-y-4 motion-reduce:transition-none">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(min-width: 600px) 544px, 90vw"
            className="rounded-4 border border-outline-neutral-main-active object-cover object-top"
          />
        </div>
      </div>
      {description !== undefined && (
        <p className="px-16 font-rounded text-p2 text-txt-neutral-p2-active">{description}</p>
      )}
    </>
  );

  if (href !== undefined) {
    return (
      <a href={href} className={classes}>
        {content}
      </a>
    );
  }
  return <article className={classes}>{content}</article>;
}
