import React from "react";
import { SECTIONS } from "../Header";
import { useActiveSection } from "../../utils";

const RAIL = [{ id: "top", n: "00", label: "Index" }, ...SECTIONS];

// A thin index in the left margin (desktop): section numbers with a progress line that fills
// as you scroll. It lives inside the page gutter, so it never pushes content.
const SectionRail = () => {
  const { active, progress } = useActiveSection(RAIL.map((s) => s.id));
  const current = active || "top";

  return (
    <nav
      aria-label="Sections"
      className="pointer-events-none fixed left-2 top-1/2 z-40 hidden -translate-y-1/2 laptop:block"
    >
      <div className="relative flex flex-col items-center gap-5 py-2">
        <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-ink/20" aria-hidden="true" />
        <span
          className="absolute left-1/2 top-0 w-[2px] -translate-x-1/2 bg-olive transition-[height] duration-150"
          style={{ height: `${Math.round(progress * 100)}%` }}
          aria-hidden="true"
        />
        {RAIL.map((s) => {
          const on = current === s.id;
          return (
            <a
              key={s.id}
              href={`#${s.id}`}
              aria-label={`${s.n} ${s.label}`}
              aria-current={on ? "location" : undefined}
              className={`pointer-events-auto relative flex h-6 w-6 items-center justify-center bg-bone text-[10px] font-semibold tabular-nums tracking-[0.06em] ${
                on ? "text-ink" : "text-fieldgrey hover:text-ink"
              }`}
            >
              {s.n}
              {on && <span className="absolute -right-1 top-1/2 h-[2px] w-2 -translate-y-1/2 bg-olive" aria-hidden="true" />}
            </a>
          );
        })}
      </div>
    </nav>
  );
};

export default SectionRail;
