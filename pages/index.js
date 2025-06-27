import React, { useLayoutEffect, useRef, useState } from "react";
import Head from "next/head";
import Header from "../components/Header";
import Socials from "../components/Socials";
import Footer from "../components/Footer";
import Cursor from "../components/Cursor"
import Link from "next/link";
import { useRouter } from "next/router";
import { gsap } from "gsap";
import portfolioData from "../data/portfolio.json";
import WorkCard from "../components/WorkCard";

const scrollWithOffset = (el, offset = -80) => {
  const y = el.getBoundingClientRect().top + window.scrollY + offset;
  window.scrollTo({ top: y, behavior: "smooth" });
};

const Home = () => {
  const workRef = useRef(null);
  const headerRefs = useRef([]);
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("All");

  const handleWorkScroll = () => {
    if (workRef.current) scrollWithOffset(workRef.current);
  };

  const handleAboutScroll = () => {
    const about = document.getElementById("about-section");
    if (about) scrollWithOffset(about);
  };

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(headerRefs.current, {
        opacity: 0,
        y: 40,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out",
      });
    });
    return () => ctx.revert();
  }, [router.asPath]);

  const allCategories = ["All", ...new Set(portfolioData.projects.map((p) => p.category))];
  const filteredProjects =
    selectedCategory === "All"
      ? portfolioData.projects
      : portfolioData.projects.filter((p) => p.category === selectedCategory);

  return (
    <div className={`relative min-h-screen overflow-x-hidden ${portfolioData.showCursor ? "cursor-" : ""}`}>
      <Head>
        <title>Alice Picco</title>
        <meta name="description" content="Portfolio website of Alice Picco" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header handleWorkScroll={handleWorkScroll} handleAboutScroll={handleAboutScroll} />

      <main className="px-6 py-16 mx-auto max-w-7xl">
        <section className="mb-16 text-center">
          {[portfolioData.headerTaglineOne, portfolioData.headerTaglineTwo, portfolioData.headerTaglineThree, portfolioData.headerTaglineFour].map(
            (line, i) => (
              <h1
                key={i}
                ref={(el) => (headerRefs.current[i] = el)}
                className="text-3xl md:text-5xl lg:text-6xl font-bold mb-5"
              >
                {line}
              </h1>
            )
          )}
          <p className="text-md mt-8 text-gray-600 dark:text-gray-300">{portfolioData.email}</p>
          <div className="mt-4">
            <Socials />
          </div>
        </section>

        <section ref={workRef} className="mb-20 mt-10">
          <h2 className="text-2xl font-semibold text-center mb-6">Work</h2>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {allCategories.map((category) => (
              <label
                key={category}
                className={`cursor-pointer px-4 py-2 rounded-full border text-sm transition ${
                  selectedCategory === category
                    ? "bg-gray-200 text-black border-black"
                    : "bg-white text-black border-black"
                }`}
              >
                <input
                  type="radio"
                  name="category"
                  value={category}
                  className="hidden"
                  checked={selectedCategory === category}
                  onChange={() => setSelectedCategory(category)}
                />
                {category}
              </label>
            ))}
          </div>

          {/* Container with margin on sides, no gaps between grid items */}
          <div
            className="flex flex-wrap justify-center mb-4"
            style={{ marginLeft: "10px", marginRight: "10px" }}
          >
            {filteredProjects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="mb-2"
                style={{ margin: "10px 10px 10px 10px", flex: "0 0 300px" }}
              >
                <WorkCard
                  img={project.imageSrc}
                  name={project.title}
                  description={project.description}
                  tags={project.tags}
                />
              </Link>
            ))}
          </div>
        </section>

        <section id="about-section" className="mb-20">
          <h2 className="text-2xl font-semibold text-center">About</h2>
          <p className="mt-4 text-lg text-justify text-gray-700 dark:text-gray-300">{portfolioData.aboutpara}</p>
        </section>

        <p className="text-center text-lg text-gray-600 dark:text-gray-300 mt-10">{portfolioData.email}</p>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
