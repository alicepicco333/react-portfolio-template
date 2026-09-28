import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import data from "../../data/portfolio.json";
import GraphMark from "../GraphMark";
import { useActiveSection } from "../../utils";

// Sections of the home page (the nav follows the one on screen).
export const SECTIONS = [
  { id: "work", n: "01", label: "Work" },
  { id: "about", n: "02", label: "About" },
  { id: "record", n: "03", label: "Record" },
  { id: "contact", n: "04", label: "Contact" },
];

const Header = () => {
  const [open, setOpen] = useState(false);
  const { email, name } = data;
  const { pathname } = useRouter();
  const onHome = pathname === "/";
  const { active } = useActiveSection(onHome ? SECTIONS.map((s) => s.id) : []);

  return (
    <header className={`z-50 w-full ${onHome ? "absolute inset-x-0 top-0 text-bone" : "relative text-ink"}`}>
      <div className="flex h-16 items-center justify-between gap-x-4 px-4 text-[15px] tablet:px-10">
        <Link href="/" className="-m-2 flex w-max items-center p-2" aria-label={`${name} — home`}>
          <GraphMark size={30} />
        </Link>

        <nav className="hidden h-full items-stretch gap-8 laptop:flex" aria-label="Main">
          {SECTIONS.map((s) => {
            const current = onHome && active === s.id;
            return (
              <Link
                key={s.id}
                href={`/#${s.id}`}
                aria-current={current ? "location" : undefined}
                className="group relative flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.12em]"
              >
                <span>{s.label}</span>
                <span
                  className={`absolute inset-x-0 bottom-3 h-[2px] origin-left transition-transform duration-300 ${onHome ? "bg-signal" : "bg-olive"} ${
                    current ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                  aria-hidden="true"
                />
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          className="flex min-h-[44px] items-center px-2 text-[13px] font-semibold uppercase tracking-[0.12em] laptop:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open && (
        <nav id="mobile-menu" className="relative z-50 bg-ink px-4 pb-6 text-bone laptop:hidden" aria-label="Mobile">
          {SECTIONS.map((s) => (
            <Link
              key={s.id}
              href={`/#${s.id}`}
              onClick={() => setOpen(false)}
              className="flex items-baseline gap-4 border-b border-bone/20 py-4"
            >
              <span className="fu-display text-[40px] uppercase tracking-[0.02em]">{s.label}</span>
            </Link>
          ))}
          <a href={`mailto:${email}`} className="block pt-5 text-[15px] text-signal">
            {email} ↗
          </a>
        </nav>
      )}
    </header>
  );
};

export default Header;
