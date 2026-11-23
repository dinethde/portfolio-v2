import type { ProjectRowProps } from "./ProjectRow.types";
import { ThumbStack } from "./ThumbStack";

// Figma 350:7582. At rest the row is bare; on hover a soft grey box appears behind it and the
// thumbnails fan out (ThumbStack listens for `group/row`).

const base =
  "group/row flex items-center gap-16 rounded-8 p-8 transition-colors duration-150 motion-reduce:transition-none hover:bg-fill-neutral-subtle-active focus-visible:focus-ring";

export function ProjectRow({ title, description, thumbs, href, className }: ProjectRowProps) {
  const classes = [base, className].filter(Boolean).join(" ");
  const content = (
    <>
      <ThumbStack thumbs={thumbs} />
      <span className="flex min-w-0 flex-1 flex-col gap-4 text-p2">
        <span className="font-medium text-txt-neutral-p1-active">{title}</span>
        <span className="text-txt-neutral-p3-active">{description}</span>
      </span>
    </>
  );

  if (href !== undefined) {
    const external = /^https?:/.test(href);
    return (
      <a
        href={href}
        className={classes}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {content}
        {external && <span className="sr-only">(opens in new tab)</span>}
      </a>
    );
  }
  return <div className={classes}>{content}</div>;
}
