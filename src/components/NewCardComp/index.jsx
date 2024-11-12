"use client";
import React from "react";
import logo from "../../../public/logo.png";
import Image from "next/image";
const NewCardComp = ({ children }) => {
  return (
    <div className="relative text-center w-4/5  p-4 mx-auto bg-[#F7AA00] border border-custom_bg rounded-xl shadow sm:p-6 md:p-8 dark:border-gray-700">
      <div className="absolute top-[25px] right-[20px] animate-bounce-slow hidden lg:block">
        <Image src={logo} alt="Logo" width={80} height={80} />
      </div>

      <div className="flex items-center justify-center flex-col">
        {children}
      </div>
    </div>
  );
};

export default NewCardComp;
