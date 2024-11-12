


import {
    percentAmount,
    generateSigner,
    signerIdentity,
    createSignerFromKeypair,
    publicKey
} from '@metaplex-foundation/umi';

import {
    TokenStandard,
    createAndMint,
    mplTokenMetadata
} from '@metaplex-foundation/mpl-token-metadata';

import {
    PublicKey,
    Keypair,
    Connection,
    MessageV0,
    SystemProgram,
    VersionedTransaction,
    TransactionInstruction
} from "@solana/web3.js";

import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import bs58 from 'bs58';
import { NextResponse } from 'next/server';
import { metadata } from '@/app/layout';
import { createSetAuthorityInstruction } from '@solana/spl-token'
import { TOKEN_PROGRAM_ID } from '@raydium-io/raydium-sdk';

// const { percentAmount, generateSigner, signerIdentity, createSignerFromKeypair, publicKey } = require('@metaplex-foundation/umi');
// const { TokenStandard, createAndMint, mplTokenMetadata } = require('@metaplex-foundation/mpl-token-metadata');
// const {PublicKey, Keypair, Connection, MessageV0, VersionedTransaction, TransactionInstruction} = require("@solana/web3.js");
// const { createUmi } = require('@metaplex-foundation/umi-bundle-defaults');
// const bs58 = require('bs58');
// require('dotenv').config();
// async function main () {
// const umi = createUmi(process.env.RPC_URL);
// const secretKeyBase58 = "3FpYDWWDCtp5oXhUixmyjB1aFSmsJdtHcV3UmoTmeiBa6MXEH2z927Rb3p3P9njuybapYbUHjQgNc1md7SaG1SKW"
// const secret = bs58.decode(secretKeyBase58);
// // const userWallet = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(secret));
// const userWallet = new Keypair();
// const userWalletSigner = createSignerFromKeypair(umi, userWallet);
// const secretKeyBase582 = "5XV3eW4MeeYakeQAg2s6zzbZLkVi6jLm31DZxEFWcDwxMt9QEWe8ec5cNy9R7baTCauHgXkCBontYdmWWBBBhPds";
// const payer = Keypair.fromSecretKey(bs58.decode(secretKeyBase582));
// const signer = {publicKey: payer.publicKey, secretKey: new Uint8Array(secret)}
// // console.log(userWalletSigner);
// const metadata = {
//     name: "FusionX",
//     symbol: "FusionX",
//     uri: "https://gateway.pinata.cloud/ipfs/QmYWTAuwPvGnikjfsHwNeznVDH3NPsnXBFmmooJZY9VU8s",
// };
// const mint = generateSigner(umi);
// umi.use(signerIdentity(signer));
// umi.use(mplTokenMetadata());
// const ixs = createAndMint(umi, {
//     mint,
//     authority: umi.identity,
//     name: metadata.name,
//     symbol: metadata.symbol,
//     uri: metadata.uri,
//     sellerFeeBasisPoints: percentAmount(0),
//     decimals: 9,
//     amount: 1000000_00000000,
//     tokenOwner: payer.publicKey,
//     tokenStandard: TokenStandard.Fungible,
// })
// .getInstructions();
// const connection = new Connection(process.env.RPC_URL, 'processed');
// const blockHash = ((await connection.getLatestBlockhash()).blockhash)
// // console.log(ixs);
// console.log(ixs[0].keys);
// const instructions = ixs.map(item => {
//     const updatedKeys = item.keys.map(key => {
//       // Check if pubkey is a string, and convert it to PublicKey
//       return {
//         ...key,
//         pubkey: typeof key.pubkey === 'string' ? new PublicKey(key.pubkey) : key.pubkey
//       };
//     });
//     return new TransactionInstruction({
//       keys: updatedKeys,
//       data: item.data,
//       programId: new PublicKey(item.programId) // Assuming programId is already a string or PublicKey object
//     });
//   });
// // console.log(instructions);
// // console.log(payer.publicKey);
// const message = MessageV0.compile({payerKey: payer.publicKey, instructions: instructions, recentBlockhash:blockHash});
// const txn = new VersionedTransaction(message);
// const mintSigner = Keypair.fromSecretKey(mint.secretKey);
// const response = await connection.simulateTransaction(txn,{sigVerify:true});
// const txResponse = await connection.sendRawTransaction(txn.serialize());
// };
// main();





require('dotenv').config();




export async function POST(req) {
    const { metaData, hash, publicKey, freeze, mintAuthority, referralWallet } = await req.json();
    try {
        const umi = createUmi("https://mainnet.helius-rpc.com/?api-key=e2090957-8cc3-44ab-bb60-82985d36cad5");
        const connection = new Connection("https://mainnet.helius-rpc.com/?api-key=e2090957-8cc3-44ab-bb60-82985d36cad5", 'processed');
        const pubkey = new PublicKey(publicKey)
        const ownerKeys = Keypair.generate();
        const secretKeyBase58 = ownerKeys.secretKey
        // let referralWallet;
        const secret = (secretKeyBase58);
        
        
        const payer = Keypair.fromSecretKey((secretKeyBase58));
        const signer = { publicKey: pubkey, secretKey: new Uint8Array(secret) }
        

        const metadata = {
            name: metaData.name,
            symbol: metaData.symbol,
            uri: `https://gateway.pinata.cloud/ipfs/${hash}`,
        };
        const mint = generateSigner(umi);
        const mintSigner = Keypair.fromSecretKey(mint.secretKey);
        umi.use(signerIdentity(signer));
        umi.use(mplTokenMetadata());

        const ixs = createAndMint(umi, {
            mint,
            authority: umi.identity,
            name: metadata.name,
            symbol: metadata.symbol,
            uri: metadata.uri,
            sellerFeeBasisPoints: percentAmount(0),
            decimals: 9,
            amount: (10**9) * (10**9),
            tokenOwner: pubkey,
            tokenStandard: TokenStandard.Fungible,
        })
            .getInstructions();
        const blockHash = ((await connection.getLatestBlockhash()).blockhash)

        
        if (mintAuthority) {
            const RevokeMintAuthority =
                createSetAuthorityInstruction(
                    mintSigner.publicKey,
                    pubkey,
                    0,
                    null,
                    [],
                    TOKEN_PROGRAM_ID
                )
            console.log(RevokeMintAuthority, " I am mint authority 22")
            ixs.push(RevokeMintAuthority)
        }
        if (freeze) {
            const RevokeFreezeAuthority =
                createSetAuthorityInstruction(
                    mintSigner.publicKey,
                    pubkey,
                    1,
                    null,
                    [],
                    TOKEN_PROGRAM_ID
                )
            ixs.push(RevokeFreezeAuthority)
        }
        const instructions = ixs.map(item => {
            const updatedKeys = item.keys.map(key => {
                // Check if pubkey is a string, and convert it to PublicKey
                return {
                    ...key,
                    pubkey: typeof key.pubkey === 'string' ? new PublicKey(key.pubkey) : key.pubkey
                };
            });
            return new TransactionInstruction({
                keys: updatedKeys,
                data: item.data,
                programId: new PublicKey(item.programId) // Assuming programId is already a string or PublicKey object
            });
        });

        // let refFee = 0;
        // if (referralWallet) {
        //     const refFeeReceiever = new PublicKey(referralWallet);
        //     refFee = 0.1;
        //     const refFeeInstruction = SystemProgram.transfer({ fromPubkey: pubkey, toPubkey: refFeeReceiever, lamports: refFee*10**9 });
        //     instructions.push(refFeeInstruction);
        // }
        
        const feeReceiver = new PublicKey("CqMGfCKkz4GgHEVxyfG35BkYNp56mWqos8jsaqmA2L7K");
        const fee = 0.05 ;
        const platformFeeInstruction = SystemProgram.transfer({ fromPubkey: pubkey, toPubkey: feeReceiver, lamports: fee*10**9 });
        // instructions.push(platformFeeInstruction);
        // console.log(instructions, "W eerererererer")
        const message = MessageV0.compile({ payerKey: pubkey, instructions: instructions, recentBlockhash: blockHash });


        const txn = new VersionedTransaction(message);

        txn.sign([mintSigner])
        console.log(txn, " I am the boss")

        const serilaizedTransactions = txn.serialize()
        const mintadress = mintSigner.publicKey.toString()


        return NextResponse.json({ transactions: serilaizedTransactions, key: mintadress }, { status: 200 }); // Return the image URL
    } catch (error) {
        console.error('Error Creating Token:', error.response?.data || error.message);
        return NextResponse.json({ error: 'Error Creating Token' }, { status: 500 });
    }
}