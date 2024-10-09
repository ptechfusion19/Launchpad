"use client"

import { useContext, useState } from 'react';
import Web3 from 'web3';
// import { useNavigate } from 'react-router-dom';
// import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { Connection, clusterApiUrl, PublicKey } from '@solana/web3.js';
import LaunchPadContext from '../context/LaunchPadContext';
import { postUser } from './useLaunch';
const usePhantom = () => {

    const { connected, setConnected, setAccount, setWeb3, setSignedMessage, setSolanaKey, setBalance, solanaKey, setUserId } = useContext(LaunchPadContext);
    const connectToPhantom = async () => {
        if (window.solana) {        
          
            // debugger
            try {
                if (window.solana.isConnected) {
                    await window.solana.connect();
                    const solanaPublicKey = window.solana.publicKey.toString();
                    console.log(solanaPublicKey, ">>>>>>>");
                    setSolanaKey(solanaPublicKey);
                    setConnected(true);
                    localStorage.setItem("solanaKey", solanaPublicKey);
                    localStorage.setItem("connected", true);
                    const obj = {
                        walletAddress: solanaPublicKey
                    }
                    const userCheck = await postUser(obj);
                    // debugger
                    console.log(userCheck)
                    setUserId(userCheck?._id)
                    //console.log(userCheck)
                    // setUserId(userCheck.id);
                    // Initialize connection to the Solana devnet (or mainnet-beta if needed)
                    // //debuger;
                    const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL, 'processed');
                    //const connection = new Connection('https://api.mainnet.solana.com');
                    // //debuger;
                    // Fetch balance
                    const publicKey = new PublicKey(solanaPublicKey);
                    const balance = await connection.getBalance(publicKey);
                    setBalance(balance / 1e9);
                    console.log(`Balance for wallet ${solanaPublicKey}: ${balance / 1e9} SOL`);
                } else {
                    // navi("/new-pairs");
                }
            } catch (error) {
                console.error(error);
            }
        } else {
            alert('Phantom extension not detected!');
        }
        // }
    };


    const connectToSolflare = async () => {
        try {
            if (!window.solflare) {
                alert('Solflare extension not detected!');
                return;
            }
            if (!window.solflare.isConnected) {
                const response = await window.solflare.connect();

                if (response) {
                    const solflarePublicKey = await window.solflare.publicKey;

                    if (solflarePublicKey) {
                        // //////  
                        setConnected(true);
                        //console.log(solflarePublicKey.toString(), ">>>>>>>");
                        setSolanaKey(solflarePublicKey.toString());
                        localStorage.setItem("connected", true);
                        localStorage.setItem("solanaKey", solflarePublicKey.toString());
                        localStorage.setItem("connectedToSolflare", true);

                    } else {
                        console.error("Failed to retrieve the public key from Solflare.");
                    }
                } else {
                    console.error("Failed to connect to the Solflare wallet.");
                }

            } else {
                navi("/dashboard");

            }

        } catch (error) {
            console.error(error);
        }
    };

    const disconnectFromWallet = () => {
        setConnected(false);
        setAccount(null);
        setWeb3(null);
        window.solana.disconnect();
        // window.solflare.disconnect();

        localStorage.removeItem("account");
        localStorage.removeItem("web3");
        localStorage.removeItem("connected");
        localStorage.removeItem("solanaKey");
        localStorage.removeItem("publicKey");
        localStorage.removeItem("connectedToSolflare");
        localStorage.removeItem("-walletlink:https://www.walletlink.org:EIP6963ProviderUUID");

    };

    const newUsersignMessage = async () => {
        ////////  
        if (window.solana && solanaKey) {
            const message = 'To avoid digital dognappers, sign below to authenticate with fusiond_app.';
            const encoder = new TextEncoder();
            const encodedMessage = encoder.encode(message);

            try {
                const signedMessage = await window.solana.signMessage(encodedMessage, 'utf8');
                // const signature = Buffer.from(signedMessage.signature).toString('hex'); // Convert signature to hex string
                // setSignedMessage(signature);
                // localStorage.setItem("sign", signature);
                navi("/step1");
            } catch (error) {
                console.error('Error signing message:', error);
            }
        } else {
            console.error('Solana wallet instance or public key not available.');
        }
    };
    const newSignMessageWithSolflare = async () => {
        try {
            // Check if the Solflare extension is available
            if (!window.solflare) {
                console.error('Solflare extension not detected!');
                return;
            }

            // Check if the user is connected to the Solflare wallet
            if (!window.solflare.isConnected) {
                console.error('User is not connected to the Solflare wallet.');
                return;
            }

            // Construct the message to be signed
            const message = 'To avoid digital dognappers, sign below to authenticate with fusiond_app.';
            const encoder = new TextEncoder();
            const encodedMessage = encoder.encode(message);

            // Sign the message using the Solflare wallet
            const signedMessage = await window.solflare.signMessage(encodedMessage, 'utf8');


            navi("/step1");
        } catch (error) {
            console.error('Error signing message:', error);
        }
    };
    const SignMessageWithSolflare = async () => {
        try {
            // Check if the Solflare extension is available
            if (!window.solflare) {
                console.error('Solflare extension not detected!');
                return;
            }

            // Check if the user is connected to the Solflare wallet
            if (!window.solflare.isConnected) {
                console.error('User is not connected to the Solflare wallet.');
                return;
            }

            // Construct the message to be signed
            const message = 'To avoid digital dognappers, sign below to authenticate with fusiond_app.';
            const encoder = new TextEncoder();
            const encodedMessage = encoder.encode(message);

            // Sign the message using the Solflare wallet
            const signedMessage = await window.solflare.signMessage(encodedMessage, 'utf8');


            // navi("/dashboard");
        } catch (error) {
            console.error('Error signing message:', error);
        }
    };


    const signMessage = async () => {
        if (window.solana && solanaKey) {
            const message = 'To avoid digital dognappers, sign below to authenticate with Fusionbets.';
            const encoder = new TextEncoder();
            const encodedMessage = encoder.encode(message);

            try {
                const signedMessage = await window.solana.signMessage(encodedMessage, 'utf8');
                const signature = signedMessage.signature.toString('hex'); // Convert signature to hex string
                setSignedMessage(signature);
                localStorage.setItem("sign", signature);

                // navi("/dashboard");
            } catch (error) {
                console.error('Error signing message:', error);
            }
        } else {
            console.error('Solana wallet instance or public key not available.');
        }
    };


    // return { connectToPhantom, disconnectFromMetaMask, connected, account, web3, signMessage, newUsersignMessage, solanaKey };
    return { connectToPhantom, disconnectFromWallet, connected, signMessage, newUsersignMessage, solanaKey, connectToSolflare, SignMessageWithSolflare, newSignMessageWithSolflare };

};

export default usePhantom;
