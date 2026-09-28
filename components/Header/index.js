import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import data from "../../data/portfolio.json";
import GraphMark from "../GraphMark";
import { useActiveSection } from "../../utils";

// Sections of the home page (the nav follows the one on screen).
export const SECTIONS = [
  { id: "map", label: "Map" },
  { id: "work", label: "Work" },
  { id: "about", label: "About" },
];

const Header = () => {
  const [open, setOpen] = useState(false);
  const { email, name } = data;
  const { pathname } = useRouter();
  const onHome = pathname === "/";
  const { active } = useActiveSection(onHome ? [...SECTIONS.map((s) => s.id), "in-progress", "record"] : []);
  const current = (id) => onHome && (active === id || (id === "work" && active === "in-progress") || (id === "about" && active === "record"));

  return (
    <header className="sticky top-0 z-50 w-full border-b border-ink bg-bone text-ink">
      <div className="flex h-16 items-center gap-6 px-4 tablet:px-8">
        <Link href="/" className="-m-2 flex items-center p-2" aria-label={`${name}, home`}>
          <GraphMark size={34} />
        </Link>
        <span className="hidden font-mono text-[12px] text-graphite laptop:block">Creative technologist &amp; researcher · Amsterdam</span>

        <nav className="ml-auto hidden h-full items-center gap-7 text-[15px] tablet:flex" aria-label="Main">
          {SECTIONS.map((s) => (
            <Link
              key={s.id}
              href={`/#${s.id}`}
              aria-current={current(s.id) ? "location" : undefined}
              className={`border-b-2 py-1 transition-colors ${current(s.id) ? "border-olive" : "border-transparent hover:border-ink"}`}
            >
              {s.label}
            </Link>
          ))}
          <Link href="/resume" className={`px-3 py-2 text-white transition-colors ${pathname === "/resume" ? "bg-ink" : "bg-olive hover:bg-ink"}`}>
            CV
          </Link>
        </nav>

        <button
          type="button"
          className="ml-auto flex min-h-[44px] items-center px-2 font-mono text-[13px] uppercase tablet:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open && (
        <nav id="mobile-menu" className="border-t border-ink bg-bone px-4 pb-6 tablet:hidden" aria-label="Mobile">
          {[...SECTIONS, { id: "contact", label: "Contact" }].map((s) => (
            <Link key={s.id} href={`/#${s.id}`} onClick={() => setOpen(false)} className="block border-b border-ink/20 py-4 text-[32px] font-semibold tracking-[-0.02em]">
              {s.label}
            </Link>
          ))}
          <Link href="/resume" onClick={() => setOpen(false)} className="block border-b border-ink/20 py-4 text-[32px] font-semibold tracking-[-0.02em]">
            CV
          </Link>
          <a href={`mailto:${email}`} className="block pt-5 text-[15px] text-olive underline">
            {email}
          </a>
        </nav>
      )}
    </header>
  );
};

export default Header;
