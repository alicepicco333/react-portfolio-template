import React from "react";

const WorkCard = ({ img, name, description, category, onClick }) => {
  return (
    <div className="overflow-hidden rounded-lg p-2 laptop:p-4 first:ml-0 link" onClick={onClick} style={{ width: '540px', height: '900px' }}>
      <div className="relative rounded-md overflow-hidden transition-all ease-out duration-300" style={{ width: '100%', height: '70%' }}>
        <img
          alt={name}
          className="h-full w-full object-cover hover:scale-110 transition-all ease-out duration-300"
          src={img}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      <h1 className="mt-5 text-3xl font-medium">{name ? name : "Project Name"}</h1>
      <h2 className="text-md opacity-60">{description ? description : "Description"}</h2>
      {category && <p className="text-sm">{category}</p>}
    </div>
  );
};

export default WorkCard;
