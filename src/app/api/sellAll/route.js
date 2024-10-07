import { NextResponse } from 'next/server';
import connectDB from '@/config/database';
import LaunchSettings from '../../../models/launchSettingsModel';
// import Wallet from '../../../models/walletModel';
import User from '../../../models/userModel';
import { getJitoTipInstruction, jito_executeAndConfirm } from "@/app/jito";
import { transferAllCoins, getPoolKeys, buildUnsignedTransaction } from "@/app/utils";
import MarketInfo from "../../../models/marketInfoModel"
// const solanaWeb3 = require('@solana/web3.js');
import { Connection, TransactionMessage, VersionedTransaction, TransactionInstruction } from "@solana/web3.js";
import { PublicKey, Keypair } from '@solana/web3.js';
import { CurrencyAmount, Currency, Token, TokenAmount, PoolInfoLayout, SPL_MINT_LAYOUT } from '@raydium-io/raydium-sdk';
import Wallet from "@/models/walletModel";
import bs58 from "bs58";
// import { i } from '@raydium-io/raydium-sdk-v2/lib/raydium-a023305c';

// const connection = new Connection("https://mainnet.helius-rpc.com/?api-key=e2090957-8cc3-44ab-bb60-82985d36cad5");
const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=e2090957-8cc3-44ab-bb60-82985d36cad5', 'processed');









export async function POST(req) {
    const {  projectId, userId  } = await req.json();
    
    // try {
        await connectDB();
        const project = await LaunchSettings.findOne({
            projectId: projectId
        });
        const user = await User.findById(project.userId);
        let mint = project.mint;
        const owner = new PublicKey(user.walletAddress);
        
        const distributorWallet = await Wallet.findOne({
            projectId: projectId,
            lamports: 0
          });
        
          const distKeypair = Keypair.fromSecretKey(bs58.decode(decryptPrivateKey(distributorWallet.privateKey)));
        
          const wallets = await Wallet.find({
            projectId: projectId,
            lamports: { $gt: 0 }
          });


        let marketInfo = await MarketInfo.find({ projectId });
        marketInfo = marketInfo[marketInfo.length-1];
        const marketId = new PublicKey(marketInfo.marketInfo.id);
        const baseMint = new PublicKey(marketInfo.marketInfo.baseMint);
        const quoteMint = new PublicKey(marketInfo.marketInfo.quoteMint);
        // console.log(baseMint , quoteMint , "we are m,ints")
        
        const baseDecimals = SPL_MINT_LAYOUT.decode((await connection.getAccountInfo(baseMint)).data).decimals;
        const quoteDecimals = 9;
        const freshPoolKeys = await getPoolKeys(connection, baseMint, quoteMint, baseDecimals, quoteDecimals, marketId);

        const allInstructions = await transferAllCoins(connection, distributorWallet, wallets, mint, user.walletAddress, freshPoolKeys);
        // const bundles = allInstructions.bundles;
        // console.log(bundles.length);
        // for (let i=0; i<bundles.length; i++) {
        //     const jitoResp = await jito_executeAndConfirm(connection, bundles[i], distKeypair.publicKey, 0.0001, false);
        //     console.log(jitoResp);
        // }

        const swapTx = await buildUnsignedTransaction(connection, owner, allInstructions.swap);

        return NextResponse.json({txn: swapTx.serialize()}, { status: 200 });
    // } 
    // catch (error) {
    //     console.error('Error In Uploading MetaData', error);
    //     return NextResponse.json({ error: 'Error In Uploading MetaData' }, { status: 500 });
    // }
}