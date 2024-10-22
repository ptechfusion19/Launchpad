"use client";
import ToolTip from "@/components/ToolTip";
import React, { useState, useContext, useEffect } from "react";
import LauchTable from "./LauchTable";
import {
  burnLPCall,
  sellAllAPi,
  postLaunch,
  upsertWallet,
} from "../../hooks/useLaunch"; // Ensure upsertWallet is imported
import toast from "react-hot-toast";
import LaunchPadContext from "../../context/LaunchPadContext";
import { generateWallets } from "./generateWallets";
import { TokenLaunch, removeLPCall } from "../../hooks/useLaunch";
import { encryptPrivateKey, decryptPrivateKey } from "../utils";
import axios from "axios";
import {
  Connection,
  Transaction,
  AccountMeta,
  PublicKey,
  MessageV0,
  TransactionInstruction,
  VersionedTransaction,
} from "@solana/web3.js";

import {MintLayout} from "@solana/spl-token";

import { getPoolKeys } from "../utils";
import Loader from "@/components/Loader";
// import { Connection, Transaction } from "@solana/web3.js";
// import { useWallet } from "@solana/wallet-adapter-react";
const calculatePercentages = (inputNumber) => {
  // //console.log(inputNumber, "I am ");
  // The list of percentages from the "New Distribution"
  const percentages = [
    0.1, 0.2, 0.3, 0.4, 0.55, 0.75, 1.18, 1.61, 2.04, 2.47, 2.9, 3.33, 3.83,
    4.33, 4.83, 5.33, 5.83, 6.43, 7.03, 7.63, 8.23, 9.03, 10.0, 11.67,
  ];

  // Calculate each percentage of the input number and store in an array
  const result = percentages.map((percent) => {
    return (percent / 100) * inputNumber * 10 ** 9;
  });
  // //console.log(result);

  return result;
};

const LaunchFormComp = () => {
  const {
    connected,
    setConnected,
    setAccount,
    setWeb3,
    setSignedMessage,
    setSolanaKey,
    balance,
    setBalance,
    solanaKey,
    setUserId,
    userId,
  } = useContext(LaunchPadContext);
  // const { publicKey, signAllTransactions } = useWallet();

  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    mint: "",
    amountSol: "",
    amountTokens: "",
    amountSolForSnipping: "",
  });
  const setTokens = async (mint) => {
    const connection = new Connection(
      process.env.NEXT_PUBLIC_RPC_URL
    );
    const accountInfo = await connection.getAccountInfo(new PublicKey(mint));
    const amount = MintLayout.decode(accountInfo.data)
    setFormData((prevData) => ({
      ...prevData,
      
      amountTokens: (Number(amount.supply)/(10**amount.decimals)).toFixed(0), // Set amountTokens to 10000
    }));
  };
  const handleChange =  (e) => {
    if (!connected) {
      toast.error("Please connect your wallet first");
      return; // Prevent typing if not connected
    }

    const { name, value } = e.target;
     setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    if (e.target.name == "mint") {
      setTokens(value);
    }
  };

  const [projectId, setProjectId] = useState("");

  if (projectId === "") {
    setProjectId(generateProjectId());
  }

  function generateProjectId() {
    return Math.floor(Math.random() * 1000000).toString();
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Check if any required field is missing
    const { mint, amountSol, amountTokens, amountSolForSnipping } = formData;
    if (!mint || !amountSol || !amountTokens || !amountSolForSnipping) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (parseFloat(amountSolForSnipping) < 0.2) {
      toast.error("Amount for Snipping must greater than 0.2");
      return;
    }
    try {
      const res = await toast.promise(
        postLaunch({
          projectId: projectId,
          settingsData: {
            ...formData,
            amountSol: parseFloat(amountSol),
            amountTokens: parseFloat(amountTokens),
            amountSolForSnipping: parseFloat(formData.amountSolForSnipping),
          },
        }),
        {
          loading: "Saving...",
          success: <b>Upserted Successfully!</b>,
          error: <b>Error in Upserting Settings.</b>,
        }
      );

      localStorage.setItem("projectId", projectId);
      //console.log(res);
      // toast.success("Upserted Successfully");
      // Reset the form to its original state
      // setFormData({
      //   mint: "",
      //   amountSol: "",
      //   amountTokens: "",
      //   amountSolForSnipping: "",
      // });
    } catch (error) {
      toast.error("Failed to Upsert Launch Settings");
    }
  };
  const generateUniqueId = () => {
    // Generate a random number and convert it to a base-36 string, then remove the "0." prefix
    return Math.random().toString(36).substr(2, 9); // Adjust length as needed
  };

  const genWalletsHandler = async () => {
    console.log(projectId);

    try {
      // Generate wallets
      const lamportsArray = calculatePercentages(
        formData.amountSolForSnipping - 0.2
      );
      const response = await generateWallets(
        25,
        formData.mint,
        lamportsArray,
        projectId
      );
      console.log("Generated Wallets:", response);
      console.log(response?.wallets);
      // Transform the data

      const formattedWallets = response?.wallets.map((wallet, index) => ({
        projectId: projectId,
        pubKey: wallet.publicKey || wallet.pubKey,
        privateKey:
          encryptPrivateKey(wallet.secretKey) ||
          encryptPrivateKey(wallet.privateKey),
        solATA: wallet.solATA,
        coinATA: wallet.coinATA,
        // lamports: wallet.lamports || 0, // Default to 0 if lamports is null
        lamports: wallet.lamports,
      }));
      //
      // console.log(formattedWallets, "These are formatted wallets");
      // Call upsertWallet API with the formatted wallets
      const res = await toast.promise(
        upsertWallet(formattedWallets, projectId),
        {
          loading: "Generating Wallets...",
          success: <b>Successfully Generated Wallets</b>,
          error: <b>Failed to generate or upsert wallets.</b>,
        }
      );
      //
      // const res = await upsertWallet(formattedWallets, projectId);
      console.log("Upsert Wallets API Response:", res);

      // setProjectId("");
      // Update tableData with generated wallets
      // debugger
      setTableData(res);
      // Optionally, handle success message
      if (response?.message == "") {
        toast.success(
          "Wallets generated, formatted, and upserted successfully."
        );
      } else {
        toast.success("wallets Already Generated");
      }
    } catch (error) {
      console.error("Error in generating or upserting wallets:", error);
      toast.error("Failed to generate or upsert wallets.");
    }
  };

  const downloadCSV = () => {
    // Check if tableData is not empty
    if (tableData.length === 0) {
      toast.error("No data to download");
      return;
    }
    // Define the CSV headers
    const headers = [
      "#",
      "Address",
      "Private Key",
      "SOL Balance",
      "Token Balance",
    ];

    // Map data to CSV rows
    const rows = tableData.map((item, index) => [
      index + 1,
      item.pubKey,
      decryptPrivateKey(item.privateKey),
      0, // Placeholder for SOL Balance
      0, // Placeholder for Token Balance
    ]);
    // Convert rows to CSV format
    const csvContent = [
      headers.join(","), // Header row
      ...rows.map((row) => row.join(",")), // Data rows
    ].join("\n");
    // Create a blob and download it
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      // feature detection
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "tableData.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  const fetchInitialData = async (userId) => {
    // debugger
    const res = await axios.post("/api/user/getProjectorWallets", {
      userId: userId,
    });
    if (res.data?.launch?.projectId) {
      localStorage.setItem("projectId", res.data?.launch.projectId);
      // setFormData((prevData) => ({
      //   ...prevData,
      //   [name]: value,
      // }));
      // handleChange("mint", res?.data?.launch?.mint)
      // handleChange("amountTokens", res?.data?.launch?.amountTokens)
      // handleChange("amountSol", res?.data?.launch?.amountSol)
      // handleChange("amountSolForSnipping", res?.data?.launch?.amountSolForSnipping)
      setFormData((prev) => ({
        ...prev,
        mint: res?.data?.launch?.mint,
        amountTokens: res?.data?.launch?.amountTokens,
        amountSol: res?.data?.launch?.amountSol,
        amountSolForSnipping: res?.data?.launch?.amountSolForSnipping,
      }));
      //console.log(res?.data?.wallet);
      setTableData(res?.data?.wallet);
      setProjectId(res?.data?.launch.projectId);
    }
  };

  const decodeBase64 = (base64) => {
    return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  };

  const convertArrayToTransaction = (array) => {
    const transactions = array.map((transaction) => {
      const signatures = transaction.signatures[0];
      const {
        header,
        staticAccountKeys,
        recentBlockhash,
        compiledInstructions,
        addressTableLookups,
      } = transaction.message;

      return {
        signatures,
        message: {
          header,
          staticAccountKeys,
          recentBlockhash,
          compiledInstructions,
          addressTableLookups,
        },
      };
    });

    return transactions;
  };
  const formatTransactionsForSigning = (transactions) => {
    return transactions.map((transaction) => {
      const { signatures, message } = transaction;

      return {
        message,
        signatures: [signatures],
      };
    });
  };
  const launch = async () => {
    const res = await TokenLaunch();
    try {
      const vTxn = res.allTxs.map((item) => {
        const itemArray = Object.values(item);
        const tx = VersionedTransaction.deserialize(itemArray);

        return tx;
      });
      //console.log(vTxn, "These are Version TXNs");

      let signedTransactions = await window.solana.signAllTransactions(vTxn);
      // console.log(signedTransactions,"____ before serializeing");
      signedTransactions = signedTransactions.map((item) => {
        return item.serialize();
      });
      console.log(signedTransactions);
      const response = await axios.post("/api/signedTransaction", {
        signedTransactions: signedTransactions,
        userId: localStorage.getItem("userId"),
        projectId: localStorage.getItem("projectId"),
      });
      console.log("res", response);
    } catch (error) {
      console.error("Error signing or sending transactions:", error);
      console.error("Error details:", error.stack);
    }
  };
  const LaunchToken = async (e) => {
    e.preventDefault();

    if (!window.solana || !window.solana.isPhantom) {
      console.error("Phantom wallet not connected or unavailable");
      return;
    }
    if (
      balance <
      Number(formData.amountSol) +
        Number(formData.amountSolForSnipping) +
        0.83108017
    ) {
      // if (balance < 0) {
      // debugger
      toast.error(
        "U dont have sufficient Balance to Launch Token ! Please recharge your wallet"
      );
    } else {
      try {
        const res = await toast.promise(
          launch(),

          {
            loading: "Launching...",
            success: <b>Token Launched Successfully!</b>,
            error: <b>Could not Launch Token .. Try Again in a few moments.</b>,
          }
        );
        // const res = await TokenLaunch();
        //console.log(res, "this is res");
        // toast.success(" Token Launched");
        
        const strFeePayer = localStorage.getItem("solanaKey");
        //
        // if (
        //   !strFeePayer ||
        //   !PublicKey.isOnCurve(Buffer.from(strFeePayer, "hex"))
        // ) {
        //
        //   console.error("Invalid fee payer public key");
        //   return;
        // }
        const feePayerPubKey = new PublicKey(strFeePayer);
      } catch (error) {
        toast.error("Error in Launching Token");
      }
    }
  };
  const burnLpProcess = async () => {
    try {
      const res = await burnLPCall();
      if (res) {
        const itemArray = Object.values(res.txn);
        const txn = VersionedTransaction.deserialize(itemArray);

        // Sign and send the transaction using Phantom wallet
        const { signature } = await window.solana.signAndSendTransaction(txn);
        const solscanLink = `https://solscan.io/tx/${signature}`;

        toast.success(
          <div>
            Transaction sent successfully.
            <a href={solscanLink} target="_blank" rel="noopener noreferrer">
              View on Solscan
            </a>
            .
            <span
              style={{ cursor: "pointer" }}
              onClick={() => navigator.clipboard.writeText(signature)}
            >
              Click Here to Copy the transaction Hash
            </span>
          </div>
        );
      } else {
        toast.error("Error in Burning LP");
      }
    } catch (error) {
      toast.error("Error in Burning LP");
    }
  };

  const sellAllProcess = async () => {
    try {
      const res = await sellAllAPi();
      if (res) {
        const itemArray = Object.values(res.txn);
        const txn = VersionedTransaction.deserialize(itemArray);

        // Sign and send the transaction using Phantom wallet
        const { signature } = await window.solana.signAndSendTransaction(txn);
        const solscanLink = `https://solscan.io/tx/${signature}`;

        toast.success(
          <div>
            Transaction sent successfully.
            <a href={solscanLink} target="_blank" rel="noopener noreferrer">
              View on Solscan
            </a>
            .
            <span
              style={{ cursor: "pointer" }}
              onClick={() => navigator.clipboard.writeText(signature)}
            >
              Click Here to Copy the transaction Hash
            </span>
          </div>
        );
      } else {
        toast.error("Error in Selling All Tokens");
      }
    } catch (error) {
      toast.error("Error in Selling All Tokens");
    }
  };

  const sellAllHandler = async (e) => {
    e.preventDefault();
    const res = await toast.promise(sellAllProcess(), {
      loading: "Selling all sniped coins...",
      success: <b>Coins Sold successfully.</b>,
      error: <b>Failed to Sell Coin , Try Again..</b>,
    });
  };

  const burnLP = async (e) => {
    e.preventDefault();
    const res = await toast.promise(burnLpProcess(), {
      loading: "Burning LP...",
      success: <b>LP Burned successfully.</b>,
      error: <b>Failed to Burn LP , Try Again..</b>,
    });
  };

  const removeLpProcess = async () => {
    try {
      const res = await removeLPCall();
      if (res) {
        const itemArray = Object.values(res.txn);
        const txn = VersionedTransaction.deserialize(itemArray);

        // Sign and send the transaction using Phantom wallet
        const { signature } = await window.solana.signAndSendTransaction(txn);
        const solscanLink = `https://solscan.io/tx/${signature}`;

        toast.success(
          <div>
            Transaction sent successfully.
            <a href={solscanLink} target="_blank" rel="noopener noreferrer">
              View on Solscan
            </a>
            .
            <span
              style={{ cursor: "pointer" }}
              onClick={() => navigator.clipboard.writeText(signature)}
            >
              Click Here to Copy the transaction Hash
            </span>
          </div>
        );
      } else {
        toast.error("Error in Removing LP");
      }
    } catch (error) {
      toast.error("Error in Removing LP");
    }
  };

  const removeLP = async (e) => {
    e.preventDefault();

    try {
      // Call the removeLP function that interacts with the backend or Solana API
      const res = await toast.promise(removeLpProcess(), {
        loading: "Removing LP...",
        success: <b>LP Removed successfully.</b>,
        error: <b>Failed to Remove LP , Try Again..</b>,
      });

      // const res = await removeLPCall();

      // if (!res || !res.txn) {
      //   console.error("Invalid response or missing transaction data");
      //   // Display error message to the user on the frontend
      //   document.getElementById("statusMessage").innerText = "Failed to get transaction data.";
      //   return;
      // }

      // Deserialize the transaction data received

      // Display success message with a Solscan link
      // document.getElementById("statusMessage").innerHTML = `Transaction sent successfully.
      //   <a href="${solscanLink}" target="_blank">View on Solscan</a>`;

      console.log("Transaction sent successfully. Signature:", signature);
    } catch (error) {
      // Catch and log any errors during the process
      // console.error("Error during the removeLP transaction process:", error);
      // toast.error("An error occurred while processing the transaction.")
      // Display error message to the user on the frontend
      // document.getElementById("statusMessage").innerText = "An error occurred while processing the transaction.";
    }
  };
  const sellAll = async (e) => {
    e.preventDefault();
    await sellAllProcess();

    // toast.error("Failed to Sell All . try in a little while...")
  };
  const [solPrice, setSolPrice] = useState(0);
  const fetchSolPrice = () => {
    fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd"
    )
      .then((res) => res.json())
      .then((data) => setSolPrice(data?.solana?.usd))
      .catch((error) => console.error("Failed to fetch SOL price", error));
  };
  useEffect(() => {
    fetchSolPrice();
  }, []);

  useEffect(() => {
    // debugger
    if (userId && connected) {
      fetchInitialData(userId);
    }
  }, [connected, userId]);

  return (
    <div>
      {loading ? (
        <Loader />
      ) : (
        <div>
          {/* <div id="statusMessage"></div> */}
          <form className="w-full max-w-2xl my-3">
            <div className="flex flex-wrap -mx-3 mb-3">
              <div className="w-full px-3 mb-6 md:mb-0">
                <div className="flex justify-between items-center">
                  <label
                    className="block uppercase tracking-wide text-black text-xs font-bold mb-2"
                    htmlFor="mint"
                  >
                    Token Address
                  </label>
                  <ToolTip tooltipContent={"Token Description"} />
                </div>
                <input
                  className="appearance-none block w-full bg-[#4b4b4b]   text-white border-2 py-1 px-4 mb-3 border-custom_bg"
                  id="mint"
                  name="mint"
                  type="text"
                  placeholder="Mint Address"
                  value={formData.mint}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="flex flex-wrap -mx-3 mb-3">
              <div className="w-full md:w-1/3 px-3 mb-6 md:mb-0">
                <div className="flex justify-between items-center">
                  <label
                    className="block uppercase tracking-wide text-black text-xs font-bold mb-2"
                    htmlFor="amountTokens"
                  >
                    Token Initial Liquidity
                  </label>
                  <ToolTip tooltipContent={"Token Description"} />
                </div>
                <input
                  className="appearance-none block w-full bg-[#4b4b4b]   text-white border-2 py-1 px-4 mb-3 border-custom_bg"
                  id="amountTokens"
                  name="amountTokens"
                  type="text"
                  disabled
                  value={formData.amountTokens}
                  onChange={handleChange}
                  placeholder="1000000000"
                />
              </div>
              <div className="w-full md:w-1/3 px-3">
                <div className="flex justify-between items-center">
                  <label
                    className="block uppercase tracking-wide text-black text-xs font-bold mb-2"
                    htmlFor="amountSol"
                  >
                    SOL Initial Liquidity
                  </label>
                  <ToolTip tooltipContent={"Token Description"} />
                </div>
                <input
                  className="appearance-none block w-full bg-[#4b4b4b]   text-white border-2 py-1 px-4 mb-3 border-custom_bg"
                  id="amountSol"
                  name="amountSol"
                  value={formData.amountSol}
                  onChange={handleChange}
                  type="text"
                  placeholder="10"
                />
              </div>
              <div className="w-full md:w-1/3 px-3">
                <div className="flex justify-between items-center">
                  <label
                    className="block uppercase tracking-wide text-black text-xs font-bold mb-2"
                    htmlFor="amountSolForSnipping"
                  >
                    Snipe SOL Amount
                  </label>
                  <ToolTip tooltipContent={"Token Description"} />
                </div>
                <input
                  className="appearance-none block w-full bg-[#4b4b4b]   text-white border-2 py-1 px-4 mb-3 border-custom_bg"
                  id="amountSolForSnipping"
                  name="amountSolForSnipping"
                  value={formData.amountSolForSnipping}
                  onChange={handleChange}
                  type="text"
                  placeholder="5"
                />
              </div>
            </div>
            {formData.mint && formData.amountSol && formData.amountTokens && (
              <>
                {" "}
                <div className="flex justify-between mb-2">
                  <h4>Launch MCAP</h4>
                  <h4>${(formData.amountSol * solPrice).toFixed(4)}</h4>
                </div>
                <div className="flex justify-between mb-2">
                  <h4>Launch Price</h4>
                  <h4>
                    ${(formData.amountSol * solPrice) / formData.amountTokens} /{" "}
                    {(formData.amountSol / formData.amountTokens).toFixed(9)}{" "}
                    SOL
                  </h4>
                </div>
                <div className="flex justify-between mb-2">
                  <h4>MCAP after Snipe</h4>
                  <h4>
                    $
                    {(
                      formData.amountSol * solPrice +
                      formData.amountSolForSnipping * solPrice
                    ).toFixed()}
                  </h4>
                </div>
                <div className="flex justify-between mb-2">
                  <h4>Price after Snipe</h4>
                  <h4>
                    $
                    {(formData.amountSol * solPrice +
                      formData.amountSolForSnipping * solPrice) /
                      formData.amountTokens}{" "}
                    /{" "}
                    {(
                      (Number(formData.amountSol) +
                        Number(formData.amountSolForSnipping)) /
                      Number(formData.amountTokens)
                    ).toFixed(9)}{" "}
                    SOL
                  </h4>
                </div>
              </>
            )}

            <button
              onClick={handleSubmit}
              type="submit"
              className="bg-gradient-to-r from-[#565656] to-[#000000] text-white py-2 px-2 rounded-3xl w-full text-sm"
              disabled={!connected} // Disable button if not connected
            >
              Save Settings
            </button>
            <div className="w-full flex flex-wrap justify-between py-4">
              <div className="w-full md:w-3/12">
                <button
                  type="button"
                  className={`bg-gradient-to-r from-[#565656] to-[#000000] text-white py-2 px-2 rounded-3xl w-full text-sm ${
                    !connected && projectId
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  disabled={!connected && projectId}
                  onClick={genWalletsHandler}
                >
                  1 Generate Wallets
                </button>
              </div>
              <div className="w-full md:w-4/12">
                <button
                  type="button" // Changed to type="button" to avoid form submission
                  className={`bg-gradient-to-r from-[#565656] to-[#000000] text-white py-2 px-2 rounded-3xl w-full text-sm ${
                    !connected && projectId
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  disabled={!connected && projectId} // Disable button if not connected
                  onClick={downloadCSV} // Added onClick handler
                >
                  2 Download private keys
                </button>
              </div>
              <div className="w-full md:w-4/12">
                <button
                  onClick={LaunchToken}
                  type="submit"
                  className={`bg-gradient-to-r from-[#565656] to-[#000000] text-white py-2 px-2 rounded-3xl w-full text-sm ${
                    !connected && projectId
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  disabled={!connected && projectId} // Disable button if not connected
                >
                  3 Launch Token
                </button>
              </div>
            </div>
            <LauchTable tableData={tableData} />
            <div className="w-full flex flex-wrap justify-between py-4">
              <div className="w-full md:w-3/12">
                <button
                  type="button" // Changed to type="button" to avoid form submission
                  className={`bg-gradient-to-r from-[#565656] to-[#000000] text-white py-2 px-2 rounded-3xl w-full text-sm ${
                    !connected && projectId
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  disabled={!connected && projectId} // Disable button if not connected
                  onClick={burnLP}
                >
                  Burn LP
                </button>
              </div>

              <div className="w-full md:w-8/12">
                <button
                  type="button" // Changed to type="button" to avoid form submission
                  className={`bg-gradient-to-r from-[#565656] to-[#000000] text-white py-2 px-2 rounded-3xl w-full text-sm ${
                    !connected && projectId
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  disabled={!connected && projectId} // Disable button if not connected
                  onClick={removeLP}
                >
                  Remove Liquidity
                </button>
              </div>

              <div className="w-full mt-4">
                <button
                  type="button" // Changed to type="button" to avoid form submission
                  className={`bg-gradient-to-r from-[#565656] to-[#000000] text-white py-2 px-2 rounded-3xl w-full text-sm ${
                    !connected && projectId
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  disabled={!connected && projectId} // Disable button if not connected
                  onClick={sellAll}
                >
                  Sell All
                </button>
              </div>
            </div>
            <p className="pt-4 text-center"></p>
          </form>
        </div>
      )}
    </div>
  );
};
export default LaunchFormComp;
