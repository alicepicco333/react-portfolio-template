import React, { useState } from "react";

const WorkCard = ({ img, name, description, category, tags, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative overflow-hidden rounded-lg p-2 laptop:p-2 first:ml-0 link h-150"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ width: '100%', maxWidth: '700px', heigth: '120%' }} // Limit max width to 600px
    >
      <div
        className="relative rounded-s overflow-hidden bg-gray-300 transition-all ease-out duration-300"
        style={{ width: '100%', height: '100%' }}
      >
        <img
          alt={name}
          className="h-full w-full object-cover hover:scale-110 transition-all ease-out duration-300"
          src={img}
          style={{ width: '100%', height: '100%' }}
        />
        {isHovered && (
          <div className="absolute bottom-0 right-0 p-2">
            {tags.map((tag, index) => (
              <p
                key={index}
                className="bg-green-200 text-gray-700 px-2 py-1 rounded mr-2 mb-2 mt-4 inline-block"
              >
                {tag}
              </p>
            ))}
          </div>
        )}
      </div>
      <h1 className="mt-5 text-3xl font-medium">{name ? name : "Project Name"}</h1>
      <h2 className="text-sm text-justify opacity-60">{description ? description : "Description"}</h2>
      {category && <p className="text-sm">{category}</p>}
    </div>
  );
};

export default WorkCard;
