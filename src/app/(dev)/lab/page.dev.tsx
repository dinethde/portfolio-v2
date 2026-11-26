import { readdir } from "node:fs/promises";
import path from "node:path";
import { notFound } from "next/navigation";

import type { ComponentType } from "react";

// The component lab (ARCHITECTURE §8). Every file in entries/ named <id>.lab.tsx is one entry,
// found at request time, so parallel tasks never edit a shared list (STATE D-24).
// An entry exports `title` and a `Lab` component. /lab?only=<id> shows one entry.

const ENTRY_DIR = path.join(process.cwd(), "src/app/(dev)/lab/entries");
const ENTRY_SUFFIX = ".lab.tsx";

interface LabModule {
  title: string;
  Lab: ComponentType;
}

async function entryIds(): Promise<string[]> {
  const files = await readdir(ENTRY_DIR);
  return files
    .filter((file) => file.endsWith(ENTRY_SUFFIX))
    .map((file) => file.slice(0, -ENTRY_SUFFIX.length))
    .sort();
}

export default async function LabPage({ searchParams }: PageProps<"/lab">) {
  if (process.env.NODE_ENV === "production") notFound();

  const { only } = await searchParams;
  const ids = await entryIds();
  const shown = typeof only === "string" ? ids.filter((id) => id === only) : ids;
  if (shown.length === 0) notFound();

  const entries = await Promise.all(
    shown.map(async (id) => ({
      id,
      module: (await import(`./entries/${id}.lab.tsx`)) as LabModule,
    })),
  );

  return (
    <div className="flex flex-col gap-48 p-24">
      {entries.map(({ id, module: { title, Lab } }) => (
        <section
          key={id}
          id={`lab-${id}`}
          aria-labelledby={`lab-${id}-title`}
          className="flex flex-col gap-16 p-24"
        >
          <h2 id={`lab-${id}-title`} className="text-p3 text-txt-neutral-p3-active">
            {title} · {id}
          </h2>
          <Lab />
        </section>
      ))}
    </div>
  );
}
