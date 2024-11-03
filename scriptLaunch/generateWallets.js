import axios from 'axios';
import { Keypair, PublicKey } from '@solana/web3.js';
import { createObjectCsvWriter } from 'csv-writer';
import fs from 'fs';
import bs58 from 'bs58';
import { getAssociatedTokenAddressSync } from '@solana/spl-token';

// Configure the CSV writer
const csvWriter = createObjectCsvWriter({
    path: 'solana_wallets.csv',
    header: [
        { id: 'index', title: 'Index' },
        { id: 'publicKey', title: 'Public Key' },
        { id: 'secretKey', title: 'Secret Key' },
        { id: 'coinATA', title: 'Coin ATA' },
        { id: 'solATA', title: 'SOL ATA' },
        { id: 'lamports', title: 'Lamports' },
    ],
});

// Function to generate a wallet and return its details
export const generateWallet = (mint) => {
    const mintPubkey = new PublicKey(mint);
    const keypair = Keypair.generate();
    const coinATA = getAssociatedTokenAddressSync(mintPubkey, keypair.publicKey);
    const solMintPubkey = new PublicKey('So11111111111111111111111111111111111111112');
    const solATA = getAssociatedTokenAddressSync(solMintPubkey, keypair.publicKey);
    
    return {
        publicKey: keypair.publicKey.toString(),
        secretKey: bs58.encode(Buffer.from(keypair.secretKey)),
        coinATA: coinATA.toString(),
        solATA: solATA.toString(),
    };
};

// Main function to generate wallets and save them to CSV
export const generateWallets = async (count, mint, lamports) => {
    try {
        const wallets = [];
        const distWallet = generateWallet(mint);

        // Generate wallets and add to the list
        for (let i = 0; i < count - 1; i++) {
            const wallet = generateWallet(mint);
            const solAmount = parseInt(lamports[i]) || 0;

            wallets.push({
                index: i,
                publicKey: wallet.publicKey,
                secretKey: wallet.secretKey,
                coinATA: wallet.coinATA,
                solATA: wallet.solATA,
                lamports: solAmount,
            });
        }

        // Add distribution wallet
        wallets.push({
            index: count - 1,
            publicKey: distWallet.publicKey,
            secretKey: distWallet.secretKey,
            coinATA: distWallet.coinATA,
            solATA: distWallet.solATA,
            lamports: 0,
        });

        // Write to CSV
        await csvWriter.writeRecords(wallets);
        console.log('Wallets generated and saved to solana_wallets.csv');
        
        return { wallets, distWalletObject: wallets[wallets.length - 1] };
    } catch (error) {
        console.error('Error writing to CSV file:', error);
        throw error; // Re-throw error for external handling if necessary
    }
};
