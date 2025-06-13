import React, { useState, useEffect, useRef } from "react";

const getRandomPastelColor = () => {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 85%, 95%)`; // pastel color
};

const WorkCard = ({ img, name, description, tags }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [bgColor, setBgColor] = useState("transparent");
  const animationRef = useRef(null);

  useEffect(() => {
    if (isHovered) {
      setBgColor(getRandomPastelColor());
      animationRef.current = setInterval(() => {
        setBgColor(getRandomPastelColor());
      }, 2000);
    } else {
      clearInterval(animationRef.current);
      setBgColor("transparent");
    }
    return () => clearInterval(animationRef.current);
  }, [isHovered]);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative rounded-lg cursor-pointer overflow-hidden flex flex-col transition-colors duration-1000"
      style={{
        backgroundColor: bgColor,
        minHeight: "380px",
        maxHeight: "380px",
        width: "100%",
      }}
    >
      {/* Image */}
      <div className="w-full h-[220px] overflow-hidden rounded-t-lg flex-shrink-0">
        <img
          src={img}
          alt={name}
          className="w-full h-full object-cover"
          draggable={false}
        />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-grow px-4 py-3 text-center">
        <h2 className="text-lg font-semibold mb-2">{name}</h2>
        <p className="text-sm text-gray-700 mb-3 flex-grow">{description}</p>
        <div className="flex flex-wrap justify-center gap-2">
          {tags?.map((tag, i) => (
            <span
              key={i}
              className="bg-black text-white text-xs px-2 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkCard;