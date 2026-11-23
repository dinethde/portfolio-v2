import type { ComponentPropsWithoutRef } from "react";

export interface MenuLinkProps extends Omit<ComponentPropsWithoutRef<"a">, "href" | "children"> {
  /** The section id the link scrolls to, without the `#`. */
  id: string;
  label: string;
  /** True for the section in view: blue, with `aria-current="true"`. */
  active?: boolean;
}
