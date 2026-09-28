import React from "react";
import Head from "next/head";
import Link from "next/link";
import { gsap } from "gsap";
import { motionOn } from "../utils/motion";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SkillMap from "../components/SkillMap";
import WorkExplorer from "../components/WorkExplorer";
import InProgress from "../components/InProgress";
import Journey from "../components/Journey";
import portfolioData from "../data/portfolio.json";
import { useIsomorphicLayoutEffect, byDateDesc } from "../utils";

// Finished work is shown in the work views; work in progress gets its own section.
const FINISHED = ["Design", "Research", "Live Coding"];

const Home = () => {
  const { resume, about } = portfolioData;
  const projects = [...portfolioData.projects].sort(byDateDesc);
  const finished = projects.filter((p) => FINISHED.includes(p.category));
  const wip = projects.filter((p) => p.category === "Work in Progress");

  const record = [
    ...resume.experiences,
    ...resume.educationList.map((e) => ({ id: e.id, dates: e.dates, position: e.name, bullets: e.detail, type: "Education" })),
  ];

  useIsomorphicLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      if (!motionOn()) return;
      gsap.utils.toArray(".fu-reveal").forEach((el) => {
        gsap.from(el, { opacity: 0, y: 24, duration: 0.7, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } });
      });
      gsap.utils.toArray(".record-row").forEach((el, i) => {
        gsap.from(el, { opacity: 0, x: -16, duration: 0.5, delay: (i % 4) * 0.05, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 92%", once: true } });
      });
    });
    // the map, the work views and images change the page height after load: keep triggers in step
    let timer;
    const observer = new ResizeObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(() => ScrollTrigger.refresh(), 150);
    });
    observer.observe(document.body);
    return () => {
      observer.disconnect();
      clearTimeout(timer);
      mm.revert();
    };
  }, []);

  return (
    <div id="top" className="min-h-screen bg-bone text-ink">
      <Head>
        <title>Alice Picco — HCI researcher &amp; designer</title>
        <meta name="description" content={about.lead} />
        <meta name="theme-color" content="#D5D6DB" />
      </Head>

      <Header />

      <main id="main-content" tabIndex={-1}>
        <h1 className="sr-only">Alice Picco — HCI researcher and designer</h1>
        <SkillMap projects={finished} />
        <WorkExplorer projects={finished} />
        <InProgress projects={wip} />
        <Journey projects={projects.filter((p) => FINISHED.includes(p.category) || p.category === "Work in Progress")} />

        <section id="about" aria-labelledby="about-title" className="scroll-mt-16 bg-olive px-4 pb-20 pt-8 text-white tablet:px-8">
          <div className="grid gap-x-8 gap-y-10 laptop:grid-cols-4">
            <h2 id="about-title" className="fu-reveal text-[28px] font-semibold tracking-[-0.02em]">About</h2>
            <div className="flex flex-col gap-10 laptop:col-span-3">
              <p className="fu-reveal max-w-[980px] text-[28px] font-medium leading-[1.2] tracking-[-0.01em] tablet:text-[40px]">{about.lead}</p>
              <div className="fu-reveal grid max-w-[980px] gap-6 text-[17px] leading-relaxed tablet:grid-cols-2">
                {about.paragraphs.map((text) => (
                  <p key={text.slice(0, 20)}>{text}</p>
                ))}
              </div>
              <div className="fu-reveal grid max-w-[980px] gap-6 tablet:grid-cols-3" role="group" aria-label="How I work">
                {about.practice.map((p) => (
                  <div key={p.title} className="flex flex-col gap-2 border-t-2 border-white pt-3">
                    <span className="font-mono text-[14px] uppercase tracking-[0.12em]">{p.title}</span>
                    <span className="text-[17px] leading-snug">{p.items}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="record" aria-labelledby="record-title" className="scroll-mt-16 px-4 pb-20 pt-8 tablet:px-8">
          <div className="grid gap-x-8 gap-y-8 laptop:grid-cols-4">
            <div className="fu-reveal flex flex-col gap-2">
              <h2 id="record-title" className="text-[28px] font-semibold tracking-[-0.02em]">Record</h2>
              <p className="font-mono text-[13px] text-graphite">Experience and education</p>
            </div>
            <div className="laptop:col-span-3">
              <ol className="border-t border-ink">
                {record.map((entry) => (
                  <li key={entry.id} className="record-row grid gap-y-1 border-b border-ink/25 py-4 tablet:grid-cols-[190px_1fr_150px] tablet:gap-x-4">
                    <span className="pt-0.5 font-mono text-[13px] text-graphite">{entry.dates}</span>
                    <span className="flex flex-col gap-1">
                      <span className="text-[17px] font-semibold leading-snug">{entry.position}</span>
                      <span className="text-[15px] text-ink/80">{entry.bullets}</span>
                    </span>
                    <span className="pt-0.5 font-mono text-[13px] text-graphite tablet:text-right">{entry.type}</span>
                  </li>
                ))}
              </ol>
              <Link href="/resume" className="mt-8 inline-flex min-h-[44px] items-center bg-ink px-5 text-[14px] font-semibold text-bone transition-colors hover:bg-olive">
                Full CV →
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
