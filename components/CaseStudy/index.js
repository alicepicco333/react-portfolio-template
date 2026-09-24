import { useState } from "react";
import { usePrefersReducedMotion, withBase } from "../../utils";

// Long-form case study, rendered when a project in portfolio.json has a `caseStudy` block.
// Every block is optional so the data can grow or shrink without touching this file.

function Section({ index, title, children }) {
  return (
    <section className="grid gap-x-4 gap-y-6 border-t border-ink px-4 py-14 tablet:px-10 laptop:grid-cols-4 laptop:py-[88px]">
      <div className="flex flex-col gap-1">
        <span className="fu-meta text-fieldgrey">{index}</span>
        <h2 className="fu-title text-phi1">{title}</h2>
      </div>
      <div className="flex min-w-0 flex-col gap-8 laptop:col-span-3">{children}</div>
    </section>
  );
}

function Lead({ children }) {
  return <p className="max-w-[720px] text-lg leading-relaxed">{children}</p>;
}

function Figure({ src, alt, caption, className = "" }) {
  return (
    <figure className={`flex flex-col gap-2 ${className}`}>
      <a href={withBase(src)} target="_blank" rel="noreferrer" className="block overflow-hidden bg-paper">
        <img src={withBase(src)} alt={alt} loading="lazy" className="h-auto w-full" />
      </a>
      {caption && <figcaption className="fu-meta text-fieldgrey">{caption}</figcaption>}
    </figure>
  );
}

function Scale({ value, label }) {
  return (
    <span className="flex items-center gap-2" aria-label={`${label} ${value} out of 5`}>
      <span className="fu-meta w-[72px] text-fieldgrey">{label}</span>
      <span className="flex gap-[3px]" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} className={`h-3 w-3 ${n <= value ? "bg-ink" : "bg-concrete"}`} />
        ))}
      </span>
    </span>
  );
}

function PhoneVideo({ src, poster, caption }) {
  const reduced = usePrefersReducedMotion();
  return (
    <figure className="flex flex-col items-center gap-3">
      <div className="w-full max-w-[260px] overflow-hidden rounded-[40px] border-[10px] border-ink bg-ink">
        <video
          key={reduced ? "static" : "motion"}
          src={withBase(src)}
          poster={withBase(poster)}
          className="block h-auto w-full rounded-[30px]"
          muted
          loop
          playsInline
          autoPlay={!reduced}
          controls={reduced}
          preload="metadata"
        />
      </div>
      <figcaption className="fu-meta max-w-[260px] text-center text-fieldgrey">{caption}</figcaption>
    </figure>
  );
}

// The Figma embed is heavy, so it only loads after an explicit click.
function PrototypeEmbed({ src, poster }) {
  const [active, setActive] = useState(false);
  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden border border-ink bg-paper tablet:aspect-[16/10]">
      {active ? (
        <iframe title="Unobravo interactive prototype" src={src} className="h-full w-full" allowFullScreen />
      ) : (
        <button type="button" onClick={() => setActive(true)} className="group block h-full w-full">
          {poster && <img src={withBase(poster)} alt="" className="h-full w-full object-cover" loading="lazy" />}
          <span className="fu-btn fu-btn-primary absolute bottom-6 left-6 group-hover:bg-olive">
            Load the interactive prototype ▶
          </span>
        </button>
      )}
    </div>
  );
}

export default function CaseStudy({ data }) {
  const {
    stats = [],
    overview = [],
    context,
    methods = [],
    persona,
    issues = [],
    urgency = [],
    recommendations = [],
    iterations = [],
    beforeAfter = [],
    flows = [],
    motion = [],
    prototype,
    system,
    results,
    reflection = [],
  } = data;
  let n = 0;
  const next = () => String(++n).padStart(2, "0");

  return (
    <div>
      {stats.length > 0 && (
        <section className="grid grid-cols-2 gap-x-4 gap-y-8 px-4 py-14 tablet:px-10 laptop:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col gap-2 border-t border-ink pt-3">
              <span className="fu-display text-[48px] tablet:text-phi3">{s.value}</span>
              <span className="max-w-[240px] text-[15px] leading-snug text-graphite">{s.label}</span>
            </div>
          ))}
        </section>
      )}

      {(overview.length > 0 || context) && (
        <Section index={next()} title="Context">
          {context?.text && <Lead>{context.text}</Lead>}
          {overview.length > 0 && (
            <dl className="grid max-w-[720px] gap-x-4 gap-y-2 border-t border-ink pt-4 text-[15px] tablet:grid-cols-[160px_1fr]">
              {overview.map((row) => (
                <div key={row.label} className="contents">
                  <dt className="text-fieldgrey">{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          )}
          {context?.goals && (
            <div className="grid gap-4 tablet:grid-cols-2">
              {context.goals.map((g) => (
                <div key={g.title} className="bg-paper p-5">
                  <h3 className="fu-title mb-2 text-xl">{g.title}</h3>
                  <p className="text-[15px] leading-relaxed text-graphite">{g.text}</p>
                </div>
              ))}
            </div>
          )}
        </Section>
      )}

      {methods.length > 0 && (
        <Section index={next()} title="Research">
          <div className="grid gap-4 tablet:grid-cols-2">
            {methods.map((m) => (
              <div key={m.title} className="flex flex-col gap-2 border-t border-ink pt-3">
                <span className="fu-meta text-fieldgrey">{m.meta}</span>
                <h3 className="fu-title text-xl">{m.title}</h3>
                <p className="text-[15px] leading-relaxed text-graphite">{m.text}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {persona && (
        <Section index={next()} title="Persona">
          <div className="grid gap-6 bg-paper p-6 tablet:grid-cols-[1fr_1.4fr] tablet:p-8">
            <div className="flex flex-col gap-3">
              <span className="fu-meta text-fieldgrey">{persona.segment}</span>
              <h3 className="fu-display text-[40px]">{persona.name}</h3>
              <p className="text-[15px] text-graphite">{persona.facts}</p>
              <blockquote className="border-l-4 border-ink pl-4 text-xl leading-snug">“{persona.quote}”</blockquote>
            </div>
            <div className="flex flex-col gap-3">
              <p className="text-[15px] leading-relaxed">{persona.story}</p>
              <ul className="flex flex-col gap-2 border-t border-ink pt-3 text-[15px]">
                {persona.needs.map((need) => (
                  <li key={need} className="flex gap-2">
                    <span aria-hidden="true">→</span>
                    <span>{need}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>
      )}

      {issues.length > 0 && (
        <Section index={next()} title="Findings">
          <Lead>
            Assessment, expert review and preliminary testing surfaced nine usability issues, each scored for
            impact and persistence (1–5).
          </Lead>
          <ol className="flex flex-col">
            {issues.map((issue) => (
              <li key={issue.id} className="grid gap-2 border-t border-concrete py-4 tablet:grid-cols-[56px_1fr_auto] tablet:gap-4">
                <span className="fu-meta pt-1 text-fieldgrey">{issue.id}</span>
                <div className="flex flex-col gap-1">
                  <span className="text-lg font-semibold leading-snug">{issue.title}</span>
                  <span className="text-[15px] leading-relaxed text-graphite">{issue.evidence}</span>
                </div>
                <div className="flex flex-col gap-1 pt-1">
                  <Scale value={issue.impact} label="Impact" />
                  <Scale value={issue.persistence} label="Persistence" />
                </div>
              </li>
            ))}
          </ol>
          {urgency.length > 0 && (
            <div className="grid gap-4 tablet:grid-cols-2">
              {urgency.map((u) => (
                <Figure key={u.src} {...u} />
              ))}
            </div>
          )}
        </Section>
      )}

      {recommendations.length > 0 && (
        <Section index={next()} title="Design principles">
          <div className="grid gap-4 tablet:grid-cols-2">
            {recommendations.map((r) => (
              <div key={r.id} className="flex flex-col gap-2 bg-paper p-5">
                <span className="fu-meta text-fieldgrey">
                  {r.id} · addresses {r.addresses}
                </span>
                <h3 className="fu-title text-xl">{r.title}</h3>
                <p className="text-[15px] leading-relaxed text-graphite">{r.text}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {iterations.length > 0 && (
        <Section index={next()} title="Iterations">
          <ol className="grid gap-4 tablet:grid-cols-3">
            {iterations.map((it) => (
              <li key={it.name} className="flex flex-col gap-2 border-t-4 border-ink pt-3">
                <span className="fu-meta text-fieldgrey">{it.date}</span>
                <h3 className="fu-title text-xl">{it.name}</h3>
                <span className="text-[15px] font-medium">{it.evaluation}</span>
                <p className="text-[15px] leading-relaxed text-graphite">{it.text}</p>
              </li>
            ))}
          </ol>
        </Section>
      )}

      {beforeAfter.length > 0 && (
        <Section index={next()} title="Before & after">
          <Lead>Each board traces one screen from the original product through ver0, ver1 and the final version.</Lead>
          <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 tablet:mx-0 tablet:px-0">
            {beforeAfter.map((b) => (
              <Figure key={b.src} {...b} className="w-[82%] shrink-0 snap-start tablet:w-[46%]" />
            ))}
          </div>
        </Section>
      )}

      {flows.length > 0 && (
        <Section index={next()} title="Final design">
          <Lead>83 screens across six flows, built from 29 components and 34 design tokens.</Lead>
          {flows.map((f) => (
            <Figure key={f.src} {...f} />
          ))}
        </Section>
      )}

      {motion.length > 0 && (
        <Section index={next()} title="Motion">
          <Lead>
            Motion is kept calm and purposeful: content rises in on arrival, confirmations settle with a soft pop,
            and the live-session indicator pulses. Transitions in the prototype use push for forward navigation,
            sheets for filters and smart animate for questionnaire progress.
          </Lead>
          <div className="grid gap-8 tablet:grid-cols-3">
            {motion.map((m) => (
              <PhoneVideo key={m.src} {...m} />
            ))}
          </div>
        </Section>
      )}

      {prototype && (
        <Section index={next()} title="Prototype">
          <Lead>{prototype.text}</Lead>
          {prototype.embed && <PrototypeEmbed src={prototype.embed} poster={prototype.poster} />}
          {prototype.url && (
            <a href={prototype.url} target="_blank" rel="noreferrer" className="fu-btn fu-btn-primary self-start">
              Open the prototype in Figma ↗
            </a>
          )}
        </Section>
      )}

      {system && (
        <Section index={next()} title="Design system">
          <Lead>{system.text}</Lead>
          <div className="grid gap-4 tablet:grid-cols-2">
            {system.images.map((img, i) => (
              <Figure key={img.src} {...img} className={i === 0 ? "tablet:col-span-2" : ""} />
            ))}
          </div>
        </Section>
      )}

      {results && (
        <Section index={next()} title="Results">
          <Lead>{results.text}</Lead>
          <div className="flex max-w-[720px] flex-col gap-3">
            {results.sus.map((s) => (
              <div key={s.label} className="grid grid-cols-[140px_1fr_56px] items-center gap-3 text-[15px]">
                <span className="text-fieldgrey">{s.label}</span>
                <span className="h-4 bg-concrete">
                  <span className="block h-full bg-ink" style={{ width: `${s.value}%` }} />
                </span>
                <span className="text-right font-semibold">{s.value}</span>
              </div>
            ))}
            <span className="fu-meta text-fieldgrey">System Usability Scale, 0–100</span>
          </div>
          <div className="max-w-[720px] overflow-x-auto">
            <table className="w-full text-left text-[15px]">
              <thead>
                <tr className="border-b border-ink">
                  <th className="py-2 pr-4 font-medium text-fieldgrey">Task (final version)</th>
                  <th className="py-2 pr-4 font-medium text-fieldgrey">Avg time</th>
                  <th className="py-2 pr-4 font-medium text-fieldgrey">Success</th>
                  <th className="py-2 font-medium text-fieldgrey">Errors</th>
                </tr>
              </thead>
              <tbody>
                {results.tasks.map((t) => (
                  <tr key={t.task} className="border-b border-concrete">
                    <td className="py-2 pr-4">{t.task}</td>
                    <td className="py-2 pr-4">{t.time}</td>
                    <td className="py-2 pr-4">{t.success}</td>
                    <td className="py-2">{t.errors}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {reflection.length > 0 && (
        <Section index={next()} title="Reflection">
          <div className="flex max-w-[720px] flex-col gap-4 text-lg leading-relaxed">
            {reflection.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
