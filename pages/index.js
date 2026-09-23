import React, { useRef, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import Header from "../components/Header";
import Footer from "../components/Footer";
import WorkCard from "../components/WorkCard";
import PracticeMap from "../components/PracticeMap";
import ScrambleText from "../components/ScrambleText";
import Marquee from "../components/Marquee";
import portfolioData from "../data/portfolio.json";
import { categoryMeta, useIsomorphicLayoutEffect } from "../utils";

const categories = [...new Set(portfolioData.projects.map((project) => project.category))];

// Golden pairing on the 13-column grid: 8 + 5, then 5 + 8; a lone last card spans the row.
const spanFor = (index, count) => {
  if (index === count - 1 && index % 2 === 0) return "laptop:col-span-13";
  const wideFirst = Math.floor(index / 2) % 2 === 0;
  return (index % 2 === 0) === wideFirst ? "laptop:col-span-8" : "laptop:col-span-5";
};

const Home = () => {
  const [filter, setFilter] = useState("all");
  const pageRef = useRef(null);
  const { projects, resume, roles, email } = portfolioData;

  // The statement above already says the opening clause, so continue from "weaving together…".
  const aboutRest = resume.description.replace(/^I work at the intersection of culture, technology, and design, /, "");
  const aboutDetail = aboutRest.charAt(0).toUpperCase() + aboutRest.slice(1);

  const filteredProjects = projects.filter((project) => filter === "all" || project.category === filter);

  useIsomorphicLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(".fu-hero-line", { yPercent: 110, duration: 1.1, stagger: 0.12, ease: "power4.out" });
      gsap.from(".fu-hero-fade", { opacity: 0, y: 24, duration: 0.9, delay: 0.5, stagger: 0.1, ease: "power3.out" });

      gsap.utils.toArray(".fu-reveal").forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 56,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        });
      });
    });

    return () => mm.revert();
  }, []);

  useIsomorphicLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        ".fu-work-card",
        { autoAlpha: 0, y: 40 },
        { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.07, ease: "power2.out", onComplete: () => ScrollTrigger.refresh() }
      );
    });
    return () => mm.revert();
  }, [filter]);

  const filterButtons = [
    { id: "all", label: "All", tone: "#151613" },
    ...categories.map((category) => ({ id: category, label: categoryMeta(category).short, tone: categoryMeta(category).tone })),
  ];

  return (
    <div ref={pageRef} className="min-h-screen bg-bone text-ink">
      <Head>
        <title>Alice Picco — HCI, design, digital humanities</title>
        <meta name="description" content={portfolioData.aboutpara} />
        <meta name="theme-color" content="#E8E4DA" />
        <link rel="icon" href={`${process.env.NEXT_PUBLIC_BASE_PATH}/favicon.ico`} />
      </Head>

      <Header />

      <main>
        {/* ——— Hero: 61.8 / 38.2 ——— */}
        <section id="top" className="grid border-b border-ink laptop:h-[calc(100svh-56px)] laptop:max-h-[900px] laptop:min-h-[760px] laptop:grid-cols-golden">
          <div className="relative flex flex-col justify-between gap-12 overflow-hidden px-4 py-10 tablet:px-10 laptop:border-r laptop:border-ink laptop:py-10 laptop:pl-24 laptop:pr-10">
            <span className="fu-jp fu-vertical absolute left-9 top-10 hidden text-[13px] tracking-[0.4em] laptop:block">研究・設計・開発</span>
            <span className="absolute bottom-10 left-11 hidden h-[260px] w-px bg-ink laptop:block" />

            <div className="fu-meta fu-hero-fade flex justify-between gap-4">
              <span>{portfolioData.headerTaglineOne} — Unit 01</span>
              <span className="hidden text-fieldgrey tablet:inline">Fig. 00 / Portrait of a practice</span>
            </div>

            <h1 className="fu-display text-[34vw] tablet:text-[200px] laptopl:text-phi6">
              <span className="-my-[0.06em] block overflow-hidden py-[0.06em]">
                <span className="fu-hero-line block">Alice</span>
              </span>
              <span className="-my-[0.06em] block overflow-hidden py-[0.06em]">
                <span className="fu-hero-line block">
                  Picco<span className="text-signal [-webkit-text-stroke:2px_#151613]">.</span>
                </span>
              </span>
            </h1>

            <div className="fu-hero-fade flex flex-col gap-4">
              <div className="flex items-center gap-4 font-mono text-lg uppercase tablet:text-phi1">
                <ScrambleText words={roles} delay={900} className="bg-ink px-3 py-1 text-bone" />
                <span className="fu-blink h-7 w-3 bg-ink" aria-hidden="true" />
              </div>
              <p className="max-w-[620px] text-xl leading-snug [font-stretch:90%] tablet:text-phi1">
                I&apos;m Alice, {portfolioData.headerTaglineThree} {portfolioData.headerTaglineFour.replace(/\.$/, "")} —
                working between culture, code and interfaces.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <Link href="#work" className="fu-btn fu-btn-primary">
                  See the work ↓
                </Link>
                <a href={`mailto:${email}`} className="fu-btn fu-btn-secondary">
                  Write to me
                </a>
              </div>
            </div>

            <div className="pointer-events-none absolute right-6 top-24 hidden flex-col items-end gap-5 tablet:flex laptop:right-12 laptop:top-28">
              <span className="fu-sticker fu-wob bg-pink [--r:7deg]">HCI specialist</span>
              <span className="fu-sticker fu-wob mr-24 bg-lilac [--r:-5deg] [animation-delay:-2s]">digital humanist</span>
              <span className="fu-sticker fu-wob mr-4 bg-mint [--r:4deg] [animation-delay:-3.5s]">
                designer <span className="fu-jp">設計</span>
              </span>
            </div>
          </div>

          <div className="h-[620px] border-t border-ink laptop:h-auto laptop:border-t-0">
            <PracticeMap
              stats={[
                `${String(projects.length).padStart(2, "0")} works`,
                `${String(resume.experiences.length).padStart(2, "0")} posts`,
                "02 degrees",
              ]}
            />
          </div>
        </section>

        {/* ——— Marquees ——— */}
        <div className="border-b border-ink">
          <Marquee
            className="bg-ink py-3 text-bone"
            itemClassName="fu-display text-[34px] leading-none tablet:text-phi2"
            separator={<span className="text-signal">■</span>}
            items={[
              "Human–Computer Interaction",
              "Design",
              "Digital Humanities",
              <span key="jp" className="fu-jp text-[28px] font-bold normal-case tablet:text-[34px]">人とコンピュータ</span>,
            ]}
          />
          <Marquee
            reverse
            className="bg-pink py-2"
            itemClassName="fu-meta text-[13px]"
            items={[resume.tagline, "Amsterdam", "Live coding with Hydra", "Semantic web", "Feminist data visualization"]}
          />
        </div>

        {/* ——— Works ——— */}
        <section id="work" className="scroll-mt-14 px-4 pb-16 pt-20 tablet:px-10 laptop:pb-[68px] laptop:pt-[110px]">
          <div className="fu-reveal grid items-end gap-6 border-b border-ink pb-7 laptop:grid-cols-13 laptop:gap-x-4">
            <span className="fu-jp fu-vertical hidden text-phi1 font-bold laptop:col-span-1 laptop:block">作品</span>
            <h2 className="fu-display text-[110px] tablet:text-phi5 laptop:col-span-7">
              Works
              <sup className="align-top font-mono text-base font-normal [font-stretch:100%]">
                ({String(filteredProjects.length).padStart(2, "0")})
              </sup>
            </h2>
            <div className="flex flex-wrap gap-2 laptop:col-span-5 laptop:justify-end" role="group" aria-label="Filter works by category">
              {filterButtons.map((button) => {
                const active = filter === button.id;
                return (
                  <button
                    key={button.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setFilter(button.id)}
                    className={`fu-btn px-4 ${active ? "bg-ink text-bone" : "bg-transparent text-ink hover:bg-paper"}`}
                  >
                    <span className="h-[10px] w-[10px] border border-current" style={{ background: button.tone }} />
                    {button.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 grid gap-4 laptop:grid-cols-13">
            {filteredProjects.map((project, index) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className={`fu-card fu-work-card block ${spanFor(index, filteredProjects.length)}`}
              >
                <WorkCard
                  img={project.imageSrc || (project.highlightImage?.startsWith("http") ? project.highlightImage : "")}
                  name={project.title}
                  description={project.description}
                  tags={project.tags}
                  category={project.category}
                  jp={project.jp}
                  cardNumber={String(projects.indexOf(project) + 1).padStart(2, "0")}
                />
              </Link>
            ))}
          </div>
        </section>

        {/* ——— About: 38.2 / 61.8 ——— */}
        <section id="about" className="grid scroll-mt-14 border-y border-ink laptop:grid-cols-golden-rev">
          <div className="relative flex flex-col justify-between gap-8 overflow-hidden border-b border-ink bg-khaki px-4 py-12 tablet:px-10 laptop:border-b-0 laptop:border-r laptop:py-[68px]">
            <span className="fu-meta">
              02 — About / <span className="fu-jp">概要</span>
            </span>
            <svg viewBox="0 0 220 220" className="fu-spin mx-auto h-[180px] w-[180px] tablet:h-[220px] tablet:w-[220px]" aria-hidden="true">
              <defs>
                <path id="fu-ring" d="M110,110 m-86,0 a86,86 0 1,1 172,0 a86,86 0 1,1 -172,0" />
              </defs>
              <text fontFamily="JetBrains Mono, monospace" fontSize="12.5" letterSpacing="2.5" fill="#151613">
                <textPath href="#fu-ring">ANTHROPOLOGY ■ DIGITAL HUMANITIES ■ DESIGN ■ HCI ■</textPath>
              </text>
              <rect x="80" y="80" width="60" height="60" fill="#151613" />
              <text x="110" y="117" textAnchor="middle" fontFamily="Noto Sans JP, sans-serif" fontSize="22" fontWeight="700" fill="#F2C4CE">
                アリス
              </text>
            </svg>
            <span className="fu-meta">Based in Amsterdam</span>
          </div>
          <div className="fu-reveal flex flex-col gap-10 px-4 py-12 tablet:px-10 laptop:py-[68px] laptop:pl-[68px]">
            <p className="text-[40px] font-bold uppercase leading-[0.98] [font-stretch:75%] tablet:text-phi3">
              I work at the intersection of culture, technology <span className="bg-lilac px-2">&amp; design</span>.
            </p>
            <div className="grid gap-6 text-[17px] leading-relaxed tablet:grid-cols-2">
              <p>{portfolioData.aboutpara}</p>
              <p>{aboutDetail}</p>
            </div>
          </div>
        </section>

        {/* ——— Record ——— */}
        <section id="record" className="grid gap-10 px-4 py-20 tablet:px-10 laptop:grid-cols-13 laptop:gap-x-4 laptop:py-[110px]">
          <div className="fu-reveal flex flex-col gap-6 laptop:col-span-5">
            <h2 className="fu-display text-[110px] tablet:text-phi5">Record</h2>
            <span className="fu-jp">経歴</span>
            <Link href="/resume" className="fu-btn fu-btn-primary self-start">
              Full résumé ↗
            </Link>
          </div>
          <ol className="fu-reveal border-t border-ink laptop:col-span-8">
            {[
              ...resume.experiences.map((e) => ({ ...e, tone: "#4B5238" })),
              ...[resume.education, resume.education2].map((e, i) => ({
                id: `edu-${i}`,
                dates: e.universityDate,
                position: e.universityName,
                bullets: e.universityPara,
                type: "Education",
                tone: "#CFC6E8",
              })),
            ].map((entry) => (
              <li
                key={entry.id}
                className="grid grid-cols-[18px_1fr] gap-x-4 gap-y-1 border-b border-concrete py-5 tablet:grid-cols-[170px_18px_1fr_110px]"
              >
                <span className="fu-meta col-span-2 text-fieldgrey tablet:col-span-1 tablet:pt-1">{entry.dates}</span>
                <span className="mt-1 h-3 w-3 border border-ink" style={{ background: entry.tone }} />
                <span className="flex flex-col gap-1">
                  <span className="text-xl font-bold">{entry.position}</span>
                  <span className="text-[15px] text-graphite">{entry.bullets}</span>
                </span>
                <span className="fu-meta col-start-2 text-[11px] tablet:col-start-auto tablet:pt-1 tablet:text-right">{entry.type}</span>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
