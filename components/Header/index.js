import React, { useState } from "react";
import Link from "next/link";
import data from "../../data/portfolio.json";

const Header = () => {
  const [open, setOpen] = useState(false);
  const { showResume, email, nameJp } = data;

  const links = [
    { href: "/#work", label: "01 Work" },
    { href: "/#about", label: "02 About" },
    ...(showResume ? [{ href: "/resume", label: "03 Record" }] : []),
    { href: "/#contact", label: "04 Contact" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-ink bg-bone">
      <div className="fu-meta mx-auto grid h-14 grid-cols-[1fr_auto] items-center gap-4 px-4 tablet:px-10 laptop:grid-cols-13">
        <Link href="/" className="flex items-center gap-3 font-bold laptop:col-span-3">
          <span className="h-[10px] w-[10px] bg-signal outline outline-1 outline-ink" />
          A.PICCO
          <span className="fu-jp hidden font-normal tablet:inline">{nameJp}</span>
        </Link>

        <span className="hidden text-fieldgrey laptop:col-span-3 laptop:block">52.3676° N · 4.9041° E</span>

        <nav className="hidden gap-7 laptop:col-span-5 laptop:flex" aria-label="Main">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-olive">
              {link.label}
            </Link>
          ))}
        </nav>

        <span className="hidden items-center gap-2 justify-self-end laptop:col-span-2 laptop:flex">
          <span className="fu-blink h-2 w-2 rounded-full bg-olive" />
          Online
        </span>

        <button
          type="button"
          className="fu-meta flex min-h-[44px] items-center gap-2 border border-ink px-4 laptop:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "Close ✕" : "Menu ☰"}
        </button>
      </div>

      {open && (
        <nav id="mobile-menu" className="border-t border-ink bg-ink text-bone laptop:hidden" aria-label="Mobile">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="fu-display block border-b border-[#3A3B35] px-4 py-5 text-[56px]"
            >
              {link.label}
            </Link>
          ))}
          <a href={`mailto:${email}`} className="fu-meta block px-4 py-5 text-signal">
            {email} ↗
          </a>
        </nav>
      )}
    </header>
  );
};

export default Header;
