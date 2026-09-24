import React, { useEffect, useState } from "react";
import Link from "next/link";
import data from "../../data/portfolio.json";

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

const Header = () => {
  const [open, setOpen] = useState(false);
  const { showResume, email, name } = data;

  const links = [
    { href: "/#work", label: "Work" },
    { href: "/#about", label: "About" },
    ...(showResume ? [{ href: "/resume", label: "Record" }] : []),
    { href: "/#contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-ink bg-bone">
      <div className="grid h-14 grid-cols-[1fr_auto] items-center gap-x-4 px-4 text-[15px] tablet:px-10 laptop:grid-cols-4">
        <Link href="/" className="font-semibold">
          {name}
        </Link>

        <span className="hidden text-fieldgrey laptop:block">
          <AmsterdamClock />
        </span>

        <nav className="hidden gap-6 font-medium laptop:col-span-2 laptop:flex" aria-label="Main">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:underline">
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="flex min-h-[44px] items-center px-2 font-medium laptop:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open && (
        <nav id="mobile-menu" className="border-t border-ink bg-ink px-4 pb-6 text-bone laptop:hidden" aria-label="Mobile">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="fu-display block border-b border-[#3A3B35] py-4 text-[40px]"
            >
              {link.label}
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
