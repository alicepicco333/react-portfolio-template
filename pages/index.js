import React, { useRef } from "react";
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

// Works are shown in three groups; older work is listed under past projects.
const GROUPS = [
  { id: "Design", blurb: "Interfaces, archives & the web" },
  { id: "Research", blurb: "Digital editions, ontologies & data" },
  { id: "Live Coding", blurb: "Hydra, performance & workshops" },
];

// Golden pairing on the 13-column grid: 8 + 5, then 5 + 8; a lone last card spans the row.
const spanFor = (index, count) => {
  if (index === count - 1 && index % 2 === 0) return "laptop:col-span-13";
  const wideFirst = Math.floor(index / 2) % 2 === 0;
  return (index % 2 === 0) === wideFirst ? "laptop:col-span-8" : "laptop:col-span-5";
};

const Home = () => {
  const pageRef = useRef(null);
  const { projects, resume, roles, email } = portfolioData;

  // The statement above already says the opening clause, so continue from "weaving together…".
  const aboutRest = resume.description.replace(/^I work at the intersection of culture, technology, and design, /, "");
  const aboutDetail = aboutRest.charAt(0).toUpperCase() + aboutRest.slice(1);

  const groups = GROUPS.map((group) => ({
    ...group,
    ...categoryMeta(group.id),
    items: projects.filter((project) => project.category === group.id),
  }));
  const wip = projects.filter((project) => project.category === "Work in Progress");
  const archive = projects.filter((project) => project.category === "Past Projects");
  // Running catalogue number in display order: groups, work in progress, past projects.
  const ordered = [...groups.flatMap((group) => group.items), ...wip, ...archive];
  const numberOf = (project) => String(ordered.indexOf(project) + 1).padStart(2, "0");
  const imageOf = (project) =>
    project.imageSrc || (project.highlightImage?.startsWith("http") ? project.highlightImage : "");

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
        {/* ——— Hero: 38.2 intro / 61.8 practice map ——— */}
        <section id="top" className="grid border-b border-ink laptop:h-[calc(100svh-56px)] laptop:max-h-[860px] laptop:min-h-[700px] laptop:grid-cols-golden-rev">
          <div className="relative flex flex-col justify-between gap-12 px-4 py-10 tablet:px-10 laptop:border-r laptop:border-ink laptop:py-[68px] laptop:pl-24 laptop:pr-10">
            <span className="fu-meta fu-vertical absolute left-9 top-[68px] hidden text-[11px] tracking-[0.3em] text-fieldgrey laptop:block">
              Research · Design · Creative technology
            </span>

            <div className="flex flex-col gap-6">
              <h1 className="fu-display text-[72px] tablet:text-phi4">
                <span className="-my-[0.06em] block overflow-hidden py-[0.06em]">
                  <span className="fu-hero-line block">Alice</span>
                </span>
                <span className="-my-[0.06em] block overflow-hidden py-[0.06em]">
                  <span className="fu-hero-line block">Picco</span>
                </span>
              </h1>
              <div className="fu-hero-fade flex items-center gap-3 font-mono text-base uppercase tablet:text-lg">
                <ScrambleText words={roles} delay={900} className="bg-ink px-3 py-1 text-bone" />
                <span className="fu-blink h-5 w-2 bg-ink" aria-hidden="true" />
              </div>
            </div>

            <div className="fu-hero-fade flex flex-col gap-6">
              <p className="max-w-[440px] text-lg leading-relaxed tablet:text-xl">
                I&apos;m Alice, {portfolioData.headerTaglineThree} {portfolioData.headerTaglineFour.replace(/\.$/, "")} —
                working between culture, code and interfaces.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link href="#work" className="fu-btn fu-btn-primary">
                  See the work ↓
                </Link>
                <a href={`mailto:${email}`} className="fu-btn fu-btn-secondary">
                  Write to me
                </a>
              </div>
            </div>
          </div>

          <div className="h-[560px] border-t border-ink tablet:h-[640px] laptop:h-auto laptop:border-t-0">
            <PracticeMap projects={projects} />
          </div>
        </section>

        {/* ——— Marquees ——— */}
        <div className="border-b border-ink">
          <Marquee
            className="bg-ink py-3 text-bone"
            itemClassName="fu-display text-[26px] leading-none tablet:text-[34px]"
            separator={<span className="text-signal">■</span>}
            items={[
              "Human–Computer Interaction",
              "Design",
              "Digital Humanities",
              "People × Computers",
            ]}
          />
          <Marquee
            reverse
            className="bg-pink py-2"
            itemClassName="fu-meta text-[13px]"
            items={[resume.tagline, "Amsterdam", "Live coding with Hydra", "Semantic web", "Feminist data visualization"]}
          />
        </div>

        {/* ——— Works: three groups ——— */}
        <section id="work" className="scroll-mt-14 px-4 pb-16 pt-20 tablet:px-10 laptop:pb-[68px] laptop:pt-[110px]">
          <div className="fu-reveal grid items-end gap-6 border-b border-ink pb-7 laptop:grid-cols-13 laptop:gap-x-4">
            <span className="fu-meta fu-vertical hidden text-[11px] tracking-[0.3em] laptop:col-span-1 laptop:block">Selected · 2022—now</span>
            <h2 className="fu-display relative text-[72px] tablet:text-phi4 laptop:col-span-7">
              Works
              <sup className="align-top font-mono text-base font-normal">
                ({String(groups.reduce((sum, group) => sum + group.items.length, 0)).padStart(2, "0")})
              </sup>
            </h2>
            <nav className="flex flex-wrap gap-2 laptop:col-span-5 laptop:justify-end" aria-label="Jump to a group of works">
              {[...groups, { id: "Work in Progress", short: "In progress", items: wip }, { id: "Past Projects", short: "Past projects", items: archive }].map((group) => (
                <a
                  key={group.id}
                  href={`#works-${group.id.toLowerCase().replace(/ /g, "-")}`}
                  className="fu-btn px-4 hover:bg-ink hover:text-bone"
                >
                  {group.short}
                  <span className="opacity-60">{String(group.items.length).padStart(2, "0")}</span>
                </a>
              ))}
            </nav>
          </div>

          {groups.map((group, groupIndex) => (
            <div key={group.id} id={`works-${group.id.toLowerCase().replace(/ /g, "-")}`} className="scroll-mt-20 pt-14 laptop:pt-[68px]">
              <div className="fu-reveal flex flex-wrap items-end justify-between gap-4 border-b border-ink pb-4">
                <div className="flex items-end gap-4">
                  <span className="fu-meta pb-2">{String(groupIndex + 1).padStart(2, "0")} /</span>
                  <h3 className="fu-title flex items-center gap-4 text-[48px] tablet:text-phi3">
                    {group.short}
                  </h3>
                  <span className="fu-meta pb-2">({String(group.items.length).padStart(2, "0")})</span>
                </div>
                <span className="fu-meta pb-2 text-graphite">{group.blurb}</span>
              </div>

              <div className="mt-4 grid gap-4 laptop:grid-cols-13">
                {group.items.map((project, index) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className={`fu-card fu-reveal block ${spanFor(index, group.items.length)}`}
                  >
                    <WorkCard
                      img={imageOf(project)}
                      name={project.title}
                      description={project.description}
                      tags={project.tags}
                      category={project.category}
                      cardNumber={numberOf(project)}
                    />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* ——— Work in progress, as an index ——— */}
        <section id="works-work-in-progress" className="scroll-mt-14 border-t border-ink px-4 py-16 tablet:px-10 laptop:py-[110px]">
          <div className="grid gap-8 laptop:grid-cols-13 laptop:gap-x-4">
            <div className="fu-reveal flex flex-col gap-4 laptop:col-span-5">
              <span className="fu-meta">{String(groups.length + 1).padStart(2, "0")} / Work in progress</span>
              <h2 className="fu-display text-[64px] tablet:text-phi4">In progress</h2>
              <p className="max-w-[360px] text-[15px] text-graphite">What I&apos;m working on right now.</p>
            </div>
            <ol className="fu-reveal border-t border-ink laptop:col-span-8">
              {wip.map((project) => (
                <li key={project.id}>
                  <Link
                    href={`/projects/${project.id}`}
                    className="group grid grid-cols-[44px_1fr_auto] items-baseline gap-4 border-b border-concrete px-2 py-6 transition-colors hover:bg-olive hover:text-bone tablet:grid-cols-[60px_1fr_170px_32px]"
                  >
                    <span className="fu-meta">{numberOf(project)}</span>
                    <span className="flex flex-col gap-2">
                      <span className="fu-title text-[32px] tablet:text-phi2">{project.title}</span>
                      <span className="text-[15px] text-graphite transition-colors group-hover:text-bone/80">{project.description}</span>
                    </span>
                    <span className="fu-meta hidden items-center gap-2 text-[11px] tablet:flex">
                      <span className="fu-blink h-2 w-2 rounded-full bg-olive group-hover:bg-signal" aria-hidden="true" />
                      In progress
                    </span>
                    <span className="font-mono text-xl" aria-hidden="true">
                      ↗
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ——— Past projects, as an index ——— */}
        <section id="works-past-projects" className="scroll-mt-14 border-t border-ink bg-paper px-4 py-16 tablet:px-10 laptop:py-[110px]">
          <div className="grid gap-8 laptop:grid-cols-13 laptop:gap-x-4">
            <div className="fu-reveal flex flex-col gap-4 laptop:col-span-5">
              <span className="fu-meta">{String(groups.length + 2).padStart(2, "0")} / Past projects</span>
              <h2 className="fu-display text-[64px] tablet:text-phi4">Past projects</h2>
            </div>
            <ol className="fu-reveal border-t border-ink laptop:col-span-8">
              {archive.map((project) => (
                <li key={project.id}>
                  <Link
                    href={`/projects/${project.id}`}
                    className="group grid grid-cols-[44px_1fr_auto] items-baseline gap-4 border-b border-concrete px-2 py-6 transition-colors hover:bg-ink hover:text-bone tablet:grid-cols-[60px_1fr_220px_32px]"
                  >
                    <span className="fu-meta">{numberOf(project)}</span>
                    <span className="flex flex-col gap-2">
                      <span className="fu-title text-[36px] tablet:text-phi2">{project.title}</span>
                      <span className="text-[15px] text-graphite transition-colors group-hover:text-bone/80">{project.description}</span>
                    </span>
                    <span className="fu-meta hidden text-[11px] tablet:block">{project.tags?.join(" / ")}</span>
                    <span className="font-mono text-xl" aria-hidden="true">
                      ↗
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ——— About: 38.2 / 61.8 ——— */}
        <section id="about" className="grid scroll-mt-14 border-y border-ink laptop:grid-cols-golden-rev">
          <div className="relative flex flex-col justify-between gap-8 overflow-hidden border-b border-ink bg-khaki px-4 py-12 tablet:px-10 laptop:border-b-0 laptop:border-r laptop:py-[68px]">
            <span className="fu-meta">
              02 — About
            </span>
            <svg viewBox="0 0 220 220" className="fu-spin mx-auto h-[180px] w-[180px] tablet:h-[220px] tablet:w-[220px]" aria-hidden="true">
              <defs>
                <path id="fu-ring" d="M110,110 m-86,0 a86,86 0 1,1 172,0 a86,86 0 1,1 -172,0" />
              </defs>
              <text fontFamily="Space Mono, monospace" fontSize="12.5" letterSpacing="2.5" fill="#151613">
                <textPath href="#fu-ring">ANTHROPOLOGY ■ DIGITAL HUMANITIES ■ DESIGN ■ HCI ■</textPath>
              </text>
              <rect x="80" y="80" width="60" height="60" fill="#151613" />
              <text x="110" y="119" textAnchor="middle" fontFamily="Big Shoulders Display, sans-serif" fontSize="30" fontWeight="800" fill="#F2C4CE">
                AP
              </text>
            </svg>
            <span className="fu-meta">Based in Amsterdam</span>
          </div>
          <div className="fu-reveal flex flex-col gap-10 px-4 py-12 tablet:px-10 laptop:py-[68px] laptop:pl-[68px]">
            <p className="fu-title text-[44px] leading-[0.98] tablet:text-phi3">
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
            <h2 className="fu-display text-[72px] tablet:text-phi4">Record</h2>
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
                className="grid gap-y-1 border-b border-concrete py-5 tablet:grid-cols-[170px_1fr_110px] tablet:gap-x-4"
              >
                <span className="fu-meta text-fieldgrey tablet:pt-1">{entry.dates}</span>
                <span className="flex flex-col gap-1">
                  <span className="text-xl font-bold">{entry.position}</span>
                  <span className="text-[15px] text-graphite">{entry.bullets}</span>
                </span>
                <span className="fu-meta text-[11px] tablet:pt-1 tablet:text-right">{entry.type}</span>
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
