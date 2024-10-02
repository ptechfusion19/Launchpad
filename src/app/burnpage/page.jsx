"use client";

import React from "react";
import CardComp from "@/components/CardComp";
import Header from "@/components/Header";
import { Toaster, toast } from "react-hot-toast";
import BurnFormComp from "./BurnForm";
// import LaunchFormComp from './LaunchForm'

const LaunchPage = () => {
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <Header />
      <div className="py-20 h-fit flex items-center">
        <CardComp>
          <div className="px-2">
            <h3 className="text-center pb-2 mb-4 text-2xl">
              {/* Welcome to the FusionX Launchpad */}
              Burn Liquidity
            </h3>
            {/* <h4 className="py-2">The FusionX Smart Launch Allows You To:</h4>
            <div className="flex items-center mb-2">
              <span className="bg-transparent border-custom_bg border-2 text-white font-bold px-2 h-6 flex items-baseline justify-center rounded leading-none">
                -
              </span>

              <p className="pl-4 text-lg font-medium">
                Launch your token's liquidity pool on Raydium.
              </p>
            </div>
            <div className="flex items-center mb-2">
              <span className="bg-transparent border-custom_bg border-2 text-white font-bold px-2 h-6 flex items-baseline justify-center rounded leading-none">
                -
              </span>

              <p className="pl-4 text-lg font-medium">
                Snipe your token first before anyone else can get a bite from 24
                unique wallets.
              </p>
            </div>
            <div className="flex items-center mb-2">
              <span className="bg-transparent border-custom_bg border-2 text-white font-bold px-2 h-6 flex items-baseline justify-center rounded leading-none">
                -
              </span>

              <p className="pl-4 text-lg font-medium">
                Distribute the sniped tokens across up to 72 wallets.
              </p>
            </div>

            <h4 className="py-7 text-lg font-medium">
              In addition to the network fees, a service fee of 3 SOL will be
              charged from your wallet.
            </h4> */}
          </div>

          
          <BurnFormComp/>
        </CardComp>
      </div>
    </>
  );
};

export default LaunchPage;
