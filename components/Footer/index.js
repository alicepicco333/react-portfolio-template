import React from "react";
import data from "../../data/portfolio.json";

const Footer = () => {
  const { email, socials, name } = data;

  return (
    <footer id="contact" className="bg-ink px-4 pb-6 pt-4 text-bone tablet:px-10">
      <div className="grid gap-x-4 gap-y-10 pb-20 laptop:grid-cols-4 laptop:pb-[110px]">
        <h2 className="fu-title text-phi1">Contact</h2>
        <div className="flex flex-col gap-6 laptop:col-span-2">
          <a href={`mailto:${email}`} className="fu-display break-all text-[32px] hover:text-signal tablet:break-normal tablet:text-[48px] laptopl:text-[64px]">
            {email}
          </a>
          <p className="fu-meta text-bone/60">Open to collaborations — based in Amsterdam.</p>
        </div>
        <ul className="flex flex-col gap-2 text-[15px] font-medium">
          {socials.map((social) => (
            <li key={social.id}>
              <a href={social.link} target="_blank" rel="noreferrer" className="hover:text-signal">
                {social.title} ↗
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="fu-meta flex justify-between border-t border-[#3A3B35] pt-4 text-bone/60">
        <span>© {new Date().getFullYear()} {name}</span>
        <a href="#top" className="hover:text-bone">
          Back to top ↑
        </a>
      </div>
    </footer>
  );
};

export default Footer;
