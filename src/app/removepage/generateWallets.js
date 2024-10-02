import axios from 'axios';
const solanaWeb3 = require('@solana/web3.js');
// const createCsvWriter = require('csv-writer').createObjectCsvWriter;
// const fs = require('fs');
const { getAssociatedTokenAddressSync } = require("@solana/spl-token");
const { PublicKey } = require("@solana/web3.js");
const bs58 = require("bs58");
// Define the CSV file writer
// Function to generate a wallet and return its details
export const generateWallet = (mint) => {
    const mintPubkey = new PublicKey(mint);
    const keypair = solanaWeb3.Keypair.generate();
    const coinATA = getAssociatedTokenAddressSync(mintPubkey, keypair.publicKey);
    const solMintPubkey = new PublicKey("So11111111111111111111111111111111111111112");
    const solATA = getAssociatedTokenAddressSync(solMintPubkey, keypair.publicKey)
    return {
        publicKey: keypair.publicKey.toString(),
        secretKey: bs58.encode(Buffer.from(keypair.secretKey)),
        cointATA: coinATA.toString(),
        solATA: solATA.toString()
    };
};
// Main function to generate 19 wallets and save them to CSV
export const generateWallets = async (count, mint, lamports , projectId) => {
    let wallets = [];
    const distWallet = generateWallet(mint);
    let solAmount;
    
    // const projectId=localStorage.getItem("projectId")
    const res = await axios.get(`/api/walletService/getWallet?projectId=${projectId}`);
    console.log(res.data)
    if (res.data.length === 0) {
        for (let i = 0; i < count - 1; i++) {
            const wallet = generateWallet(mint);
            let solAmount;
            solAmount = parseInt(lamports[i])
            wallets.push({
                index: i,
                publicKey: wallet.publicKey,
                secretKey: wallet.secretKey,
                coinATA: wallet.cointATA,
                solATA: wallet.solATA,
                lamports: solAmount,
            });
        }
        wallets.push({
            index: count - 1,
            publicKey: distWallet.publicKey,
            secretKey: distWallet.secretKey,
            coinATA: distWallet.cointATA,
            solATA: distWallet.solATA,
            lamports: 0,
        });
        return { wallets: wallets, message: "" };
    } else {
        wallets = res.data;
        return { wallets: wallets, message: "Already Exist" };
    }
    // try {
    //     await csvWriter.writeRecords(wallets);
    //     console.log('Wallets generated and saved to solana_wallets.csv');
    // } catch (error) {
    //     console.error('Error writing to CSV file', error);
    // }
};
