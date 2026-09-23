import fs from "fs";
import path from "path";
import Head from "next/head";
import Link from "next/link";
import portfolioData from "../../data/portfolio.json";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { categoryMeta } from "../../utils";

// Template filler ("Introductory paragraph for…") is hidden until real copy is written.
const PLACEHOLDER = /^(Introductory paragraph|Middle explanatory section|Closing summary)/;
const realText = (text) => (text && !PLACEHOLDER.test(text) ? text : "");

// Local images are kept only if the file exists in /public; remote URLs pass through.
const imageExists = (src) => {
  if (!src) return false;
  if (/^https?:\/\//.test(src)) return true;
  return fs.existsSync(path.join(process.cwd(), "public", src));
};

export async function getStaticPaths() {
  const paths = portfolioData.projects.map((project) => ({ params: { id: project.id } }));
  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const { projects } = portfolioData;
  const index = projects.findIndex((p) => p.id === params.id);
  const project = projects[index];
  const next = projects[(index + 1) % projects.length];
  const highlight = [project.highlightImage, project.imageSrc].find(imageExists) || "";

  return {
    props: {
      project: {
        ...project,
        gridImages: (project.gridImages || []).filter(imageExists),
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
  const { short, tone } = categoryMeta(project.category);

  return (
    <div className="min-h-screen bg-bone text-ink">
      <Head>
        <title>{`${project.title} — Alice Picco`}</title>
        <meta name="description" content={project.description} />
      </Head>

      <Header />

      <main>
        <section className="relative grid border-b border-ink laptop:grid-cols-golden">
          <div className="flex flex-col gap-10 px-4 py-12 tablet:px-10 laptop:border-r laptop:border-ink laptop:py-[68px] laptop:pl-24">
            <div className="fu-meta flex flex-wrap items-center gap-3">
              <Link href="/#work" className="hover:text-olive">
                ← Works
              </Link>
              <span className="border border-ink px-3 py-1" style={{ background: tone }}>
                {number} · {short}
              </span>
            </div>
            <h1 className="fu-display text-[72px] tablet:text-phi4 laptopl:text-phi5">{project.title}</h1>
            <p className="max-w-[640px] text-xl leading-snug tablet:text-phi1">{project.introText}</p>
          </div>

          <aside className="flex flex-col justify-between gap-8 px-4 py-12 tablet:px-10 laptop:py-[68px]">
            <span className="fu-display self-end text-phi4 text-ink/15 laptop:text-phi5" aria-hidden="true">
              {number}
            </span>
            <dl className="fu-meta grid grid-cols-[110px_1fr] gap-y-3 border-t border-ink pt-4">
              <dt className="text-fieldgrey">Category</dt>
              <dd>{project.category}</dd>
              <dt className="text-fieldgrey">Techniques</dt>
              <dd>{project.tags?.join(" / ")}</dd>
            </dl>
            {project.url && (
              <a href={project.url} target="_blank" rel="noreferrer" className="fu-btn fu-btn-primary self-start">
                Visit project ↗
              </a>
            )}
          </aside>
        </section>

        {project.highlightImage && (
          <figure className="fu-card border-b border-ink">
            <img src={project.highlightImage} alt={project.title} className="max-h-[80vh] w-full object-cover" />
          </figure>
        )}

        {(project.middleText || project.conclusionText) && (
          <section className="grid gap-10 border-b border-ink px-4 py-16 tablet:px-10 laptop:grid-cols-golden-rev laptop:py-[110px]">
            <span className="fu-meta">Notes</span>
            <div className="flex flex-col gap-6 text-lg leading-relaxed">
              {project.middleText && <p>{project.middleText}</p>}
              {project.conclusionText && <p>{project.conclusionText}</p>}
            </div>
          </section>
        )}

        {project.gridImages.length > 0 && (
          <section className="grid grid-cols-2 gap-4 border-b border-ink px-4 py-10 tablet:grid-cols-4 tablet:px-10">
            {project.gridImages.map((src, index) => (
              <div key={src} className="fu-card aspect-square overflow-hidden border border-ink">
                <img src={src} alt={`${project.title} — image ${index + 1}`} className="h-full w-full object-cover" loading="lazy" />
              </div>
            ))}
          </section>
        )}

        <Link
          href={`/projects/${next.id}`}
          className="group flex flex-col gap-3 border-b border-ink px-4 py-12 transition-colors hover:bg-olive hover:text-bone tablet:px-10"
        >
          <span className="fu-meta">Next work →</span>
          <span className="fu-display text-[64px] tablet:text-phi4">{next.title}</span>
        </Link>
      </main>

      <Footer />
    </div>
  );
}
