import React, { useRef } from "react";
import Head from "next/head";
import Header from "../components/Header";
import Socials from "../components/Socials";
import Footer from "../components/Footer";
import Cursor from "../components/Cursor";
import portfolioData from "../data/portfolio.json";

const Home = () => {
  const workRef = useRef();

  const handleWorkScroll = () => {
    window.scrollTo({
      top: workRef.current.offsetTop,
      behavior: "smooth",
    });
  };

  // Group projects by category
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

        <Header handleWorkScroll={handleWorkScroll} />

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
            <div key={category}>
              <h2>{category}</h2>
              <div className="mt-5 laptop:mt-10 grid grid-cols-1 tablet:grid-cols-2 gap-4">
                {projects.map((project) => (
                  <div key={project.id} className="overflow-hidden rounded-lg p-2 laptop:p-4 first:ml-0 link" onClick={() => window.open(project.url)}>
                    <div className="relative rounded-md overflow-hidden transition-all ease-out duration-300 h-100 md:h-auto">
                      <img
                        alt={project.title}
                        className="h-full w-full object-cover hover:scale-110 transition-all ease-out duration-300"
                        src={project.imageSrc}
                      />
                    </div>
                    <h1 className="mt-5 text-3xl font-medium">{project.title}</h1>
                    <h2 className="text-md opacity-60">{project.description}</h2>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 laptop:mt-40 p-2 laptop:p-0">
          <h1 className="tablet:m-10 text-2xl text-bold">About</h1>
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
