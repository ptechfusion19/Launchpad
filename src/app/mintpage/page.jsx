"use client";

import React from "react";
import CardComp from "../../components/CardComp/index"
import FormComp from "./FormComp";
import dashImg from "../../assets/home/dash-svgrepo-com.svg";
import Header from "@/components/Header";
const MintPage = () => {
  return (
    <>
      <Header />
      <div className="py-20 h-fit flex justify-center items-center">
        <CardComp>
          <div className="px-2">
          <h3 className="text-center pb-2 mb-4 text-2xl">
            Welcome to Bundle Bee Token Launch
            </h3>
            <h4 className="py-2">
            The token launch cost fee is 0.2 SOL, the total cost to launch token will be X SOL. 
            <br/>
            Please note, all tokens are minted with the settings mentioned below.
            </h4>
            <div className="flex items-center mb-2">
              <span className="bg-transparent border-custom_bg border-2 text-white font-bold px-2 h-6 flex items-baseline justify-center rounded leading-none">
                -
              </span>

              <p className="pl-4">1 Billion supply</p>
            </div>
            <div className="flex items-center mb-2">
              <span className="bg-transparent border-custom_bg border-2 text-white font-bold px-2 h-6 flex items-baseline justify-center rounded leading-none">
                -
              </span>

              <p className="pl-4">9 Decimals</p>
            </div>
            <div className="flex items-center mb-2">
              <span className="bg-transparent border-custom_bg border-2 text-white font-bold px-2 h-6 flex items-baseline justify-center rounded leading-none">
                -
              </span>

              <p className="pl-4">Mint authority revoked</p>
            </div>
            <div className="flex items-center mb-2">
              <span className="bg-transparent border-custom_bg border-2 text-white font-bold px-2 h-6 flex items-baseline justify-center rounded leading-none">
                -
              </span>

              <p className="pl-4">Freeze authority revoked</p>
            </div>

            <div className="flex items-center mb-2">
              <span className="bg-transparent border-custom_bg border-2 text-white font-bold px-2 h-6 flex items-baseline justify-center rounded leading-none">
                -
              </span>

              <p className="pl-4">Metadata revoked</p>
            </div>
          </div>

          <h4 className="my-2">
            Once minted, the tokens will be automatically deposited into the
            wallet you are connected with.
          </h4>
          <h4 className="mt-2 mb-5" >
          In addition to the network fees, a service fee of 0.2 SOL will be charged from your wallet as a Platforms commission.
          </h4>

          <FormComp />
        </CardComp>
      </div>
    </>
  );
};

export default MintPage;
