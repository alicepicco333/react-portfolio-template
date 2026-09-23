import React from "react";
import data from "../../data/portfolio.json";

const Footer = () => {
  const { email, socials, name } = data;

  return (
    <footer id="contact" className="flex flex-col gap-10 bg-ink px-4 pb-6 pt-16 text-bone tablet:px-10 tablet:pt-[68px]">
      <div className="fu-meta flex flex-wrap justify-between gap-4">
        <span>
          04 — Contact / <span className="fu-jp">連絡先</span>
        </span>
        <span className="text-signal">● Open to collaborations</span>
      </div>

      <a href={`mailto:${email}`} className="group flex flex-col">
        <span className="fu-display text-[120px] tablet:text-[200px] laptop:text-phi6">
          Write<span className="text-pink transition-colors group-hover:text-signal">_</span>
        </span>
        <span className="break-all pt-6 font-mono text-xl tablet:text-[32px] laptop:text-phi2">{email} ↗</span>
      </a>

      <div className="fu-meta flex flex-col gap-4 border-t border-[#3A3B35] pt-4 tablet:flex-row tablet:items-center tablet:justify-between">
        <div className="flex flex-wrap gap-2">
          {socials.map((social) => (
            <a
              key={social.id}
              href={social.link}
              target="_blank"
              rel="noreferrer"
              className="fu-btn border-bone text-bone hover:bg-bone hover:text-ink"
            >
              {social.title} ↗
            </a>
          ))}
        </div>
        <span className="text-[#8E9082]">© {new Date().getFullYear()} {name} — Amsterdam</span>
      </div>
    </footer>
  );
};

export default Footer;
