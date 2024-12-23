"use client";
import React, { useState, useContext, useEffect } from "react";
import Image from "next/image";
import uploadImg from "../../../public/Vector.png";
import vanityImg from "../../assets/home/vanity.png";
import forwardImg from "../../assets/home/forward.png";
import { Toaster, toast } from "react-hot-toast";
import {
  imageUpload,
  mintToken,
  meteDataUpload,
  tokenCreate,
  findUser,
} from "@/hooks/useLaunch";
import { getMintsettings } from "@/hooks/useLaunch";
import LaunchPadContext from "../../context/LaunchPadContext";
import { Connection, VersionedTransaction } from "@solana/web3.js";

import ToolTip from "@/components/ToolTip";
const FormComp = () => {
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
  const [formData, setFormData] = useState({
    tokenName: "",
    symbol: "",
    logoUrl: "",
    description: "",
    websiteUrl: "",
    twitterUrl: "",
    telegramUrl: "",
    discordUrl: "",
  });
  const [showModal, setShowModal] = useState(false); // Modal visibility state

  const handlePreview = (e) => {
    e.preventDefault();
    setShowModal(true); // Open modal on preview button click
  };

  const closeModal = (e) => {
    e.preventDefault();
    setShowModal(false); // Close modal
  };

  const [file, setFile] = useState(null);
  const [tokenAddress, setTokenAddress] = useState("");
  const [isFreezeChecked, setIsFreezeChecked] = useState(true);
  const [isMintChecked, setIsmintChecked] = useState(true);

  const [errors, setErrors] = useState({});
  const handleToggle = () => {
    setIsFreezeChecked(!isFreezeChecked);
  };
  const handleMintToggle = () => {
    setIsmintChecked(!isMintChecked);
  };
  const handleChange = (e) => {
    if (!connected) {
      toast.error("Please connect your Wallet first");
    } else {
      const { name, value } = e.target;
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    //
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length === 0) {
      console.log(formData);

      console.log(res);

      // toast.success("Token Created successfully")
    } else {
      setErrors(validationErrors);
    }
  };
  const validateForm = () => {
    const errors = {};
    if (!formData.tokenName.trim()) {
      errors.tokenName = "Token name is required";
    }
    if (!formData.symbol.trim()) {
      errors.symbol = "symbol is required";
    }
    if (!formData.logoUrl.trim()) {
      errors.logoUrl = "logoUrl is required";
    }
    if (!formData.description.trim()) {
      errors.description = "description is required";
    }
    if (!formData.websiteUrl.trim()) {
      errors.websiteUrl = "websiteUrl is required";
    }
    if (!formData.twitterUrl.trim()) {
      errors.twitterUrl = "twitterUrl is required";
    }
    if (!formData.telegramUrl.trim()) {
      errors.telegramUrl = "telegramUrl is required";
    }
    if (!formData.discordUrl.trim()) {
      errors.discordUrl = "discordUrl is required";
    }

    return errors;
  };

  const handleTokenAddress = () => {
    if (!tokenAddress.trim()) {
      toast.error("input field is empty");
    } else {
      toast.success("add token address successfully");
      console.log("Token address:", tokenAddress);
    }
  };

  const handleTokenChange = (e) => {
    setTokenAddress(e.target.value);
    console.log(e.target.value);
  };
  const getMint = async () => {
    const res = await getMintsettings();
    if (res) {
      console.log(res);
      setFormData({
        tokenName: res.tokenName,
        symbol: res.symbol,
        logoUrl: res.logoUrl,
        description: res.description,
        websiteUrl: res.websiteUrl,
        twitterUrl: res.twitterUrl,
        telegramUrl: res.telegramUrl,
        discordUrl: res.discordUrl,
      });
      toast.success("Mint Setting Found Successfully");
    }
  };
  useEffect(() => {
    if (userId) {
      getMint();
    }
  }, [userId]);

  const Uploading = async (event) => {
    event.preventDefault();

    const imageUrl = await toast.promise(fileUpload(event), {
      loading: "Please Wait, Uploading Image ...",
      success: <b>Image Uploaded Successfully</b>,
      error: <b>Failed to upload Image, Try Again Later ...</b>,
    });

    // Set the image URL in formData after successful upload
    if (imageUrl) {
      setFormData((prevData) => ({
        ...prevData,
        logoUrl: imageUrl,
      }));
    }
  };

  const fileUpload = async (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64data = reader.result.split(",")[1];
          try {
            const response = await fetch("/api/imageUpload", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ file: base64data }),
            });

            if (!response.ok) {
              throw new Error("Upload failed");
            }

            const data = await response.json();
            console.log("Uploaded Image URL:", data.imageUrl);
            setFormData({
              logoUrl: data.imageUrl,
              ...formData,
            });

            resolve(data.imageUrl);
          } catch (error) {
            reject(error);
          }
        };

        reader.readAsDataURL(selectedFile);
      });
    }
  };
  const [hash, sethash] = useState("");
  const [data, setMetaData] = useState({});

  const metaDataUpload = async (e) => {
    e.preventDefault();

    // Check for required fields and show error messages if any are missing
    if (!formData.tokenName) {
      toast.error("Token name is required");
      return; // Exit the function early
    }

    if (!formData.symbol) {
      toast.error("Token symbol is required");
      return; // Exit the function early
    }

    if (!formData.logoUrl) {
      toast.error("Token image is required");
      return; // Exit the function early
    }
    const saveData = await mintToken(formData);
    console.log(saveData);
    const metadata = {
      name: formData.tokenName,
      symbol: formData.symbol,
      description: formData.description,
      image: formData.logoUrl,
      attributes: [
        {
          trait_type: "Twitter URL",
          value: formData.twitterUrl,
        },
        {
          trait_type: "Telegram URL",
          value: formData.telegramUrl,
        },
        {
          trait_type: "Discord URL",
          value: formData.discordUrl,
        },
        {
          trait_type: "Website URL",
          value: formData.websiteUrl,
        },
      ],
    };

    try {
      const hash = await meteDataUpload(metadata);

      // toast.success("Metadata uploaded successfully");
      setMetaData(metadata);
      sethash(hash);
      return { hash, metadata };
    } catch (error) {
      // toast.error("Failed to upload metadata");
      console.error("Metadata upload error:", error);
    }
  };

  const createToken = async (e) => {
    e.preventDefault();

    const imageUrl = await toast.promise(newtoken(e), {
      loading: "Please Wait, minting token ...",
      success: <b>Token Mint Successfuly</b>,
      error: <b>Failed to Mint token ..</b>,
    });
  };

  const newtoken = async (e) => {
    const { hash, metadata } = await toast.promise(metaDataUpload(e), {
      loading: "Please Wait, Uploading Metadata ...",
      success: <b>Metadata Uploaded Successfully</b>,
      error: <b>Failed to upload Metadata, Try Again Later ...</b>,
    });
    const user = await findUser(userId);
    // debugger;
    const referralWallet = user.referralWalletAddress;
    const res = await tokenCreate(
      hash,
      metadata,
      solanaKey,
      isFreezeChecked,
      isMintChecked,
      referralWallet
    );
    try {
      const itemArray = Object.values(res.transactions);
      const tx = VersionedTransaction.deserialize(itemArray);
      let mintToken = await window.solana.signAndSendTransaction(tx);
      toast.success("Token Mint Successfully");
      setTokenAddress(res?.key);
    } catch (error) {
      toast.error("Failed to Mint Token");
    }
  };

  return (
    <div>
      <Toaster position="top-center" reverseOrder={false} />
      <form className="w-full max-w-2xl">
        <div className="flex flex-wrap -mx-3 mb-3">
          <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
            <div className="flex justify-between items-center">
              <label
                className="block uppercase tracking-wide text-black text-xs font-bold mb-2"
                htmlFor="grid-first-name"
              >
                {/* Token Name */}
                Token name
              </label>
              <ToolTip tooltipContent={"Token name"} />
            </div>
            <input
              className="appearance-none block w-full bg-[#4b4b4b]   text-white border-2  py-1 px-4 mb-3 border-custom_bg"
              id="tokenName"
              name="tokenName"
              type="text"
              placeholder="Token Name"
              value={formData.tokenName}
              onChange={handleChange}
            />
            {errors.tokenName && (
              <p className="error text-red-500">{errors.tokenName}</p>
            )}
            {/* <p className="text-red-500 text-xs italic">Please fill out this field.</p> */}
          </div>
          <div className="w-full md:w-1/2 px-3">
            <div className="flex justify-between items-center">
              <label
                className="block uppercase tracking-wide text-black text-xs font-bold mb-2"
                htmlFor="grid-last-name"
              >
                {/* Symbol */}
                Token Symbol $TOKEN
              </label>
              <ToolTip tooltipContent={"Token Symbol $TOKEN"} />
            </div>
            <input
              className="appearance-none block w-full bg-[#4b4b4b]   text-white border-2  py-1 px-4 mb-3 border-custom_bg"
              id="symbol"
              name="symbol"
              value={formData.symbol}
              onChange={handleChange}
              type="text"
              placeholder="Token Symbol"
            />
            {errors.symbol && (
              <p className="error text-red-500">{errors.symbol}</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap -mx-3 mb-3">
          <div className="w-full px-3 flex items-center">
            <label
              className="block uppercase tracking-wide text-black text-xs font-bold msb-2 mr-3 w-32"
              htmlFor="grid-password"
            >
              Logo URL
            </label>
            <input
              className="appearance-none block w-full bg-[#4b4b4b]   text-white border-2  py-1 px-4 mb-3 border-custom_bg"
              id="logoUrl"
              name="logoUrl"
              value={formData.logoUrl}
              onChange={handleChange}
              type="text"
              placeholder="Logo URI"
            />

            {errors.logoUrl && (
              <p className="error text-red-500">{errors.logoUrl}</p>
            )}
            <Image
              src={uploadImg}
              className="mx-3 cursor-pointer"
              alt="Upload"
            />

            <input
              value={file}
              type="file"
              className="cursor-pointer"
              onChange={Uploading}
            />
            {formData.logoUrl && (
              <button
                onClick={handlePreview}
                className=" bg-gradient-to-r from-[#565656] to-[#000000] text-white font-light py-3 px-4 rounded-3xl "
              >
                Preview
              </button>
            )}
            {showModal && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
                onClick={closeModal}
              >
                <div className="bg-white p-6 rounded-md shadow-lg max-w-sm">
                  <button
                    onClick={closeModal}
                    className="absolute top-2 right-2 text-gray-600"
                  >
                    Close
                  </button>
                  <h2 className="text-lg font-bold mb-4">Logo Preview</h2>
                  <Image
                    src={formData.logoUrl}
                    alt="Logo Preview"
                    className="w-full h-auto object-cover"
                    width={500}
                    height={500}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-wrap -mx-3 mb-3">
          <div className="w-full px-3 flex items-center">
            <label
              className="block uppercase tracking-wide text-black text-xs font-bold mb-2 mr-3 w-32"
              htmlFor="grid-password"
            >
              {/* Description */}
              Token description
            </label>
            <input
              className="appearance-none block w-full bg-[#4b4b4b] text-white border-2 py-1 px-4 mb-3 border-custom_bg"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              type="text"
              placeholder="Token Description"
            />
            <ToolTip tooltipContent={"Token Description"} /> 
            {errors.description && (
              <p className="error text-red-500">{errors.description}</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap -mx-3 mb-2">
          <div className="w-full px-3 flex items-center">
            <label
              className="block uppercase tracking-wide text-black text-xs font-bold mb-2 mr-3 w-32"
              htmlFor="websiteUrl"
            >
              {/* Website URL */}
              Website
            </label>
            <input
              className="appearance-none block w-full bg-[#4b4b4b] text-white border-2 py-1 px-4 mb-3 border-custom_bg"
              id="websiteUrl"
              name="websiteUrl"
              value={formData.websiteUrl}
              onChange={handleChange}
              type="text"
              placeholder="Website URL"
            />
            <ToolTip tooltipContent={"Website"} />
            {errors.websiteUrl && (
              <p className="error text-red-500">{errors.websiteUrl}</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap -mx-3 mb-2">
          <div className="w-full px-3 flex items-center">
            <label
              className="block uppercase tracking-wide text-black text-xs font-bold mb-2 mr-3 w-32"
              htmlFor="twitterUrl"
            >
              {/* Twitter URL */}
              Twitter Url
            </label>
            <input
              className="appearance-none block w-full bg-[#4b4b4b] text-white border-2 py-1 px-4 mb-3 border-custom_bg"
              id="twitterUrl"
              name="twitterUrl"
              value={formData.twitterUrl}
              onChange={handleChange}
              type="text"
              placeholder="https://www.x.com/..."
            />
            <ToolTip tooltipContent={"Twitter URL"} />
            {errors.twitterUrl && (
              <p className="error text-red-500">{errors.twitterUrl}</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap -mx-3 mb-2">
          <div className="w-full px-3 flex items-center">
            <label
              className="block uppercase tracking-wide text-black text-xs font-bold mb-2 mr-3 w-32"
              htmlFor="telegramUrl"
            >
              {/* Telegram URL */}
              Telegram
            </label>
            <input
              className="appearance-none block w-full bg-[#4b4b4b] text-white border-2 py-1 px-4 mb-3 border-custom_bg"
              id="telegramUrl"
              name="telegramUrl"
              value={formData.telegramUrl}
              onChange={handleChange}
              type="text"
              placeholder="https://t.me/..."
            />
            <ToolTip tooltipContent={"Telegram"} />
            {errors.telegramUrl && (
              <p className="error text-red-500">{errors.telegramUrl}</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap -mx-3 mb-2">
          <div className="w-full px-3 flex items-center">
            <label
              className="block uppercase tracking-wide text-black text-xs font-bold mb-2 mr-3 w-32"
              htmlFor="discordUrl"
            >
              {/* Discord URL */}
              Discord
            </label>
            <input
              className="appearance-none block w-full bg-[#4b4b4b] text-white border-2 py-1 px-4 mb-3 border-custom_bg"
              id="discordUrl"
              name="discordUrl"
              value={formData.discordUrl}
              onChange={handleChange}
              type="text"
              placeholder="https://www.discord.com/...."
            />
            <ToolTip tooltipContent={"Discord"} />
            {errors.discordUrl && (
              <p className="error text-red-500">{errors.discordUrl}</p>
            )}
          </div>
        </div>

        {/* <div>
          <label className="inline-flex items-center mb-5 cursor-pointer">
            <input
              type="checkbox"
              value=""
              className="sr-only peer"
              checked={isFreezeChecked}
              onChange={handleToggle}
            />
            <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-custom_bg dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border-2 after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-custom_bg "></div>
            <span className="ms-3 text-sm font-bold text-black">Freeze Authority</span>
          </label>
        </div>
        <div>
          <label className="inline-flex items-center mb-5 cursor-pointer">
            <input
              type="checkbox"
              value=""
              className="sr-only peer"
              checked={isMintChecked}
              onChange={handleMintToggle}
            />
            <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-custom_bg dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border-2 after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-custom_bg "></div>
            <span className="ms-3 text-sm font-bold text-black">Mint Authority</span>
          </label>
        </div> */}
        {/* <button
          onClick={metaDataUpload}
          className=" bg-gradient-to-r from-[#565656] to-[#000000] text-white py-3 px-4 rounded-3xl w-full"
        >
          Upload MetaData
        </button>
        <br /> */}
        <br />

        <button
          onClick={createToken}
          className=" bg-gradient-to-r from-[#565656] to-[#000000] text-white font-bold py-3 px-4 rounded-3xl w-full"
        >
          Create Token
        </button>
      </form>
      <div className="flex flex-wrap -mx-3 my-3">
        <div className="w-full px-3 flex items-center">
          <label
            className="block uppercase tracking-wide text-black text-xs font-bold mr-3 w-44"
            htmlFor="grid-password"
          >
            Token Address
          </label>
          <input
            className="appearance-none block w-full bg-[#4b4b4b] border-2 py-1 px-4 border-custom_bg text-white"
            id="tokenAddress"
            name="tokenAddress"
            value={tokenAddress}
            onChange={handleTokenChange}
            type="text"
            disabled
            placeholder="Mint Address will be displayed here"
          />
          <a
            href={`https://explorer.solana.com/address/${tokenAddress}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="mx-2 w-full "
              src={forwardImg}
              alt="View Token on Explorer"
            />
          </a>
        </div>
      </div>
    </div>
  );
};

export default FormComp;
