import React, { useState } from "react";

// Research / Design / Development and the skills around them (from the old HeroGraph).
const NODES = [
  {
    id: "research",
    label: "Research",
    x: 190,
    y: 250,
    tone: "#CFC6E8",
    subnodes: [
      { label: "User research", x: 90, y: 160, lx: 40, ly: 146 },
      { label: "Cultural analytics", x: 70, y: 320, lx: 20, ly: 344 },
      { label: "HCI · Digital humanities", x: 200, y: 110, lx: 150, ly: 96 },
      { label: "Systems thinking", x: 60, y: 230, lx: 14, ly: 216 },
    ],
  },
  {
    id: "design",
    label: "Design",
    x: 370,
    y: 275,
    tone: "#F2C4CE",
    subnodes: [
      { label: "UX design", x: 470, y: 170, lx: 424, ly: 156 },
      { label: "Interaction", x: 490, y: 345, lx: 430, ly: 372 },
      { label: "Visual · 3D", x: 360, y: 130, lx: 314, ly: 116 },
    ],
  },
  {
    id: "dev",
    label: "Dev",
    x: 275,
    y: 455,
    tone: "#C8D8BF",
    subnodes: [
      { label: "Creative coding", x: 140, y: 560, lx: 64, ly: 588 },
      { label: "Data visualization", x: 330, y: 600, lx: 262, ly: 628 },
      { label: "Front-end", x: 460, y: 510, lx: 410, ly: 538 },
    ],
  },
];

const PracticeMap = ({ stats = [] }) => {
  const [active, setActive] = useState(null);
  const activeNode = NODES.find((n) => n.id === active);
  const dim = (id) => (active && active !== id ? 0.22 : 1);

  return (
    <div className="relative flex h-full flex-col bg-olive text-bone">
      <div className="fu-meta flex justify-between border-b border-[#6E7556] px-5 py-4 text-[11px]">
        <span>Fig. 01 — Practice map</span>
        <span>Hover a node ↘</span>
      </div>

      <div className="fu-grid-bg relative flex-grow overflow-hidden">
        <div className="fu-scan pointer-events-none absolute inset-x-0 top-0 h-[90px]" />
        <svg
          viewBox="0 0 550 690"
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="xMidYMid meet"
          role="group"
          aria-label="Practice map: research, design and development, with the skills connected to each"
        >
          <g stroke="#E8E4DA" strokeOpacity="0.5" fill="none">
            <line x1="0" y1="345" x2="550" y2="345" strokeDasharray="3 6" />
            <line x1="275" y1="0" x2="275" y2="690" strokeDasharray="3 6" />
            <circle cx="275" cy="345" r="220" strokeOpacity="0.25" />
          </g>
          <g className="fu-spin">
            <circle cx="275" cy="345" r="150" fill="none" stroke="#E8E4DA" strokeOpacity="0.35" strokeDasharray="1 9" strokeWidth="3" />
          </g>

          <g stroke="#E8E4DA" strokeWidth="1.2">
            <line x1="190" y1="250" x2="370" y2="275" />
            <line x1="370" y1="275" x2="275" y2="455" />
            <line x1="275" y1="455" x2="190" y2="250" />
          </g>

          {NODES.map((node, index) => (
            <g
              key={node.id}
              style={{ opacity: dim(node.id), transition: "opacity .35s" }}
              className={index === 2 ? "fu-drift [animation-duration:8s] [animation-delay:-3s]" : "fu-drift"}
            >
              {node.subnodes.map((sub) => (
                <g key={sub.label}>
                  <line x1={node.x} y1={node.y} x2={sub.x} y2={sub.y} stroke="#E8E4DA" strokeWidth="1.2" />
                  <rect x={sub.x - 4} y={sub.y - 4} width="8" height="8" fill={node.tone} />
                  <text x={sub.lx} y={sub.ly} fontFamily="JetBrains Mono, monospace" fontSize="10" fill="#E8E4DA">
                    {sub.label.toUpperCase()}
                  </text>
                </g>
              ))}
            </g>
          ))}

          {NODES.map((node, index) => (
            <g
              key={`${node.id}-core`}
              tabIndex={0}
              role="button"
              aria-label={`${node.label}: ${node.subnodes.map((s) => s.label).join(", ")}`}
              aria-pressed={active === node.id}
              onMouseEnter={() => setActive(node.id)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(node.id)}
              onBlur={() => setActive(null)}
              style={{ cursor: "pointer", outline: "none", opacity: dim(node.id), transition: "opacity .35s" }}
            >
              <circle
                className="fu-pulse"
                style={{ animationDelay: `${index * 0.85}s` }}
                cx={node.x}
                cy={node.y}
                r="40"
                fill="none"
                stroke={node.tone}
                strokeWidth="1.5"
              />
              <circle
                cx={node.x}
                cy={node.y}
                r={active === node.id ? 48 : 40}
                fill={node.tone}
                stroke="#151613"
                style={{ transition: "r .3s" }}
              />
              <text
                x={node.x}
                y={node.y + 5}
                textAnchor="middle"
                fontFamily="Archivo, sans-serif"
                fontSize="14"
                fontWeight="700"
                fill="#151613"
              >
                {node.label.toUpperCase()}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="fu-meta grid min-h-[46px] grid-cols-3 border-t border-[#6E7556] text-[11px]">
        {activeNode ? (
          <span className="col-span-3 flex items-center gap-3 px-5">
            <span className="h-[10px] w-[10px]" style={{ background: activeNode.tone }} />
            {activeNode.label} → {activeNode.subnodes.map((s) => s.label).join(" / ")}
          </span>
        ) : (
          stats.map((stat, i) => (
            <span
              key={stat}
              className={`flex items-center px-5 ${i < stats.length - 1 ? "border-r border-[#6E7556]" : ""}`}
            >
              {stat}
            </span>
          ))
        )}
      </div>
    </div>
  );
};

export default PracticeMap;
