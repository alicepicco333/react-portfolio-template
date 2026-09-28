import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import data from "../../data/portfolio.json";
import ShuffleButton from "../ShuffleButton";
import GraphMark from "../GraphMark";
import { useActiveSection } from "../../utils";

// Live Amsterdam time — rendered client-side only, so static HTML never mismatches.
const AmsterdamClock = () => {
  const [time, setTime] = useState(null);

  useEffect(() => {
    const format = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Amsterdam",
      hour: "2-digit",
      minute: "2-digit",
    });
    const tick = () => setTime(format.format(new Date()));
    tick();
    const id = setInterval(tick, 10000);
    return () => clearInterval(id);
  }, []);

  return <span>Amsterdam {time || "--:--"}</span>;
};

// Numbered sections of the home page, shared with the left rail.
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
    <header className="sticky top-0 z-50 border-b border-ink bg-bone">
      <div className="grid h-14 grid-cols-[1fr_auto] items-center gap-x-4 px-4 text-[15px] tablet:px-10 laptop:grid-cols-4">
        <Link href="/" className="-m-2 flex w-max items-center p-2 text-ink" aria-label={`${name} — home`}>
          <GraphMark size={30} />
        </Link>

        <span className="hidden text-fieldgrey laptop:block">
          <AmsterdamClock />
        </span>

        <nav className="hidden h-full items-stretch gap-7 laptop:col-span-2 laptop:flex" aria-label="Main">
          {SECTIONS.map((s) => {
            const current = onHome && active === s.id;
            return (
              <Link
                key={s.id}
                href={`/#${s.id}`}
                aria-current={current ? "location" : undefined}
                className="group relative flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.12em]"
              >
                <span className="text-olive">{s.n}</span>
                <span>{s.label}</span>
                <span
                  className={`absolute inset-x-0 bottom-0 h-[3px] origin-left bg-olive transition-transform duration-300 ${
                    current ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                  aria-hidden="true"
                />
              </Link>
            );
          })}
          <span className="ml-auto flex items-center">
            <ShuffleButton />
          </span>
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
        <nav id="mobile-menu" className="border-t border-ink bg-ink px-4 pb-6 text-bone laptop:hidden" aria-label="Mobile">
          {SECTIONS.map((s) => (
            <Link
              key={s.id}
              href={`/#${s.id}`}
              onClick={() => setOpen(false)}
              className="flex items-baseline gap-4 border-b border-bone/20 py-4"
            >
              <span className="fu-meta text-signal">{s.n}</span>
              <span className="fu-display text-[40px] uppercase tracking-[0.02em]">{s.label}</span>
            </Link>
          ))}
          <div className="pt-4 text-[15px]">
            <ShuffleButton showName={false} />
          </div>
          <a href={`mailto:${email}`} className="block pt-2 text-[15px] text-signal">
            {email} ↗
          </a>
        </nav>
      )}
    </header>
  );
};

export default Header;
