import { useRouter } from "next/router";
import portfolioData from "../../data/portfolio.json";
import Header from "../../components/Header"; // adjust if you use Layout instead

export async function getStaticPaths() {
  const paths = portfolioData.projects.map((project) => ({
    params: { id: project.id },
  }));

  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const project = portfolioData.projects.find((p) => p.id === params.id);
  return { props: { project } };
}

export default function ProjectPage({ project }) {
  return (
    <>
      <Header />

      <div className="container mx-auto px-6 py-10">
        <h1 className="text-4xl font-bold mb-4">{project.title}</h1>

        {/* Intro Text */}
        <p className="text-lg mb-10 leading-relaxed">{project.introText}</p>

        {/* 4x4 Grid of Images */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {project.gridImages.map((src, index) => (
            <img
              key={index}
              src={src}
              alt={`Grid Image ${index + 1}`}
              className="w-full h-auto object-cover rounded shadow"
            />
          ))}
        </div>

        {/* Middle Text */}
        <p className="text-lg mb-10 leading-relaxed">{project.middleText}</p>

        {/* Highlight Big Image */}
        <div className="mb-10">
          <img
            src={project.highlightImage}
            alt="Highlight"
            className="w-full h-auto rounded-xl shadow-lg"
          />
        </div>

        {/* Concluding Text */}
        <p className="text-lg leading-relaxed">{project.conclusionText}</p>
      </div>
    </>
  );
}
