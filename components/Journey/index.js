import React, { useState } from "react";
import Link from "next/link";
import portfolioData from "../../data/portfolio.json";
import { withBase } from "../../utils";
import { textWidth } from "../../utils/layout";

// Timeline: studies, roles and projects on one axis. Large screens get the drawn
// timeline; smaller ones get the same content as a list by year.
const NOW = 2026.75;
const T0 = 2018.5;
const T1 = 2027.1;
const W = 1200;
const PAD = 16;
const ROW = 34;
const px = (t) => PAD + ((t - T0) / (T1 - T0)) * (W - PAD * 2);

const yearOf = (p) => +(((p.dateLabel || "").match(/\d{4}/) || [(p.date || "").slice(0, 4)])[0]);
// a project sits at its first publication year, at the month of its date when that is the same year
const timeOf = (p) => {
  const y = yearOf(p);
  const [dy, dm] = (p.date || "").split("-").map(Number);
  return y + (dy === y && dm ? (dm - 1) / 12 : 0.5);
};
const shortTitle = (p) => p.short || p.title.split(" - ")[0];

// greedy rows: each item takes the first row where its span (bar or label) fits
function pack(items) {
  const rows = [];
  return items.map((it) => {
    let r = rows.findIndex((end) => end + 10 < it.x0);
    if (r < 0) {
      rows.push(0);
      r = rows.length - 1;
    }
    rows[r] = it.x1;
    return { ...it, row: r };
  });
}

function spans(list, getStart, getEnd, label) {
  return pack(
    list
      .map((e) => {
        const s = getStart(e);
        const end = getEnd(e) ?? NOW;
        const x0 = px(s);
        const x1b = Math.max(px(end), x0 + 8);
        const w = textWidth(label(e), 15) * 1.05 + 14;
        const inside = x1b - x0 >= w;
        const flip = !inside && x1b + w > W - PAD;
        return { e, s, end, x0: flip ? x0 - w : x0, bx: x0, x1b, inside, flip, x1: inside || flip ? x1b : x1b + 8 + w - 14 };
      })
      .sort((a, b) => a.s - b.s)
  );
}

const Journey = ({ projects }) => {
  const [layer, setLayer] = useState("roles"); // "roles" or "studies": one at a time, with the projects
  const { resume, journey } = portfolioData;
  const studies = spans(resume.educationList, (e) => e.start, (e) => e.end, (e) => e.short);
  const roles = spans(resume.experiences, (e) => e.start, (e) => e.end, (e) => e.short);
  const work = pack(
    projects
      .map((p) => {
        const t = timeOf(p);
        const x = px(t);
        const w = 12 + textWidth(shortTitle(p), 15) * 1.05;
        const flip = x + w > W - PAD;
        return { p, t, x, flip, x0: flip ? x - w : x - 6, x1: flip ? x + 6 : x + w };
      })
      .sort((a, b) => a.t - b.t)
  );

  const bars = layer === "studies" ? studies : roles;
  const barRows = Math.max(...bars.map((s) => s.row)) + 1;
  const workRows = Math.max(...work.map((s) => s.row)) + 1;
  const yChapters = 0;
  const yStudies = 88;
  const yRoles = yStudies;
  const yAxis = yStudies + barRows * ROW + 20;
  const yWork = yAxis + 64;
  const H = yWork + workRows * ROW + 10;
  const years = [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];

  const bar = (it, kind) => {
    const e = it.e;
    const y = (kind === "study" ? yStudies : yRoles) + it.row * ROW;
    const w = it.x1b - it.bx;
    const ongoing = e.end == null;
    return (
      <g key={`${kind}${e.id}`}>
        <title>{`${kind === "study" ? e.name : e.position} (${e.dates})`}</title>
        <rect
          x={it.bx}
          y={y}
          width={w}
          height={ROW - 8}
          style={{
            fill: kind === "study" ? "rgb(var(--khaki))" : "rgb(var(--paper))",
            stroke: "rgb(var(--ink))",
          }}
          strokeWidth="1"
          strokeDasharray={ongoing ? "4 3" : undefined}
        />
        <text
          x={it.inside ? it.bx + 8 : it.flip ? it.bx - 8 : it.x1b + 8}
          y={y + 18}
          textAnchor={it.flip ? "end" : "start"}
          fontFamily="Inter Tight, sans-serif"
          fontSize="15"
          fontWeight="600"
          style={{ fill: "rgb(var(--ink))" }}
        >
          {e.short}
        </text>
      </g>
    );
  };

  return (
    <section id="journey" aria-labelledby="journey-title" className="scroll-mt-16 px-4 pb-20 tablet:px-8">
      <div className="flex flex-col gap-5 border-t border-ink pt-5">
        <div className="fu-reveal flex flex-wrap items-end justify-between gap-4">
          <div className="flex max-w-[720px] flex-col gap-2">
            <h2 id="journey-title" className="text-[28px] font-semibold tracking-[-0.02em]">
              Timeline
            </h2>
            <p className="text-[17px] leading-snug">{journey.lead}</p>
          </div>
          <div className="flex" role="group" aria-label="Show on the timeline">
            {[
              ["roles", "Roles"],
              ["studies", "Studies"],
            ].map(([v, t]) => (
              <button
                key={v}
                type="button"
                aria-pressed={layer === v}
                onClick={() => setLayer(v)}
                className={`-mr-px min-h-[44px] border border-ink px-4 font-mono text-[14px] ${layer === v ? "bg-ink text-bone" : "bg-paper text-ink hover:bg-bone"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* ——— large screens: the drawn timeline ——— */}
        <div className="fu-reveal hidden desktop:block">
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="group" aria-label="Timeline of studies, roles and projects, 2018 to today">
            {journey.chapters.map((c, i) => {
              const x0 = px(Math.max(c.from, T0));
              const x1 = px(Math.min(c.to, T1));
              return (
                <g key={c.title} aria-hidden="true">
                  <rect x={x0} y={yChapters} width={x1 - x0} height={H} style={{ fill: i % 2 ? "rgb(var(--ink) / 0.035)" : "transparent" }} />
                  <text x={x0 + 8} y={yChapters + 24} fontFamily="JetBrains Mono, monospace" fontSize="14" letterSpacing="0.1em" style={{ fill: "rgb(var(--olive))" }}>
                    {(c.short || c.title).toUpperCase()}
                  </text>
                  <text x={x0 + 8} y={yChapters + 44} fontFamily="JetBrains Mono, monospace" fontSize="13" style={{ fill: "rgb(var(--graphite))" }}>
                    {`${c.from}–${c.to > 2026 ? "now" : c.to}`}
                  </text>
                </g>
              );
            })}
            <text x={PAD} y={yStudies - 8} fontFamily="JetBrains Mono, monospace" fontSize="13" style={{ fill: "rgb(var(--graphite))" }} aria-hidden="true">
              {layer === "studies" ? "STUDIES" : "ROLES"}
            </text>
            {layer === "studies" ? studies.map((it) => bar(it, "study")) : roles.map((it) => bar(it, "role"))}
            <g aria-hidden="true">
              <line x1={PAD} y1={yAxis} x2={W - PAD} y2={yAxis} style={{ stroke: "rgb(var(--ink))" }} strokeWidth="1.5" />
              {years.map((y) => (
                <g key={y}>
                  <line x1={px(y)} y1={yAxis - 6} x2={px(y)} y2={yAxis + 6} style={{ stroke: "rgb(var(--ink))" }} />
                  <text x={px(y)} y={yAxis + 24} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="14" style={{ fill: "rgb(var(--ink))" }}>
                    {y}
                  </text>
                </g>
              ))}
              {work.map(({ p, x }) => (
                <line key={p.id} x1={x} y1={yAxis - 4} x2={x} y2={yAxis + 4} style={{ stroke: "rgb(var(--olive))" }} strokeWidth="3" />
              ))}
              <line x1={px(NOW)} y1={yChapters + 56} x2={px(NOW)} y2={H} style={{ stroke: "rgb(var(--olive))" }} strokeDasharray="3 4" />
              <text x={px(NOW) + 6} y={yChapters + 70} fontFamily="JetBrains Mono, monospace" fontSize="13" style={{ fill: "rgb(var(--olive))" }}>
                now
              </text>
            </g>
            <text x={PAD} y={yAxis + 52} fontFamily="JetBrains Mono, monospace" fontSize="13" style={{ fill: "rgb(var(--graphite))" }} aria-hidden="true">
              PROJECTS
            </text>
            {work.map(({ p, x, row, flip }) => {
              const y = yWork + row * ROW + 10;
              const wip = p.category === "Work in Progress";
              return (
                <a key={p.id} href={withBase(`/projects/${p.id}/`)} aria-label={`${shortTitle(p)}, ${yearOf(p)}${wip ? ", in progress" : ""}`}>
                  <circle cx={x} cy={y} r="6" style={{ fill: wip ? "rgb(var(--bone))" : "rgb(var(--olive))", stroke: "rgb(var(--olive))" }} strokeWidth="2" strokeDasharray={wip ? "2 2" : undefined} />
                  <text x={flip ? x - 12 : x + 12} y={y + 5} textAnchor={flip ? "end" : "start"} fontFamily="Inter Tight, sans-serif" fontSize="15" fontWeight="600" className="hover:underline" style={{ fill: "rgb(var(--ink))" }}>
                    {shortTitle(p)}
                  </text>
                </a>
              );
            })}
          </svg>
          <ol className="mt-6 grid grid-cols-4 gap-6">
            {journey.chapters.map((c) => (
              <li key={c.title} className="flex flex-col gap-1 border-t-2 border-olive pt-3">
                <span className="font-mono text-[13px] text-graphite">{`${c.from}–${c.to > 2026 ? "now" : c.to}`}</span>
                <span className="text-[18px] font-bold">{c.title}</span>
                <span className="text-[15px] leading-snug">{c.text}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* ——— smaller screens: the same journey as a list ——— */}
        <ol className="flex flex-col desktop:hidden">
          {journey.chapters.map((c) => {
            const inChapter = (t) => t >= c.from && t < c.to;
            const items = [
              ...(layer === "studies" ? resume.educationList.filter((e) => inChapter(e.start)).map((e) => ({ t: e.start, kind: "Study", label: e.name, dates: e.dates })) : []),
              ...(layer === "roles" ? resume.experiences.filter((e) => inChapter(e.start)).map((e) => ({ t: e.start, kind: "Role", label: e.position, dates: e.dates })) : []),
              ...projects.filter((p) => inChapter(timeOf(p))).map((p) => ({ t: timeOf(p), kind: "Project", label: shortTitle(p), dates: String(yearOf(p)), href: `/projects/${p.id}` })),
            ].sort((a, b) => a.t - b.t);
            return (
              <li key={c.title} className="border-l-2 border-olive pb-6 pl-4">
                <p className="font-mono text-[13px] text-graphite">{`${c.from}–${c.to > 2026 ? "now" : c.to}`}</p>
                <h3 className="text-[20px] font-bold">{c.title}</h3>
                <p className="mt-1 text-[16px] leading-snug">{c.text}</p>
                <ul className="mt-3 flex flex-col gap-2">
                  {items.map((it) => (
                    <li key={it.kind + it.label} className="flex gap-3 text-[15px] leading-snug">
                      <span className="w-[64px] shrink-0 font-mono text-[13px] text-graphite">{it.kind}</span>
                      {it.href ? (
                        <Link href={it.href} className="font-semibold underline underline-offset-2">
                          {it.label}
                        </Link>
                      ) : (
                        <span>
                          <span className="font-semibold">{it.label}</span> <span className="font-mono text-[13px] text-graphite">{it.dates}</span>
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
};

export default Journey;
