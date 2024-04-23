import React, { useRef } from "react";
import Head from "next/head";
import Header from "../components/Header";
import Socials from "../components/Socials";
import Footer from "../components/Footer";
import Cursor from "../components/Cursor";
import WorkCard from "../components/WorkCard";
import portfolioData from "../data/portfolio.json";

const Home = () => {
  const workRef = useRef();

  const handleWorkScroll = () => {
    window.scrollTo({
      top: workRef.current.offsetTop,
      behavior: "smooth",
    });
  };

  const handleAboutScroll = () => {
    const aboutSection = document.getElementById("about-section");
    if (aboutSection) {
      window.scrollTo({
        top: aboutSection.offsetTop,
        behavior: "smooth",
      });
    }
  };

  const projectsByCategory = portfolioData.projects.reduce((acc, project) => {
    if (!acc[project.category]) {
      acc[project.category] = [];
    }
    acc[project.category].push(project);
    return acc;
  }, {});

  return (
    <div className={`relative ${portfolioData.showCursor && "cursor-none"}`}>
      {portfolioData.showCursor && <Cursor />}

      <div className="container mx-auto mb-10">
        <Head>
          <title>Alice Picco - portfolio</title>
          <meta name="description" content="My portfolio website" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <Header handleWorkScroll={handleWorkScroll} handleAboutScroll={handleAboutScroll} />

        <div className="laptop:mt-20 mt-10">
          {[portfolioData.headerTaglineOne, portfolioData.headerTaglineTwo, portfolioData.headerTaglineThree, portfolioData.headerTaglineFour].map((tagline, index) => (
            <h1
              key={index}
              className="text-3xl tablet:text-6xl laptop:text-6xl laptopl:text-8xl p-1 tablet:p-2 text-bold w-4/5 mob:w-full laptop:w-4/5"
            >
              {tagline}
            </h1>
          ))}
          <Socials className="mt-2 laptop:mt-5" />
        </div>

        <div className="mt-10 laptop:mt-30 p-2 laptop:p-0" ref={workRef}>
          <h1 className="text-2xl text-bold">Work</h1>
          {Object.entries(projectsByCategory).map(([category, projects]) => (
            <div key={category} className="mt-5">
              <h2>{category}</h2>
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {projects.map((project) => (
                  <div key={project.id}>
                    <WorkCard
                      img={project.imageSrc}
                      name={project.title}
                      description={project.description}
                      onClick={() => window.open(project.url)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 laptop:mt-40 p-2 laptop:p-0">
          <h1 id="about-section" className="tablet:m-10 text-2xl text-bold">About</h1>
          <p className="tablet:m-10 mt-2 text-xl laptop:text-3xl w-full laptop:w-3/5">
            {portfolioData.aboutpara}
          </p>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default Home;
