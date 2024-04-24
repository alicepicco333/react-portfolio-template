import React, { useState } from "react";

const WorkCard = ({ img, name, description, category, tags, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative overflow-hidden rounded-lg p-2 laptop:p-4 first:ml-0 link"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ width: '100%', maxWidth: '600px' }} // Limit max width to 600px
    >
      <div
        className="relative rounded-md overflow-hidden transition-all ease-out duration-300"
        style={{ width: '100%', height: '60%' }}
      >
        <img
          alt={name}
          className="h-full w-full object-cover hover:scale-110 transition-all ease-out duration-300"
          src={img}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      {isHovered && (
        <div className="absolute right-0 top-0 p-2">
          {tags.map((tag, index) => (
            <p
              key={index}
              className="bg-gray-200 text-gray-700 px-2 py-1 rounded mr-2 mb-2 inline-block"
            >
              {tag}
            </p>
          ))}
        </div>
      )}
      <h1 className="mt-5 text-3xl font-medium">{name ? name : "Project Name"}</h1>
      <h2 className="text-md opacity-60">{description ? description : "Description"}</h2>
      {category && <p className="text-sm">{category}</p>}
    </div>
  );
};

export default WorkCard;
