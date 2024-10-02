// api/burnLP/route.js


import { NextResponse } from 'next/server';
import { getPoolKeys } from '@/app/utils';
import LaunchSettings from '../../../models/launchSettingsModel';
// import Wallet from '../../../models/walletModel';
import User from '../../../models/userModel';



import MarketInfo from "../../../models/marketInfoModel"
// const BigNumber = require('bignumber.js');

import connectDB from '../../../config/database';
// const solanaWeb3 = require('@solana/web3.js');
import { Connection, TransactionMessage, VersionedTransaction, TransactionInstruction } from "@solana/web3.js";


import fs from "fs"

import { PublicKey, Keypair } from '@solana/web3.js';
// const BN = require("bn.js");
import BN from "bn.js"
import { getOrCreateAssociatedTokenAccount } from '@solana/spl-token';
import { CurrencyAmount, Currency, Token, TokenAmount, PoolInfoLayout, SPL_MINT_LAYOUT } from '@raydium-io/raydium-sdk';


import {


    TxVersion,

} from "@raydium-io/raydium-sdk-v2";

import { Liquidity, SPL_ACCOUNT_LAYOUT } from '@raydium-io/raydium-sdk';
// const {makeCreateMarketInstruction} = require('@raydium-io/raydium-sdk-v2');

import { TOKEN_PROGRAM_ID, createBurnInstruction } from '@solana/spl-token';

// const connection = new Connection("https://mainnet.helius-rpc.com/?api-key=e2090957-8cc3-44ab-bb60-82985d36cad5");
const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=e2090957-8cc3-44ab-bb60-82985d36cad5', 'processed');


const { getAssociatedTokenAddressSync } = require("@solana/spl-token");
// const {PublicKey} = require("@solana/web3.js");



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
        let marketInfo = await MarketInfo.find({ projectId });
        marketInfo = marketInfo[marketInfo.length - 1];
        const marketId = new PublicKey(marketInfo.marketInfo.id);
        const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=e2090957-8cc3-44ab-bb60-82985d36cad5', 'processed');
        const baseMint = new PublicKey(marketInfo.marketInfo.baseMint);
        const quoteMint = new PublicKey(marketInfo.marketInfo.quoteMint);


        const baseDecimals = SPL_MINT_LAYOUT.decode((await connection.getAccountInfo(baseMint)).data).decimals;
        const quoteDecimals = 9;
        const freshPoolKeys = await getPoolKeys(connection, baseMint, quoteMint, baseDecimals, quoteDecimals, marketId);

        const tokenAccount = await getOrCreateAssociatedTokenAccount(connection, owner, freshPoolKeys.lpMint, owner);

        const burnInstruction = createBurnInstruction(tokenAccount.address, tokenAccount.mint, tokenAccount.owner, tokenAccount.amount);
        const txn = await buildUnsignedTransaction(owner, [burnInstruction]);
        const baseData = { txn: txn.serialize() }

        console.log(burnInstruction);
        //console.log("Base Data" + baseData);
        return NextResponse.json(baseData, { status: 200 });
    }

    catch (error) {
        console.log(error)
        return NextResponse.json(error, { status: 400 });

    }
}