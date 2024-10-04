"use client";
import React from "react";

const NewCardComp = ({ children }) => {
  return (
    // <div
    //   style={{
    //     width: "80%",
    //     padding: "1rem",
    //     margin: "0 auto",
    //     backgroundColor: "#383962",
    //     border: "1px solid #383962",
    //     borderRadius: "0.75rem",
    //     boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
    //     display: "flex",
    //     justifyContent: "center",
    //     alignItems: "center",
    //     flexDirection : "column"
    //   }}
    // >
    //   {children}
    // </div>
    // <div className="">

    <div className=" text-center w-4/5 p-4 mx-auto bg-[#F7AA00] border border-custom_bg rounded-xl shadow sm:p-6 md:p-8  dark:border-gray-700">
      <div className="flex items-center justify-center flex-col">
        {children}
      </div>
    </div>

    // </div>
  );
};

export default NewCardComp;
