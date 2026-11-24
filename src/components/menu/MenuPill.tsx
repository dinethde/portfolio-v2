"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import type { KeyboardEvent } from "react";
import { useRef, useState } from "react";

import { duration, ease } from "@/lib/motion";

import { MenuPanel } from "./MenuPanel";
import type { MenuPillProps } from "./MenuPill.types";

// Figma 276:3868 / 276:3847. The frosted pill on tablet and phone: it names the section in view and
// opens a frosted panel (fades in, drops 8px and grows from 98%; 200ms in, 150ms out).
// Focus: the panel's first link takes focus on open, Tab stays inside the pill and panel, and Esc, a
// click outside or a link click close it and hand focus back to the pill.

const PANEL_ID = "site-menu-panel";
const FOCUSABLE = "a[href], button:not([disabled])";

// A stable ref callback, so it runs once when the panel mounts and not on every render.
function focusFirstLink(node: HTMLElement | null) {
  node?.querySelector<HTMLElement>("a[href]")?.focus();
}

export function MenuPill({ links, contacts, active }: MenuPillProps) {
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  const label = links.find((link) => link.id === active)?.label ?? links[0]?.label;

  function close() {
    setOpen(false);
    trigger.current?.focus();
  }

  // A link's own jump to its section moves focus after the click handler, so hand focus back a
  // frame later.
  function closeAfterLink() {
    setOpen(false);
    requestAnimationFrame(() => trigger.current?.focus({ preventScroll: true }));
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!open) return;
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== "Tab" || !root.current) return;
    const items = Array.from(root.current.querySelectorAll<HTMLElement>(FOCUSABLE));
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }

  const hidden = reduced
    ? { opacity: 0 }
    : { opacity: 0, y: -8, scale: 0.98, transition: { duration: duration.fast, ease } };
  const shown = { opacity: 1, y: 0, scale: 1, transition: { duration: duration.quick, ease } };

  return (
    <>
      {open && (
        <div aria-hidden="true" className="fixed inset-0 z-10 desktop:hidden" onClick={close} />
      )}
      <nav
        aria-label="Page sections"
        ref={root}
        onKeyDown={onKeyDown}
        className="fixed inset-x-16 top-20 z-20 mx-auto flex max-w-358 flex-col items-center gap-12 tablet:top-24 desktop:hidden"
      >
        <button
          ref={trigger}
          type="button"
          aria-expanded={open}
          aria-controls={PANEL_ID}
          onClick={() => (open ? close() : setOpen(true))}
          className="flex items-center gap-10 rounded-500 bg-menu-trigger-bg py-10 pr-22 pl-20 font-rounded text-p1 font-medium text-menu-trigger-text backdrop-blur-[12px] focus-visible:focus-ring"
        >
          <span aria-hidden="true" className="flex size-16 flex-col gap-6 px-2 py-4">
            <span className="h-2 rounded-4 bg-menu-trigger-icon" />
            <span className="h-2 rounded-4 bg-menu-trigger-icon" />
          </span>
          {label}
        </button>
        <AnimatePresence>
          {open && (
            <motion.div
              key="panel"
              ref={focusFirstLink}
              initial={hidden}
              animate={shown}
              exit={hidden}
              className="w-full origin-top"
            >
              <MenuPanel
                id={PANEL_ID}
                links={links}
                contacts={contacts}
                active={active}
                onNavigate={closeAfterLink}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
