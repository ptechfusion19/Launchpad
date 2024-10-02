"use client";
import React, { Children, useState } from "react";
import LaunchPadContext from "./LaunchPadContext";

const LaunchPadProvider = ({ children }) => {
  const [solanaKey, setSolanaKey] = useState(null);
  const [connected, setConnected] = useState(false);
  const [balance, setBalance] = useState(0);
  const [account, setAccount] = useState(null);
  const [userId, setUserId] = useState(null);

  const [web3, setWeb3] = useState(null);
  const [signedMessage, setSignedMessage] = useState(null);
  return (
    <LaunchPadContext.Provider
      value={{
        solanaKey,
        setSolanaKey,
        connected,
        setConnected,
        balance,
        setBalance,
        account,
        setAccount,
        web3,
        setWeb3,
        signedMessage,
        setSignedMessage,
        userId,
        setUserId
      }}
    >
      {children}
    </LaunchPadContext.Provider>
  );
};

export default LaunchPadProvider;
