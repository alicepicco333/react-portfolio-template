import React, { useState, useEffect } from "react";

const presetColors = ["#E6EBE0"];

const getRandomPresetColor = () => {
  const index = Math.floor(Math.random() * presetColors.length);
  return presetColors[index];
};

const WorkCard = ({ img, name, description, tags }) => {
  const [bgColor, setBgColor] = useState("transparent");

  useEffect(() => {
    setBgColor(getRandomPresetColor());
  }, []);

  return (
    <div
      className="relative rounded-lg cursor-pointer overflow-hidden flex flex-col transition-transform duration-300 hover:scale-105 bg-white"
      style={{
       border: "1px solid black",
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
        <h2 className="text-lg font-semibold mb-2 text-black">{name}</h2>
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
