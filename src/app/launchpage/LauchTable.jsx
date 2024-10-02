

import React from "react";
import "./LaunchTable.css"; // Import the CSS file for styling
import CopyImg from "./copywhite.png"
import Image from "next/image";
import toast from "react-hot-toast";
const formatPublicKey = (key, start = 4, end = 4) => {
  if (!key || key.length <= start + end) return key; // Return key if it's too short

  const startPart = key.slice(0, start);
  const endPart = key.slice(-end);
  return `${startPart}...${endPart}`;
};

const LauchTable = ({ tableData }) => {
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied Successfully")// You can replace this with a toast notification for better UX
  };
  return (
    <div
      className="relative overflow-x-auto shadow-lg border border-gray-600 rounded-lg"
      style={{ height: "500px" }}
    >
      <table className="w-full text-sm text-left text-gray-400 h-full">
        <thead className="text-xs text-gray-100 uppercase bg-gradient-to-r from-purple-700 to-blue-600 sticky top-0">
          <tr>
            <th scope="col" className="px-6 py-3">
              #
            </th>
            <th scope="col" className="px-6 py-3">
              Address

            </th>
            <th scope="col" className="px-6 py-3">
              Private Key

            </th>
            <th scope="col" className="px-6 py-3">
              SOL Balance
            </th>
            <th scope="col" className="px-6 py-3">
              Token Balance
            </th>
          </tr>
        </thead>
        <tbody>
          {tableData?.map((item, index) => (
            <tr
              key={index}
              className={`bg-${index % 2 === 0 ? "light" : "dark"} hover:bg-purple-900 transition-all duration-200`}
            >
              <td className="px-6 py-4 font-medium text-white">{index + 1}</td>
              <td className="px-6 py-4 text-white flex gap-2">
                {formatPublicKey(item?.publicKey || item?.pubKey)}
                <Image src={CopyImg} width={16}  // Desired width
                  height={14}
                  style={{ cursor: "pointer" }}

                  onClick={() => copyToClipboard(item?.publicKey || item?.pubKey)}
                />
              </td>
              <td className="px-6 py-4 text-white">
                <div className="flex gap-2">
                  {formatPublicKey(item?.secretKey || item?.privateKey)}
                  <Image src={CopyImg} width={16}  // Desired width
                    height={14}
                    style={{ cursor: "pointer" }}
                    onClick={() => copyToClipboard(item?.secretKey || item?.privateKey)}
                  />
                </div>
              </td>
              <td className="px-6 py-4 text-white">{item?.solBalance || 0}</td>
              <td className="px-6 py-4 text-white text-right">
                {item?.tokenBalance || 0}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LauchTable;
