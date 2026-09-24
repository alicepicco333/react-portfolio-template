import React from "react";
import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";
import data from "../data/portfolio.json";

export async function getStaticProps() {
  if (!data.showResume) return { notFound: true };
  return { props: {} };
}

const Section = ({ label, children }) => (
  <section className="grid gap-x-4 gap-y-6 border-t border-ink pb-16 pt-4 laptop:grid-cols-4">
    <h2 className="fu-title text-phi1">
      {label}
    </h2>
    <div className="laptop:col-span-3">{children}</div>
  </section>
);

const Resume = () => {
  const { resume, name, socials, email } = data;
  const education = [resume.education, resume.education2].filter(Boolean);

  return (
    <div className="min-h-screen bg-bone text-ink">
      <Head>
        <title>{`Record — ${name}`}</title>
        <meta name="description" content={resume.tagline} />
      </Head>

      <Header />

      <main className="px-4 tablet:px-10">
        <div className="grid gap-x-4 gap-y-8 pb-16 pt-6 laptop:grid-cols-4 laptop:pb-[110px] laptop:pt-10">
          <h1 className="fu-display text-[48px] tablet:text-phi3">
            Record
          </h1>
          <div className="flex max-w-[720px] flex-col gap-5 laptop:col-span-3">
            <p className="fu-meta text-fieldgrey">{resume.tagline}</p>
            <p className="text-lg leading-relaxed">{resume.description}</p>
            <div className="flex flex-wrap gap-2">
              <a href={`mailto:${email}`} className="fu-btn fu-btn-primary">
                {email}
              </a>
              {socials.map((social) => (
                <a key={social.id} href={social.link} target="_blank" rel="noreferrer" className="fu-btn fu-btn-secondary">
                  {social.title} ↗
                </a>
              ))}
            </div>
          </div>
        </div>

        <Section label="Experience">
          <ol>
            {resume.experiences.map((exp) => (
              <li key={exp.id} className="grid gap-1 border-b border-concrete py-5 tablet:grid-cols-[200px_1fr_130px] tablet:gap-4">
                <span className="fu-meta text-fieldgrey">{exp.dates}</span>
                <span className="flex flex-col gap-1">
                  <span className="text-lg font-semibold">{exp.position}</span>
                  <span className="text-[15px] text-graphite">{exp.bullets}</span>
                </span>
                <span className="fu-meta text-graphite tablet:text-right">{exp.type}</span>
              </li>
            ))}
          </ol>
        </Section>

        <Section label="Education">
          <ol>
            {education.map((edu) => (
              <li key={edu.universityName} className="grid gap-1 border-b border-concrete py-5 tablet:grid-cols-[200px_1fr] tablet:gap-4">
                <span className="fu-meta text-fieldgrey">{edu.universityDate}</span>
                <span className="flex flex-col gap-1">
                  <span className="text-lg font-semibold">{edu.universityName}</span>
                  <span className="text-[15px] text-graphite">{edu.universityPara}</span>
                </span>
              </li>
            ))}
          </ol>
        </Section>

        {(resume.languages || resume.others) && (
          <Section label="Skills">
            <div className="grid gap-8 tablet:grid-cols-2">
              {[["Languages", resume.languages], ["Others", resume.others]]
                .filter(([, items]) => items && items.length)
                .map(([title, items]) => (
                  <div key={title}>
                    <h3 className="fu-title text-phi1">{title}</h3>
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {items.map((item) => (
                        <li key={item} className="text-[15px]">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
            </div>
          </Section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Resume;
