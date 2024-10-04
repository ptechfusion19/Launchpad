"use client";
import React from "react";

const NewCardComp = ({ children }) => {
  return (
    <div className="w-4/6 bg-[#141212] border border-custom_bg rounded-xl shadow sm:p-3 md:p-3 dark:border-gray-700">
      <div className="text-white flex justify-around">
        {children}
      </div>
    </div>
  );
};

export default NewCardComp;
