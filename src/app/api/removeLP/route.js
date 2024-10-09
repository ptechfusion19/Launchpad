


import { NextResponse } from 'next/server';
import { getPoolKeys } from '@/app/utils';
import LaunchSettings from '../../../models/launchSettingsModel';
// import Wallet from '../../../models/walletModel';
import User from '../../../models/userModel';
import { SystemProgram, VersionedMessage } from '@solana/web3.js';
import { MemoTransferInstruction } from '@solana/spl-token';
// const { getMint } = require("@solana/spl-token");
// import { getMint } from '@solana/spl-token';
import { getMint } from '@solana/spl-token';
import Wallet from '../../../models/walletModel';
import PoolKey from "../../../models/poolKeysModel"
import MarketInfo from "../../../models/marketInfoModel"
// const BigNumber = require('bignumber.js');
import BigNumber from "bignumber.js"
import { AMM_V4, Raydium } from "@raydium-io/raydium-sdk-v2";
import connectDB from '../../../config/database';
// const solanaWeb3 = require('@solana/web3.js');
import { Connection, TransactionMessage, VersionedTransaction, TransactionInstruction } from "@solana/web3.js";
import * as solanaWeb3 from '@solana/web3.js'

import fs from "fs"
// const {PublicKey, Keypair} = require('@solana/web3.js');
// import { PublicKey, Keypair } from '@solana/web3.js';
import { PublicKey, Keypair } from '@solana/web3.js';
// const BN = require("bn.js");
import BN from "bn.js"
import {getOrCreateAssociatedTokenAccount} from '@solana/spl-token';
import { CurrencyAmount, Currency, Token, TokenAmount, PoolInfoLayout, SPL_MINT_LAYOUT } from '@raydium-io/raydium-sdk';

// import Wall
// const {
//     PublicKey,
// } = require("@solana/web3.js");

import {

    // TOKEN_PROGRAM_ID,
    // SPL_ACCOUNT_LAYOUT,
    TxVersion,
    // Liquidity,
    buildSimpleTransaction
} from "@raydium-io/raydium-sdk-v2";
// import { Liquidity } from '@raydium-io/raydium-sdk-v2';
// import { SPL_ACCOUNT_LAYOUT } from '@solana/spl-token';
import { Liquidity, SPL_ACCOUNT_LAYOUT } from '@raydium-io/raydium-sdk';
// const {makeCreateMarketInstruction} = require('@raydium-io/raydium-sdk-v2');
import { makeCreateMarketInstruction } from "@raydium-io/raydium-sdk-v2";
import { generatePubKey, OPEN_BOOK_PROGRAM } from '@raydium-io/raydium-sdk-v2';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

// const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL);
const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL, 'processed');

// const connection = new Connection("https://ultra-delicate-lambo.solana-mainnet.quiknode.pro/9e6a18285b47f9974b7cac73e999be568cfe9929");
const jito_Validators = [
    "DfXygSm4jCyNCybVYYK6DwvWqjKee8pbDmJGcLWNDXjh",
    "ADuUkR4vqLUMWXxW9gh6D6L8pMSawimctcNZ5pGwDcEt",
    "3AVi9Tg9Uo68tJfuvoKvqKNWKkC5wPdSSdeBnizKZ6jT",
    "HFqU5x63VTqvQss8hp11i4wVV8bD44PvwucfZ2bU7gRe",
    "ADaUMid9yfUytqMBgopwjb2DTLSokTSzL1zt6iGPaS49",
    "Cw8CFyM9FkoMi7K7Crf6HNQqf4uEMzpKw6QNghXLvLkY",
    "DttWaMuVvTiduZRnguLF7jNxTgiMBZ1hyAumKUiL2KRL",
    "96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5",
];
const endpoints = [ // TODO: Choose a jito endpoint which is closest to your location, and uncomment others
    "https://mainnet.block-engine.jito.wtf/api/v1/bundles",
    "https://amsterdam.mainnet.block-engine.jito.wtf/api/v1/bundles",
    "https://frankfurt.mainnet.block-engine.jito.wtf/api/v1/bundles",
    "https://ny.mainnet.block-engine.jito.wtf/api/v1/bundles",
    "https://tokyo.mainnet.block-engine.jito.wtf/api/v1/bundles",
];

const signTxsPhantom = async (transactions) => {
    //console.log(typeof (transactions), "These are the transactions ")
    //console.log((transactions), "These are the transactions ")

    const bs58EncodedTxs = [];
    let tx_encoded;
    for (const tx of transactions) {
        // tx_encoded = bs58.encode(tx.serialize());
        tx_encoded = tx.serialize();
        bs58EncodedTxs.push(tx_encoded);
    }
    return bs58EncodedTxs;
}
const { getAssociatedTokenAddressSync } = require("@solana/spl-token");
// const {PublicKey} = require("@solana/web3.js");
const bs58 = require("bs58");

const makeTxVersion = TxVersion.V0; // LEGACY



const getWalletTokenAccount = async (connection, wallet) => {
    const walletTokenAccount = await connection.getTokenAccountsByOwner(wallet, {
        programId: TOKEN_PROGRAM_ID,
    });
    return walletTokenAccount.value.map((i) => ({
        pubkey: i.pubkey,
        programId: i.account.owner,
        accountInfo: SPL_ACCOUNT_LAYOUT.decode(i.account.data),
    }));
};




const transferSolInstruction = async (from_wallet, to_wallet, lamports) => {
    return solanaWeb3.SystemProgram.transfer({ fromPubkey: from_wallet, toPubkey: to_wallet, lamports: lamports })
}

const getRandomValidator = async () => {
    const res =
        jito_Validators[Math.floor(Math.random() * jito_Validators.length)];
    return new PublicKey(res);
}


const getJitoTipInstruction = async (payerPubkey, jitofee) => {
    const jito_validator_wallet = await getRandomValidator();
    //console.log("Selected Jito Validator: ", jito_validator_wallet.toBase58());
    // const latestBlockhash = await connection.getLatestBlockhash()
    const fee = new CurrencyAmount(Currency.SOL, jitofee, false).raw.toNumber();
    //console.log(`Jito Fee: ${fee / 10 ** 9} sol`);
    // const jitoFee_message = new TransactionMessage({
    //   payerKey: payerPubkey,
    //   recentBlockhash: latestBlockhash.blockhash,
    //   instructions: [

    //   ],
    // }).compileToV0Message();
    // const jitoFee_transaction = new VersionedTransaction(jitoFee_message);
    return SystemProgram.transfer({
        fromPubkey: payerPubkey,
        toPubkey: jito_validator_wallet,
        lamports: fee,
    });
}

const buildUnsignedTransaction = async (feePayer, instructions) => {
    const lastestBlockhash = (await connection.getLatestBlockhash());
    //console.log("first")
    const txnMessage = new TransactionMessage({
        payerKey: feePayer,
        recentBlockhash: lastestBlockhash.blockhash,
        instructions: [
            ...instructions
        ],
    });
    // //console.log(txnMessage);
    return new VersionedTransaction(txnMessage.compileToV0Message());
}


export async function POST(req) {
    await connectDB();

    const { projectId, userId } = await req.json();
    console.log("this is ", projectId, userId)
    try {
        const project = await LaunchSettings.findOne({
            projectId: projectId
        });
        const user = await User.findById(project.userId);
        let mint = project.mint;
        
        const owner = new PublicKey(user.walletAddress);
        console.log(project);
        let marketInfo = await MarketInfo.find({ projectId });
        marketInfo = marketInfo[marketInfo.length-1];
        const marketId = new PublicKey(marketInfo.marketInfo.id);
        // const marketId = new PublicKey("FgQ7djJeYzRHm2nVSiUEqYxkc5hUC8rKQQSJ7CVo9f58");
        
        const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL, 'processed');
        

        const baseMint = new PublicKey(marketInfo.marketInfo.baseMint);
        const quoteMint = new PublicKey(marketInfo.marketInfo.quoteMint);
        console.log(baseMint , quoteMint , "we are m,ints")
        
        const baseDecimals = SPL_MINT_LAYOUT.decode((await connection.getAccountInfo(baseMint)).data).decimals;
        const quoteDecimals = 9;
        const freshPoolKeys = await getPoolKeys(connection, baseMint, quoteMint, baseDecimals, quoteDecimals, marketId);
        const lpUserKeys = {
            baseTokenAccount: freshPoolKeys.baseVault,
            quoteTokenAccount: freshPoolKeys.quoteVault,
            lpTokenAccount: freshPoolKeys.lpVault,
            owner: owner
        }
        const lpMint = freshPoolKeys.lpMint;
        const walletTokenAccounts = await getWalletTokenAccount(connection, owner);
        const lpToken = new Token(TOKEN_PROGRAM_ID, freshPoolKeys.lpMint, freshPoolKeys.lpDecimals);
        const tokenAccount = await getOrCreateAssociatedTokenAccount(connection, owner, freshPoolKeys.lpMint, owner);
        console.log("========= lpToken:", lpToken)
        console.log("========= tokenAccount : ",tokenAccount)
    
        let amountIn = new TokenAmount(lpToken, tokenAccount.amount);
        
        
        const params =  {
            connection: connection,
            poolKeys: freshPoolKeys,
            userKeys: {
                tokenAccounts: walletTokenAccounts,
                owner: owner,
                payer: owner,
            },
            amountIn: amountIn
            
        }
        const removeLPInstructions = (await Liquidity.makeRemoveLiquidityInstructionSimple(params)).innerTransactions[0].instructions;
        // console.log(removeLPInstructions.innerTransactions.instructions.length);

        // const jitoTip = await getJitoTipInstruction(owner, 0.0001);
        const txn = await buildUnsignedTransaction(owner, removeLPInstructions);
        const baseData = {txn: txn.serialize()}
        
        console.log(removeLPInstructions);
        //console.log("Base Data" + baseData);
        return NextResponse.json(baseData, { status: 200 });
    }

    catch (error) {
        console.log(error)
        return NextResponse.json(error, { status: 400 });

    }
}
// const getUnSignedTransactions = async (projectId) => {
//     // TODO: Get project document from mongo
//     let project;
//     let mint = project.mint;
//     let walletPubkeyStr = project.user.walletAddress;
//     let tokenInitialLiquidity = project.amountTokens;
//     let solInitialLiquidity = project.amountSol;
//     let snipeSolAmount = amountSolForSnipping;
//     const baseData = await prepareTxs(mint, walletPubkeyStr, tokenInitialLiquidity, solInitialLiquidity, snipeSolAmount);
//     // {
//     //     allTxs: bs58EncodedTxs,
//     //     poolKeys: poolKeys,
//     //     marketInfo: marketInfo,
//     //     wallets: allWallets,
//     // }
//     // Step 2: Sign the transactions with the payer (wallet[0])
//     // const payerWallet = baseData.wallets[0];
//     // const payer = Keypair.fromSecretKey(bs58.decode(PRIVATE_KEY));
//     const bs58EncodedTxs = await signTxsPhantom(baseData.allTxs);

//     baseData.allTxs = bs58EncodedTxs;
//     return baseData;

// }


// function fetchMarketInfo({
//     wallet,
//     dexProgramId,
//     baseInfo,
//     quoteInfo,
//     lotSize,
//     tickSize,
//     requestQueueSpace,
//     eventQueueSpace,
//     orderbookQueueSpace,
// }) {
//     // const dexProgramId = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
//     const market = generatePubKey({ fromPublicKey: wallet, programId: dexProgramId });
//     // //console.log(market.publicKey);
//     // //console.log(market.publicKey.toBuffer());
//     // const market = new PublicKey("H5bWMkEHydCU1ZHnTQAEuszRhr5w1zHZThJz9jKNFXKW");
//     const requestQueue = generatePubKey({ fromPublicKey: wallet, programId: dexProgramId });
//     const eventQueue = generatePubKey({ fromPublicKey: wallet, programId: dexProgramId });
//     const bids = generatePubKey({ fromPublicKey: wallet, programId: dexProgramId });
//     const asks = generatePubKey({ fromPublicKey: wallet, programId: dexProgramId });
//     const baseVault = generatePubKey({ fromPublicKey: wallet, programId: TOKEN_PROGRAM_ID });
//     const quoteVault = generatePubKey({ fromPublicKey: wallet, programId: TOKEN_PROGRAM_ID });
//     const feeRateBps = 0;
//     const quoteDustThreshold = new BN(100);

//     function getVaultOwnerAndNonce() {
//         const vaultSignerNonce = new BN(0);
//         // //console.log(market.toBuffer());
//         while (true) {
//             try {
//                 // //console.log(market);
//                 const marketBuffer = market.publicKey.toBuffer();
//                 // //console.log(marketBuffer);
//                 // //console.log(dexProgramId);
//                 const vaultOwner = PublicKey.createProgramAddressSync(
//                     [marketBuffer, vaultSignerNonce.toArrayLike(Buffer, "le", 8)],
//                     dexProgramId,
//                 );
//                 // //console.log(`Vault Owner: ${vaultOwner.toBase58()}, Nonce (Decimal): ${vaultSignerNonce.toString(10)}`);
//                 return { vaultOwner, vaultSignerNonce };
//             } catch (e) {
//                 // console.error(`Nonce ${vaultSignerNonce.toString(10)} failed`);
//                 // //console.log(e);
//                 vaultSignerNonce.iaddn(1);
//                 if (vaultSignerNonce.gt(new BN(25555))) throw Error("find vault owner error");
//             }
//         }
//     }

//     // return
//     const { vaultOwner, vaultSignerNonce } = getVaultOwnerAndNonce();
//     const baseLotSize = new BN(Math.round(10 ** baseInfo.decimals * lotSize));
//     const quoteLotSize = new BN(Math.round(lotSize * 10 ** quoteInfo.decimals * tickSize));

//     if (baseLotSize.eq(new BN(0))) throw Error("lot size is too small");
//     if (quoteLotSize.eq(new BN(0))) throw Error("tick size or lot size is too small");

//     return {
//         programId: dexProgramId,
//         id: market,
//         baseMint: baseInfo.mint,
//         quoteMint: quoteInfo.mint,
//         baseVault,
//         quoteVault,
//         vaultOwner,
//         requestQueue,
//         eventQueue,
//         bids,
//         asks,
//         feeRateBps,
//         quoteDustThreshold,
//         vaultSignerNonce,
//         baseLotSize,
//         quoteLotSize,
//         requestQueueSpace,
//         eventQueueSpace,
//         orderbookQueueSpace,
//     };
// }