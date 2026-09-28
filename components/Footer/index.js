import React from "react";
import Link from "next/link";
import data from "../../data/portfolio.json";
import A11yControls from "../A11yControls";

const Footer = () => {
  const { email, socials, name } = data;

  return (
    <footer id="contact" aria-labelledby="contact-title" className="bg-ink px-4 pb-6 pt-8 text-bone tablet:px-8">
      <div className="grid gap-x-4 gap-y-8 pb-16 laptop:grid-cols-4">
        <div className="flex flex-col gap-2">
          <h2 id="contact-title" className="text-[28px] font-semibold tracking-[-0.02em]">Contact</h2>
          <p className="font-mono text-[13px] text-bone/80">Open to work and collaborations · Amsterdam</p>
        </div>
        <div className="laptop:col-span-2">
          <a href={`mailto:${email}`} className="break-all text-[30px] font-semibold tracking-[-0.02em] underline decoration-olive decoration-4 underline-offset-8 hover:decoration-bone tablet:break-normal tablet:text-[48px] laptopl:text-[60px]">
            {email}
          </a>
        </div>
        <ul className="flex flex-col gap-2 font-mono text-[14px]">
          {socials.map((social) => (
            <li key={social.id}>
              <a href={social.link} target="_blank" rel="noreferrer" className="hover:underline">
                {social.title} ↗
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-bone/20 py-4">
        <A11yControls />
        <Link href="/accessibility" className="font-mono text-[14px] underline underline-offset-4">
          Accessibility statement
        </Link>
      </div>
      <div className="flex justify-between border-t border-bone/20 pt-4 font-mono text-[13px] text-bone/80">
        <span>
          © {new Date().getFullYear()} {name}
        </span>
        <a href="#top" className="hover:text-bone">
          Back to top ↑
        </a>
      </div>
    </footer>
  );
};

export default Footer;
