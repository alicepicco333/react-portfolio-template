import React, { useState } from "react";
import Link from "next/link";
import portfolioData from "../../data/portfolio.json";
import { NODES, clusterOf } from "../Graph/data";
import Sigil from "../Sigil";

// A project's place in the practice: its sigil (one spoke per skill, read clockwise from
// Anthropology) and the skills as a list. Select one to see its tools and the other projects
// that use it, and jump to the home map opened on that skill.
const titleOf = (id) => portfolioData.projects.find((p) => p.id === id);

const ProjectGraph = ({ projectId }) => {
  const [picked, setPicked] = useState(null);
  const used = NODES.filter((n) => n.work.includes(projectId));
  if (!used.length) return null;
  const node = picked ? used.find((n) => n.id === picked) : null;
  const others = node ? node.work.filter((id) => id !== projectId).map(titleOf).filter(Boolean) : [];

  return (
    <figure className="flex max-w-[320px] flex-col gap-4">
      <div className="flex items-center gap-4">
        <Sigil skills={used.map((n) => n.id)} size={96} width={2.5} />
        <figcaption className="font-mono text-[12px] leading-relaxed text-graphite">
          This project&apos;s sigil: one spoke for each of the {used.length} skills it uses.
        </figcaption>
      </div>
      <ul className="flex flex-col border-t border-ink/30" aria-label="Skills in this project">
        {used.map((n) => (
          <li key={n.id}>
            <button
              type="button"
              aria-expanded={picked === n.id}
              onClick={() => setPicked((v) => (v === n.id ? null : n.id))}
              className="flex min-h-[40px] w-full items-center justify-between border-b border-ink/30 text-left text-[15px] hover:text-olive"
            >
              <span className={picked === n.id ? "font-semibold text-olive" : ""}>{n.label}</span>
              <span className="font-mono text-[11px] text-graphite">{clusterOf(n.id).label.toUpperCase()}</span>
            </button>
            {picked === n.id && (
              <div className="flex flex-col gap-1.5 border-b border-ink/30 py-3 text-[13px] leading-snug" aria-live="polite">
                <span className="font-mono text-[12px] text-graphite">{n.tools.join(" · ")}</span>
                {others.length > 0 && (
                  <span>
                    Also in:{" "}
                    {others.map((p, i) => (
                      <React.Fragment key={p.id}>
                        {i > 0 && ", "}
                        <Link href={`/projects/${p.id}`} className="underline decoration-olive underline-offset-2">
                          {p.title.split(" - ")[0]}
                        </Link>
                      </React.Fragment>
                    ))}
                  </span>
                )}
                <Link href={`/?skill=${n.id}#map`} className="w-max font-semibold underline decoration-olive decoration-2 underline-offset-2">
                  Open in the map →
                </Link>
              </div>
            )}
          </li>
        ))}
      </ul>
    </figure>
  );
};

export default ProjectGraph;
