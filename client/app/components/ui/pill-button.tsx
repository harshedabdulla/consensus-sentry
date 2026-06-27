import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "ghost";

type BaseProps = {
  variant?: Variant;
  children: ReactNode;
  /**
   * When set, the control renders as a non-activatable, focusable element
   * (aria-disabled) with a tooltip. Used for "Coming soon" CTAs so they stay
   * keyboard-reachable and the tooltip is discoverable - unlike a hard
   * `disabled` attribute, which removes the element from the tab order and
   * suppresses hover/focus events the tooltip relies on.
   */
  comingSoonTooltip?: string;
  className?: string;
};

type LinkProps = BaseProps & { href: string } & Omit<
    ComponentProps<"a">,
    keyof BaseProps | "href"
  >;
type ButtonProps = BaseProps & { href?: undefined } & Omit<
    ComponentProps<"button">,
    keyof BaseProps
  >;

type PillButtonProps = LinkProps | ButtonProps;

const baseClasses =
  "inline-flex items-center justify-center rounded-pill px-6 py-3 text-body font-semibold leading-none transition-colors duration-150 whitespace-nowrap";

const variantClasses: Record<Variant, string> = {
  // Primary CTA: matte black fill, white text, with a restrained blue proof halo.
  primary:
    "bg-carbon-black text-paper-white shadow-[var(--shadow-glow)] hover:bg-graphite",
  // Ghost: white fill, 1.5px black border, black text, no shadow.
  ghost:
    "bg-paper-white text-lampblack border-[1.5px] border-carbon-black hover:bg-bone-mist",
};

const disabledClasses =
  "text-slate-pencil border-[1.5px] border-fog-line bg-paper-white cursor-not-allowed";

export function PillButton(props: PillButtonProps) {
  const {
    variant = "primary",
    children,
    comingSoonTooltip,
    className = "",
    ...rest
  } = props;

  // Disabled-with-tooltip state.
  if (comingSoonTooltip) {
    return (
      <span className="group relative inline-flex">
        <span
          role="button"
          aria-disabled="true"
          tabIndex={0}
          className={`${baseClasses} ${disabledClasses} ${className}`}
        >
          {children}
        </span>
        <span
          role="tooltip"
          className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 rounded-tag border border-bone-mist bg-paper-white px-3 py-1 text-caption font-normal whitespace-nowrap text-steel opacity-0 shadow-[var(--shadow-card)] transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
        >
          {comingSoonTooltip}
        </span>
      </span>
    );
  }

  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`;

  if (props.href !== undefined) {
    const { href, ...anchorRest } = rest as LinkProps;
    return (
      <a href={href} className={classes} {...anchorRest}>
        {children}
      </a>
    );
  }

  return (
    <button className={classes} {...(rest as ButtonProps)}>
      {children}
    </button>
  );
}
