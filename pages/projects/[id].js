import fs from "fs";
import path from "path";
import Head from "next/head";
import Link from "next/link";
import portfolioData from "../../data/portfolio.json";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import CaseStudy from "../../components/CaseStudy";
import ProjectGraph from "../../components/ProjectGraph";
import { byDateDesc, categoryMeta, withBase, projectStyle } from "../../utils";

// Template filler ("Introductory paragraph for…") is hidden until real copy is written.
const PLACEHOLDER = /^(Introductory paragraph|Middle explanatory section|Closing summary)/;
const realText = (text) => (text && !PLACEHOLDER.test(text) ? text : "");

// Local images are kept only if the file exists in /public; remote URLs pass through.
const imageExists = (src) => {
  if (!src) return false;
  if (/^https?:\/\//.test(src)) return true;
  return fs.existsSync(path.join(process.cwd(), "public", src));
};

// Sections shown on the site; projects in other categories (e.g. "Past Projects") are kept in the data but not published.
const ORDER = ["Design", "Research", "Live Coding", "Work in Progress"];

export async function getStaticPaths() {
  const paths = portfolioData.projects
    .filter((project) => ORDER.includes(project.category))
    .map((project) => ({ params: { id: project.id } }));
  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const projects = ORDER.flatMap((category) => portfolioData.projects.filter((p) => p.category === category).sort(byDateDesc));
  const index = projects.findIndex((p) => p.id === params.id);
  const project = projects[index];
  const next = projects[(index + 1) % projects.length];
  const highlight = [project.highlightImage, project.imageSrc].find(imageExists) || "";

  return {
    props: {
      project: {
        ...project,
        // gallery entries are a path or { src, caption }
        gridImages: (project.gridImages || [])
          .map((item) => (typeof item === "string" ? { src: item, caption: "" } : { caption: "", ...item }))
          .filter((item) => imageExists(item.src)),
        highlightCaption: project.highlightCaption || "",
        highlightImage: highlight,
        introText: realText(project.introText) || project.description,
        middleText: realText(project.middleText),
        conclusionText: realText(project.conclusionText),
      },
      number: String(index + 1).padStart(2, "0"),
      next: { id: next.id, title: next.title },
    },
  };
}

export default function ProjectPage({ project, number, next }) {
  const { short } = categoryMeta(project.category);

  return (
    <div className="min-h-screen bg-bone text-ink" style={projectStyle(project.accent)}>
      <Head>
        <title>{`${project.title} — Alice Picco`}</title>
        <meta name="description" content={project.description} />
      </Head>

      <Header />

      <main>
        <section className="grid gap-x-4 gap-y-8 px-4 pb-16 pt-6 tablet:px-10 laptop:grid-cols-4 laptop:pb-[110px] laptop:pt-10">
          <div className="flex flex-col gap-1">
            <Link href="/#work" className="fu-meta text-fieldgrey hover:text-ink">
              ← Works
            </Link>
            <span className="fu-meta pt-4 text-fieldgrey">{number}</span>
            <span className="fu-title text-xl">{short}</span>
            <div className="mt-8 hidden laptop:block">
              <ProjectGraph projectId={project.id} />
            </div>
          </div>
          <div className={`flex flex-col gap-8 ${project.notes?.length ? "laptop:col-span-2" : "laptop:col-span-3"}`}>
            <h1 className="fu-display max-w-[900px] text-[44px] tablet:text-phi3">{project.title}</h1>
            <p className="max-w-[720px] text-xl leading-snug tablet:text-phi1 tablet:leading-[1.15]">{project.introText}</p>
            {project.summary && (
              <dl className="grid max-w-[900px] gap-x-6 gap-y-4 border-t-4 border-olive pt-4 tablet:grid-cols-2 laptopl:grid-cols-3">
                {[
                  ["Brief", project.summary.brief],
                  ["Role", project.summary.role],
                  ["Method", project.summary.method],
                  ["Outcome", project.summary.outcome],
                  ["Stack", project.summary.stack],
                ].map(([label, value]) => (
                  <div key={label} className="flex flex-col gap-1">
                    <dt className="text-[12px] font-semibold uppercase tracking-[0.12em] text-olive">{label}</dt>
                    <dd className="text-[15px] leading-snug">{value}</dd>
                  </div>
                ))}
              </dl>
            )}
            <dl className="grid max-w-[720px] gap-x-4 gap-y-2 border-t border-ink pt-4 text-[15px] tablet:grid-cols-[140px_1fr]">
              <dt className="text-fieldgrey">Date</dt>
              <dd>{project.dateLabel}</dd>
              {project.context && (
                <>
                  <dt className="text-fieldgrey">Context</dt>
                  <dd>{project.context}</dd>
                </>
              )}
              {Array.isArray(project.collaborators) && (
                <>
                  <dt className="text-fieldgrey">With</dt>
                  <dd>{project.collaborators.length ? project.collaborators.join(", ") : "Solo project"}</dd>
                </>
              )}
              <dt className="text-fieldgrey">Category</dt>
              <dd>{project.category}</dd>
              <dt className="text-fieldgrey">Techniques</dt>
              <dd>{project.tags?.join(", ")}</dd>
            </dl>
            {project.reworkNote && (
              <p className="max-w-[720px] border-l-2 border-olive pl-4 text-[15px] leading-snug text-graphite">{project.reworkNote}</p>
            )}
            {project.url && (
              <a href={project.url} target="_blank" rel="noreferrer" className="fu-btn fu-btn-primary self-start">
                Visit project ↗
              </a>
            )}
          </div>
          {project.notes?.length > 0 && (
            <aside className="flex flex-col gap-4 border-t border-ink pt-4 laptop:border-l laptop:border-t-0 laptop:pl-6 laptop:pt-2" aria-label="Margin notes">
              <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-fieldgrey">Margin notes</p>
              <ol className="flex flex-col gap-4">
                {project.notes.map((note, i) => (
                  <li key={note} className="flex gap-3 text-[14px] leading-snug text-graphite">
                    <span className="font-semibold tabular-nums text-olive">{i + 1}</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ol>
            </aside>
          )}
        </section>

        {project.highlightImage && (
          <figure className="px-4 tablet:px-10">
            <img src={withBase(project.highlightImage)} alt={project.highlightCaption || project.title} className="max-h-[80vh] w-full object-cover" />
            {project.highlightCaption && <figcaption className="fu-meta mt-3 max-w-[720px] text-graphite">{project.highlightCaption}</figcaption>}
          </figure>
        )}

        {project.caseStudy && <CaseStudy data={project.caseStudy} />}

        {!project.caseStudy && (project.middleText || project.conclusionText) && (
          <section className="grid gap-x-4 gap-y-6 px-4 py-16 tablet:px-10 laptop:grid-cols-4 laptop:py-[110px]">
            <h2 className="fu-title text-phi1">Notes</h2>
            <div className="flex max-w-[720px] flex-col gap-6 text-lg leading-relaxed laptop:col-span-3">
              {project.middleText && <p>{project.middleText}</p>}
              {project.conclusionText && <p>{project.conclusionText}</p>}
            </div>
          </section>
        )}

        {!project.caseStudy && project.gridImages.length > 0 && (
          <section className="grid gap-x-4 gap-y-10 px-4 py-10 tablet:grid-cols-2 tablet:px-10">
            {project.gridImages.map(({ src, caption }, index) => (
              <figure key={src} className="flex flex-col gap-3">
                <img
                  src={withBase(src)}
                  alt={caption || `${project.title} — image ${index + 1}`}
                  className="w-full border border-concrete"
                  loading="lazy"
                />
                {caption && (
                  <figcaption className="flex gap-3 text-[15px] leading-snug text-graphite">
                    <span className="fu-meta shrink-0 text-fieldgrey">{String(index + 1).padStart(2, "0")}</span>
                    <span>{caption}</span>
                  </figcaption>
                )}
              </figure>
            ))}
          </section>
        )}

        <Link
          href={`/projects/${next.id}`}
          className="group mt-16 grid gap-x-4 gap-y-2 border-t border-ink px-4 pb-16 pt-4 tablet:px-10 laptop:grid-cols-4"
        >
          <span className="fu-meta text-fieldgrey">Next work →</span>
          <span className="fu-display text-[36px] group-hover:underline tablet:text-phi2 laptop:col-span-3">{next.title}</span>
        </Link>
      </main>

      <Footer />
    </div>
  );
}
