
import { getMint } from '@solana/spl-token';

import BigNumber from "bignumber.js"
import { AMM_V4, Raydium, DEVNET_PROGRAM_ID } from "@raydium-io/raydium-sdk-v2";

import { Connection, TransactionMessage, VersionedTransaction, TransactionInstruction } from "@solana/web3.js";
import * as solanaWeb3 from '@solana/web3.js'

import fs from "fs"
import { PublicKey, Keypair } from '@solana/web3.js';
// const BN = require("bn.js");
import BN from "bn.js"
import { CurrencyAmount, Currency, Token, PoolInfoLayout } from '@raydium-io/raydium-sdk';

import  {generateWallets} from "./generateWallets"
import { Liquidity, SPL_ACCOUNT_LAYOUT } from '@raydium-io/raydium-sdk';
// const {makeCreateMarketInstruction} = require('@raydium-io/raydium-sdk-v2');
import { makeCreateMarketInstruction } from "@raydium-io/raydium-sdk-v2";
import { generatePubKey, OPEN_BOOK_PROGRAM } from '@raydium-io/raydium-sdk-v2';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import {calculatePercentages} from './utils';
const connection = new Connection(process.env.RPC_URL, 'processed');






const prepareTxs = async (mint, walletPubkeyStr, tokenInitialLiquidity, solInitialLiquidity, snipeSolAmount, projectId) => {
    
    // const prepareTxs = async (mintString, walletPubkeyStr) => {
    const jitofee_sol = parseFloat(process.env.jitoTip);
    
    const ownerPubkey = new PublicKey(walletPubkeyStr);
    const mintPubKey = new PublicKey(mint);
    const mintInfo = await getMint(connection, mintPubKey)
    const mintDecimals = mintInfo.decimals;
    const allTransactionsArray = [];
    const snipeSolLamports = parseInt(snipeSolAmount * 10 ** 9);
    //  all wallets from DB
    const allLamports = calculatePercentages(snipeSolAmount - 0.3);
    const {allWallets, distWalletObject} = await generateWallets(25, mint, allLamports);
    
    
    
    const distributorWalletPubkey = new PublicKey(distWalletObject.publicKey);

    const transferSnipeSol = await transferSolInstruction(ownerPubkey, distributorWalletPubkey, snipeSolLamports);
    const trasnferSolTip = await getJitoTipInstruction(ownerPubkey, jitofee_sol)
    
    const transferSnipeSolTx = await buildUnsignedTransaction(ownerPubkey, [transferSnipeSol, trasnferSolTip]);
    allTransactionsArray.push(transferSnipeSolTx);
    
    
    console.log("Market Info", walletPubkeyStr, mint, mintDecimals)
    const createMarketResponse = await createMarket(walletPubkeyStr, mint, mintDecimals);
    // // console.log("I am market", createMarketResponse)

    const marketInfo = createMarketResponse.marketInfo;

    const createMarketInstructions = createMarketResponse.instructionsArray;
    
    for (let i = 0; i < createMarketInstructions.length; i++) {
        // console.log("________________________________________");
        if (i == 0) {
            const jitoTipCM = await getJitoTipInstruction(ownerPubkey, jitofee_sol)
            createMarketInstructions[i].push(jitoTipCM)
        }
        // console.log(createMarketInstructions[i]);

        //console.log(ownerPubkey, "I am owner")
        const tx = await buildUnsignedTransaction(ownerPubkey, createMarketInstructions[i]);
        //console.log(tx, "We are Transactions")
        allTransactionsArray.push(tx);
    }
    
    

    // MUST UNCOMMENT
    const strMarketInfo = convertPublicKeysToStrings(marketInfo);
    const marketInfoCreate = new MarketInfo({
        projectId: projectId,
        marketInfo: strMarketInfo,
        mint: mint
    })
    await marketInfoCreate.save()
    const stringifiedKey = marketInfo.id.publicKey.toString();


    // const stringifiedKey = "BCLT4Mi8JyGZxShGPe45eQZ8mzsRNZdSzvZuwxueQxyC";
    
    const addLiquidityResponse = await addLiquidity(ownerPubkey, ownerPubkey, stringifiedKey, mint, tokenInitialLiquidity, solInitialLiquidity);
    // console.log(addLiquidityResponse, 'After Liquidity')
    const poolKeys = addLiquidityResponse.poolKeys;
    
    // await saveObjectToFile(poolKeys, "poolKeys")
    // store

    
    const strPoolKeys = convertPublicKeysToStrings(poolKeys);
    
    const PoolKeyCreate = new PoolKey({
        projectId: projectId,
        poolKey: strPoolKeys,
        mint: mint


    })
    await PoolKeyCreate.save()
    
    const liquidityInstructions = addLiquidityResponse.liqInstructions;
    
    const jitoTipLiq = await getJitoTipInstruction(ownerPubkey, jitofee_sol);
    const feeReceiver = new PublicKey("CqMGfCKkz4GgHEVxyfG35BkYNp56mWqos8jsaqmA2L7K");
    const fee = 0.5;
    const platformFeeInstruction = await transferSolInstruction(ownerPubkey,feeReceiver,fee*10**9);
    liquidityInstructions.push(jitoTipLiq);
    liquidityInstructions.push(platformFeeInstruction);
    
    const liquidityTx = await buildUnsignedTransaction(ownerPubkey, liquidityInstructions);
    allTransactionsArray.push(liquidityTx);
    
    //console.log(allTransactionsArray.length);

    const returnObject = {
        allTxs: allTransactionsArray,
        poolKeys: poolKeys,
        marketInfo: marketInfo,
        wallets: allWallets,
    }
    //console.log(returnObject, "This is return object")
    return returnObject;
}

