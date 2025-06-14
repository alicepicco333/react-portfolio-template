import React, { useRef } from "react";
import Head from "next/head";
import Header from "../components/Header";
import Socials from "../components/Socials";
import Footer from "../components/Footer";
import Cursor from "../components/Cursor";
import WorkCard from "../components/WorkCard";
import Link from "next/link";  // Import Link here
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
          <meta property="og:title" content="Alice Picco - portfolio" />
          <meta
            property="og:description"
            content="This website contains all my latest projects as well as my resume and contact information."
          />
          <meta
            property="og:image"
            content="https://i.ibb.co/phST7kC/Screenshot-2024-04-25-140857.png"
          />
          <meta property="og:url" content="https://alicexpicco.netlify.app" />
          <meta property="og:type" content="website" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <Header
          handleWorkScroll={handleWorkScroll}
          handleAboutScroll={handleAboutScroll}
        />

        <div className="mt-10 ml-10 mr-10 md:mr-0 md:ml-0 laptop:mt-20">
          {[portfolioData.headerTaglineOne, portfolioData.headerTaglineTwo, portfolioData.headerTaglineThree, portfolioData.headerTaglineFour].map((tagline, index) => (
            <h1
              key={index}
              className="text-3xl tablet:text-5xl laptop:text-6xl p-1"
            >
              {tagline}
            </h1>
          ))}
          <p className="text-md mt-4 ml-4">{portfolioData.email}</p>
          <Socials className="mt-2 laptop:mt-5" />
        </div>

        <div className="mt-10 laptop:mt-30 p-2 laptop:p-0" ref={workRef}>
          <h1 className="text-2xl ">Work</h1>
          {Object.entries(projectsByCategory).map(([category, projects]) => (
            <div key={category} className="mt-5">
              <h2 className="text-xl">{category}</h2>
              <div className="mt-5 grid grid-cols-1 laptop:grid-cols-2 gap-4">
                {projects.map((project) => (
                  <Link key={project.id} href={`/projects/${project.id}`}>
                    
                      <WorkCard
                        img={project.imageSrc}
                        name={project.title}
                        description={project.description}
                        tags={project.tags}
                      />
                    
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 laptop:mt-40 p-2 laptop:p-0">
          <h1 id="about-section" className="text-2xl">About</h1>
          <p className="mt-2 text-lg laptop:text-xl text-justify">
            {portfolioData.aboutpara}
          </p>
        </div>

        

        <p className="text-lg mt-4 ml-4">{portfolioData.email}</p>
        <div className="flex justify-center mt-20">
  <iframe
    src="https://practices.tools"
    frameBorder="0"
    width="320"
    height="320"
    className=" rounded-md"
  />
</div>

        <Footer />
      </div>
    </div>
  );
};

export default Home;
