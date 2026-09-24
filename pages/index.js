import React from "react";
import Head from "next/head";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import Header from "../components/Header";
import Footer from "../components/Footer";
import WorkCard from "../components/WorkCard";
import PracticeMap from "../components/PracticeMap";
import portfolioData from "../data/portfolio.json";
import { categoryMeta, useIsomorphicLayoutEffect } from "../utils";

// Works are shown in three groups; ongoing and older work follow as indexes.
const GROUPS = [
  { id: "Design", blurb: "Interfaces, archives & the web" },
  { id: "Research", blurb: "Digital editions, ontologies & data" },
  { id: "Live Coding", blurb: "Hydra, performance & workshops" },
];

const anchorOf = (id) => `works-${id.toLowerCase().replace(/ /g, "-")}`;
const pad = (n) => String(n).padStart(2, "0");

// Swiss section: a label column on the left, content across the other three.
const Section = ({ id, number, title, note, className = "", children }) => (
  <section id={id} className={`scroll-mt-14 border-t border-ink px-4 pb-20 pt-4 tablet:px-10 laptop:pb-[110px] ${className}`}>
    <div className="grid gap-x-4 gap-y-8 laptop:grid-cols-4">
      <div className="fu-reveal flex flex-col gap-1">
        {number && <span className="fu-meta text-fieldgrey">{number}</span>}
        <h2 className="fu-title text-phi1">{title}</h2>
        {note && <p className="fu-meta max-w-[260px] text-graphite">{note}</p>}
      </div>
      <div className="laptop:col-span-3">{children}</div>
    </div>
  </section>
);

// An index row for work in progress and past projects.
const IndexRow = ({ project, number, status }) => (
  <li>
    <Link
      href={`/projects/${project.id}`}
      className="group grid grid-cols-[40px_1fr] gap-x-4 gap-y-1 border-b border-concrete py-5 transition-colors hover:bg-paper tablet:grid-cols-[48px_1fr_180px]"
    >
      <span className="fu-meta pt-1 text-fieldgrey">{number}</span>
      <span className="flex flex-col gap-1">
        <span className="fu-title text-[22px] group-hover:underline">{project.title}</span>
        <span className="text-[15px] leading-snug text-graphite">{project.description}</span>
      </span>
      <span className="fu-meta col-start-2 flex items-center gap-2 pt-1 text-graphite tablet:col-start-auto">
        {status ? (
          <>
            <span className="fu-blink h-2 w-2 rounded-full bg-olive" aria-hidden="true" />
            {status}
          </>
        ) : (
          project.tags?.join(", ")
        )}
      </span>
    </Link>
  </li>
);

const Home = () => {
  const { projects, resume, roles, email } = portfolioData;

  // The statement already says the opening clause, so continue from "weaving together…".
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
  const numberOf = (project) => pad(ordered.indexOf(project) + 1);
  const imageOf = (project) =>
    project.imageSrc || (project.highlightImage?.startsWith("http") ? project.highlightImage : "");

  const index = [
    ...groups,
    { id: "Work in Progress", short: "In progress", items: wip },
    { id: "Past Projects", short: "Past projects", items: archive },
  ];

  const record = [
    ...resume.experiences,
    ...[resume.education, resume.education2].map((e, i) => ({
      id: `edu-${i}`,
      dates: e.universityDate,
      position: e.universityName,
      bullets: e.universityPara,
      type: "Education",
    })),
  ];

  useIsomorphicLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(".fu-hero-fade", { opacity: 0, y: 16, duration: 0.8, stagger: 0.08, ease: "power3.out" });
      gsap.utils.toArray(".fu-reveal").forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 24,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <div className="min-h-screen bg-bone text-ink">
      <Head>
        <title>Alice Picco — HCI, design, digital humanities</title>
        <meta name="description" content={portfolioData.aboutpara} />
        <meta name="theme-color" content="#E8E4DA" />
        <link rel="icon" href={`${process.env.NEXT_PUBLIC_BASE_PATH}/favicon.ico`} />
      </Head>

      <Header />

      <main>
        {/* ——— Hero: two equal squares ——— */}
        <section id="top" className="grid gap-4 px-4 pb-10 pt-6 tablet:px-10 laptop:grid-cols-4 laptop:pb-16 laptop:pt-10">
          <div className="flex flex-col justify-between gap-12 laptop:col-span-2 laptop:aspect-square laptop:pr-10">
            <div className="flex flex-col gap-8">
              <h1 className="fu-display fu-hero-fade text-[56px] tablet:text-phi3">{portfolioData.name}</h1>
              <ul className="fu-hero-fade grid max-w-[420px] grid-cols-2 gap-x-4 gap-y-1 text-[15px]" aria-label="Roles">
                {roles.map((role) => (
                  <li key={role}>{role}</li>
                ))}
              </ul>
            </div>

            <div className="fu-hero-fade flex flex-col gap-6">
              <p className="max-w-[480px] text-xl leading-snug tablet:text-phi1 tablet:leading-[1.15]">
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

          <div className="aspect-square laptop:col-span-2">
            <PracticeMap projects={projects} />
          </div>
        </section>

        {/* ——— Works ——— */}
        <section id="work" className="scroll-mt-14 border-t border-ink px-4 pb-20 pt-4 tablet:px-10 laptop:pb-[110px]">
          <div className="grid gap-x-4 gap-y-6 laptop:grid-cols-4">
            <h2 className="fu-display fu-reveal text-[48px] tablet:text-phi3">Works</h2>
            <nav className="flex flex-wrap content-start gap-x-6 gap-y-2 pt-2 laptop:col-span-3 laptop:pt-5" aria-label="Jump to a group of works">
              {index.map((group) => (
                <a key={group.id} href={`#${anchorOf(group.id)}`} className="text-[15px] font-medium hover:underline">
                  {group.short} <span className="text-fieldgrey">{pad(group.items.length)}</span>
                </a>
              ))}
            </nav>
          </div>

          {groups.map((group, groupIndex) => (
            <div
              key={group.id}
              id={anchorOf(group.id)}
              className="mt-16 grid scroll-mt-20 gap-x-4 gap-y-8 border-t border-ink pt-4 laptop:grid-cols-4"
            >
              <div className="fu-reveal flex flex-col gap-1">
                <span className="fu-meta text-fieldgrey">{pad(groupIndex + 1)}</span>
                <h3 className="fu-title text-phi1">{group.short}</h3>
                <p className="fu-meta text-graphite">{group.blurb}</p>
              </div>
              <div className="grid gap-x-4 gap-y-12 tablet:grid-cols-2 laptop:col-span-3 laptop:grid-cols-3">
                {group.items.map((project) => (
                  <Link key={project.id} href={`/projects/${project.id}`} className="fu-card fu-reveal block">
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

        <Section id={anchorOf("Work in Progress")} number={pad(groups.length + 1)} title="In progress" note="What I'm working on right now.">
          <ol className="fu-reveal border-t border-ink">
            {wip.map((project) => (
              <IndexRow key={project.id} project={project} number={numberOf(project)} status="In progress" />
            ))}
          </ol>
        </Section>

        <Section id={anchorOf("Past Projects")} number={pad(groups.length + 2)} title="Past projects">
          <ol className="fu-reveal border-t border-ink">
            {archive.map((project) => (
              <IndexRow key={project.id} project={project} number={numberOf(project)} />
            ))}
          </ol>
        </Section>

        <Section id="about" title="About" note={resume.tagline}>
          <div className="fu-reveal flex flex-col gap-10">
            <p className="fu-title max-w-[900px] text-[32px] tablet:text-phi2">
              I work at the intersection of culture, technology and design.
            </p>
            <div className="grid max-w-[900px] gap-6 text-[17px] leading-relaxed tablet:grid-cols-2">
              <p>{portfolioData.aboutpara}</p>
              <p>{aboutDetail}</p>
            </div>
          </div>
        </Section>

        <Section id="record" title="Record" note="Experience and education">
          <ol className="fu-reveal border-t border-ink">
            {record.map((entry) => (
              <li
                key={entry.id}
                className="grid gap-y-1 border-b border-concrete py-5 tablet:grid-cols-[170px_1fr_120px] tablet:gap-x-4"
              >
                <span className="fu-meta pt-1 text-fieldgrey">{entry.dates}</span>
                <span className="flex flex-col gap-1">
                  <span className="text-lg font-semibold">{entry.position}</span>
                  <span className="text-[15px] text-graphite">{entry.bullets}</span>
                </span>
                <span className="fu-meta pt-1 text-graphite tablet:text-right">{entry.type}</span>
              </li>
            ))}
          </ol>
          <Link href="/resume" className="fu-btn fu-btn-primary mt-8">
            Full résumé ↗
          </Link>
        </Section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
