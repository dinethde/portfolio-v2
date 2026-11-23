import type { ComponentPropsWithoutRef } from "react";

export type ButtonVariant = "primary-light" | "secondary";

interface ButtonBaseProps {
  variant: ButtonVariant;
}

/** Renders an `<a>`: the button goes somewhere. */
export interface ButtonLinkProps extends ButtonBaseProps, ComponentPropsWithoutRef<"a"> {
  href: string;
}

/** Renders a `<button type="button">`: the button does something on the page. */
export interface ButtonActionProps extends ButtonBaseProps, ComponentPropsWithoutRef<"button"> {
  href?: never;
}

export type ButtonProps = ButtonLinkProps | ButtonActionProps;
