"use client";

import React, { useState, useContext } from "react";
import { burnLPCall } from "../../hooks/useLaunch";
import LaunchPadContext from "../../context/LaunchPadContext";
import Loader from "@/components/Loader";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { VersionedTransaction } from "@solana/web3.js";

const BurnFormComp = () => {
  const {
    connected,
  } = useContext(LaunchPadContext);

  const [loading, setLoading] = useState(false);
  const [mint, setMint] = useState("");
  const [pairAddress, setPairAddress] = useState("");

  const handleChange = (e) => {
    if (!connected) {
      toast.error("Please connect your wallet first");
      return;
    }
    const { name, value } = e.target;
    if (name === "mint") {
      setMint(value);
    } else if (name === "pairAddress") {
      setPairAddress(value);
    }
  };

  const burnLpProcess = async () => {
    try {
      const res = await burnLPCall();
      if (res) {
        const itemArray = Object.values(res.txn);
        const txn = VersionedTransaction.deserialize(itemArray);

        const { signature } = await window.solana.signAndSendTransaction(txn);
        const solscanLink = `https://solscan.io/tx/${signature}`;

        toast.success(
          `Transaction sent successfully. 
            <a href="${solscanLink}" target="_blank">View on Solscan</a>.`
        );
      } else {
        toast.error("Error in Burning LP");
      }
    } catch (error) {
      toast.error("Error in Burning LP");
    }
  };

  const burnLP = async (e) => {
    e.preventDefault();
    if (!connected) {
      toast.error("Please connect your wallet first");
      return;
    }

    // Validation: Check if the 'mint' field is empty
    if (!mint.trim()) {
      toast.error("Token Address is required to burn LP");
      return;
    }
    const obj = {
      mint,
      pairAddress,
    }
    console.log(obj)

    // If validation passes, proceed with the burning process
    await toast.promise(
      burnLpProcess(),
      {
        loading: "Burning LP...",
        success: <b>LP Burned successfully.</b>,
        error: <b>Failed to Burn LP, Try Again.</b>,
      }
    );
  };

  return (
    <div>
      <Toaster />
      {loading ? (
        <Loader />
      ) : (
        <div>
          <form className="w-full max-w-2xl my-3">
            <div className="flex flex-wrap -mx-3 mb-3">
              <div className="w-full px-3 mb-6 md:mb-0">
                <label
                  className="block uppercase tracking-wide text-black text-xs font-bold mb-2"
                  htmlFor="mint"
                >
                  Token Address
                </label>
                <input
                  className="appearance-none block w-[450px] bg-[#4b4b4b]   text-white border-2 py-1 px-4 mb-3 border-custom_bg"
                  id="mint"
                  name="mint"
                  type="text"
                  placeholder="Enter Token Address"
                  value={mint}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="flex flex-wrap -mx-3 mb-3">
              <div className="w-full px-3 mb-6 md:mb-0">
                <label
                  className="block uppercase tracking-wide text-black text-xs font-bold mb-2"
                  htmlFor="pairAddress"
                >
                  Pair Address (Optional)
                </label>
                <input
                  className="appearance-none block w-full bg-[#4b4b4b]   text-white border-2 py-1 px-4 mb-3 border-custom_bg"
                  id="pairAddress"
                  name="pairAddress"
                  type="text"
                  placeholder="Enter Pair Address"
                  value={pairAddress}
                  onChange={handleChange}
                />
              </div>
            </div>
            <button
              onClick={burnLP}
              type="submit"
              className="bg-gradient-to-r from-[#29285F] to-[#5319A0] text-white py-2 px-2 rounded-3xl w-full text-sm"
            >
              Burn LP
            </button>
            <p className="pt-4 text-center">
              For questions or support, reach out via t.me/Ptech_Inquiries
            </p>
          </form>
        </div>
      )}
    </div>
  );
};

export default BurnFormComp;
