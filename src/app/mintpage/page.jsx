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
            <h3 className="text-center pb-2  mt-3">
              Welcome to the $Ptech Vanity Mint
            </h3>
            <h4 className="py-2">
             
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
          <h4 className="my-2">
            In addition to the network fees, a service fee of 1 SOL will be
            charged from your wallet.
          </h4>

          <FormComp />
        </CardComp>
      </div>
    </>
  );
};

export default MintPage;
