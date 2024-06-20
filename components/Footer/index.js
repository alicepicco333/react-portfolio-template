import React from "react";
import Socials from "../Socials";
import Link from "next/link";
import Button from "../Button";

const Footer = ({}) => {
  return (
    <>
      <div className="mt-5 laptop:mt-40 p-2 laptop:p-0">
        <div>
          <h1 className="text-2xl text-bold">Contact</h1>
          <div className="mt-10">
          
            <div className="mt-10">
              <Socials />
            </div>
         <div className="mt-20 lg:mt-40"></div>
        
         <p className="text-xs mt-40 lg:mt-80 text-justify">
         -`♡´-✧˖°.☾ ｡◕‿‿◕｡ alicepicco / e.else_if ｡◕‿‿◕｡-`♡´-✧˖°.☾ 2024
         
         </p>
          </div>
        </div>
      </div>
     
    </>
  );
};

export default Footer;
