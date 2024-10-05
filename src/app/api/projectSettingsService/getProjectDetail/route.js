


import { NextResponse } from 'next/server';
import LaunchSettings from '../../../../models/launchSettingsModel';
// import Wallet from '../../../../models/walletModel';
import User from '../../../../models/userModel';
import { SystemProgram, VersionedMessage } from '@solana/web3.js';
import { MemoTransferInstruction } from '@solana/spl-token';
// const { getMint } = require("@solana/spl-token");
// import { getMint } from '@solana/spl-token';
import { getMint } from '@solana/spl-token';
import Wallet from '../../../../models/walletModel';
import PoolKey from "../../../../models/poolKeysModel"
import MarketInfo from "../../../../models/marketInfoModel"
// const BigNumber = require('bignumber.js');
import BigNumber from "bignumber.js"
import { AMM_V4, Raydium } from "@raydium-io/raydium-sdk-v2";
import connectDB from '../../../../config/database';
// const solanaWeb3 = require('@solana/web3.js');
import { Connection, TransactionMessage, VersionedTransaction, TransactionInstruction } from "@solana/web3.js";
import * as solanaWeb3 from '@solana/web3.js'
// const { makeCreateMarketInstruction } = require('@raydium-io/raydium-sdk-v2');
// const BN = require("bn.js");
// const createCsvWriter = require('csv-writer').createObjectCsvWriter;
// import createCsvWriter from "csv-writer";
// const fs = require('fs');
import fs from "fs"
// const {PublicKey, Keypair} = require('@solana/web3.js');
// import { PublicKey, Keypair } from '@solana/web3.js';
import { PublicKey, Keypair } from '@solana/web3.js';
// const BN = require("bn.js");
import BN from "bn.js"
import { CurrencyAmount, Currency, Token, PoolInfoLayout } from '@raydium-io/raydium-sdk';

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

// const connection = new Connection("https://mainnet.helius-rpc.com/?api-key=e2090957-8cc3-44ab-bb60-82985d36cad5");
// const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=aa012b11-cafb-4f4a-8944-ef9dec5172b0', 'processed');
const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=e2090957-8cc3-44ab-bb60-82985d36cad5', 'processed');


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
const saveObjectToFile = async (obj, filename) => {
    const jsonContent = JSON.stringify(obj, null, 2); // Convert object to JSON string with pretty print
    fs.writeFile(filename, jsonContent, 'utf8', (err) => {
        if (err) {
            console.error("An error occurred while writing JSON Object to File.", err);
        } else {
            //console.log("JSON file has been saved.");
        }
    });
}
const makeTxVersion = TxVersion.V0; // LEGACY

const xWeiAmount = (amount, decimals) => {
    return new BN(new BigNumber(amount.toString() + "e" + decimals.toString()).toFixed(0));
};


const logMemo =  async (message, payerPubkey) => {  
    
    const memoInstruction = new TransactionInstruction({
          keys: [{ pubkey: payerPubkey, isSigner: true, isWritable: true }],
          data: Buffer.from(message, "utf-8"),
          programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
        })
    
    return memoInstruction;

    }

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

const addLiquidity = async (walletPublicKey, payer, marketIdString, mintString, tokenAmount, solAmount) => {
    //console.log(walletPublicKey, payer, marketIdString, mintString, tokenAmount, solAmount)
    console.log(walletPublicKey, payer, marketIdString, mintString, tokenAmount, solAmount);
    const mint = new PublicKey(mintString);
    //console.log(mint, connection, "I am a new mint")
    const mintInfo = await getMint(connection, mint);
    //console.log(mintInfo.decimals, mint, TOKEN_PROGRAM_ID, "I am lower mint")

    const baseToken = new Token(TOKEN_PROGRAM_ID, mint, mintInfo.decimals);
    // //console.log(baseToken, "I am best mint")

    const quoteToken = new Token(TOKEN_PROGRAM_ID, "So11111111111111111111111111111111111111112", 9, "WSOL", "WSOL");
    // //console.log(quoteToken, "I am mint")

    // //console.log(mint, mintInfo, baseToken, quoteToken , "We are tokens")
    // const accounts = await Market.findAccountsByMints(connection, baseToken.mint, quoteToken.mint, OPEN_BOOK_PROGRAM);
    // if (accounts.length === 0) {
    //     //console.log("Not found OpenBook market!");
    //     return;
    // }

    const marketId = new PublicKey(marketIdString);
    // const baseAmount = xWeiAmount(tokenAmount, mintInfo.decimals);
    
    const baseAmount = new BN(tokenAmount).mul(new BN(10).pow(new BN(mintInfo.decimals)));
    const quoteAmount = new BN(solAmount.toFixed(9).replace('.', ''));
    console.log(baseAmount, quoteAmount);
    const walletTokenAccounts = await getWalletTokenAccount(connection, walletPublicKey);
    //console.log(walletTokenAccounts, "WALLLLETTSTTSSSTTSTTTS")
    const startTime = Math.floor(Date.now() / 1000);
    
    const { innerTransactions, address } = await Liquidity.makeCreatePoolV4InstructionV2Simple({
        connection,
        programId: AMM_V4,
        marketInfo: {
            marketId: marketId,
            programId: OPEN_BOOK_PROGRAM,
        },
        baseMintInfo: baseToken,
        quoteMintInfo: quoteToken,
        baseAmount: baseAmount,
        quoteAmount: quoteAmount,
        startTime: new BN(startTime),
        ownerInfo: {
            feePayer: payer,
            wallet: payer,
            tokenAccounts: walletTokenAccounts,
            useSOLBalance: true,
        },
        associatedOnly: false,
        checkCreateATAOwner: true,
        makeTxVersion: makeTxVersion,
        feeDestinationId: new PublicKey("7YttLkHDoNj9wyDur5pM1ejNaAvT9X4eqaYcHQqtj2G5"), // only mainnet use this
    })
    // console.log(innerTransactions[0].instructions);
    const liqInstructions = innerTransactions[0].instructions;
    // const dataLayout = struct([u82("instruction"), u82("nonce"), u64("openTime"), u64("pcAmount"), u64("coinAmount")]);
    // console.log(`Total number of inner txs: ${innerTransactions.length}`);
    
    // for (let i = 0; i < liqInstructions.length; i++) {
    //     console.log(`===========================(${i + 1})===========================`);
        
    //     // Log the Program ID
    //     console.log(`ProgramId: ${liqInstructions[i].programId.toString()}`);
        
    //     // Log the Keys with relevant information
    //     console.log('Keys:');
    //     liqInstructions[i].keys.forEach((key, index) => {
    //         console.log(`  Key ${index + 1}:`);
    //         console.log(`    PublicKey: ${key.pubkey.toString()}`);
    //         console.log(`    IsSigner: ${key.isSigner}`);
    //         console.log(`    IsWritable: ${key.isWritable}`);
    //         if (i==2) {
    //             console.log(liqInstructions[i].data);
    //         }
    //     });
        
    //     // Log the Data in a more readable format (convert buffer to hex or array)
    //     console.log(`Data: ${liqInstructions[i].data.toString('hex')}`); // If you want hex representation
    // }
    //console.log("wukdgegrufnergfrufnr", { poolKeys: address, liqInstructions: liqInstructions })
    return { poolKeys: address, liqInstructions: liqInstructions };
}

const generateWallet = (mint) => {
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
function fetchMarketInfo({
    wallet,
    dexProgramId,
    baseInfo,
    quoteInfo,
    lotSize,
    tickSize,
    requestQueueSpace,
    eventQueueSpace,
    orderbookQueueSpace,
}) {
    // const dexProgramId = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
    const market = generatePubKey({ fromPublicKey: wallet, programId: dexProgramId });
    // //console.log(market.publicKey);
    // //console.log(market.publicKey.toBuffer());
    // const market = new PublicKey("H5bWMkEHydCU1ZHnTQAEuszRhr5w1zHZThJz9jKNFXKW");
    const requestQueue = generatePubKey({ fromPublicKey: wallet, programId: dexProgramId });
    const eventQueue = generatePubKey({ fromPublicKey: wallet, programId: dexProgramId });
    const bids = generatePubKey({ fromPublicKey: wallet, programId: dexProgramId });
    const asks = generatePubKey({ fromPublicKey: wallet, programId: dexProgramId });
    const baseVault = generatePubKey({ fromPublicKey: wallet, programId: TOKEN_PROGRAM_ID });
    const quoteVault = generatePubKey({ fromPublicKey: wallet, programId: TOKEN_PROGRAM_ID });
    const feeRateBps = 0;
    const quoteDustThreshold = new BN(100);

    function getVaultOwnerAndNonce() {
        const vaultSignerNonce = new BN(0);
        // //console.log(market.toBuffer());
        while (true) {
            try {
                // //console.log(market);
                const marketBuffer = market.publicKey.toBuffer();
                // //console.log(marketBuffer);
                // //console.log(dexProgramId);
                const vaultOwner = PublicKey.createProgramAddressSync(
                    [marketBuffer, vaultSignerNonce.toArrayLike(Buffer, "le", 8)],
                    dexProgramId,
                );
                // //console.log(`Vault Owner: ${vaultOwner.toBase58()}, Nonce (Decimal): ${vaultSignerNonce.toString(10)}`);
                return { vaultOwner, vaultSignerNonce };
            } catch (e) {
                // console.error(`Nonce ${vaultSignerNonce.toString(10)} failed`);
                // //console.log(e);
                vaultSignerNonce.iaddn(1);
                if (vaultSignerNonce.gt(new BN(25555))) throw Error("find vault owner error");
            }
        }
    }

    // return
    const { vaultOwner, vaultSignerNonce } = getVaultOwnerAndNonce();
    const baseLotSize = new BN(Math.round(10 ** baseInfo.decimals * lotSize));
    const quoteLotSize = new BN(Math.round(lotSize * 10 ** quoteInfo.decimals * tickSize));

    if (baseLotSize.eq(new BN(0))) throw Error("lot size is too small");
    if (quoteLotSize.eq(new BN(0))) throw Error("tick size or lot size is too small");

    return {
        programId: dexProgramId,
        id: market,
        baseMint: baseInfo.mint,
        quoteMint: quoteInfo.mint,
        baseVault,
        quoteVault,
        vaultOwner,
        requestQueue,
        eventQueue,
        bids,
        asks,
        feeRateBps,
        quoteDustThreshold,
        vaultSignerNonce,
        baseLotSize,
        quoteLotSize,
        requestQueueSpace,
        eventQueueSpace,
        orderbookQueueSpace,
    };
}



const createMarket = async (walletPublicKeyStr, mintString, mintDecimals) => {
    const EVENT_QUEUE_ITEMS = 128; // Default: 2978
    const REQUEST_QUEUE_ITEMS = 63; // Default: 63
    const ORDERBOOK_ITEMS = 223; // Default: 909
    let eventQueueSpace = EVENT_QUEUE_ITEMS * 88 + 44 + 48;
    // //console.log(eve)
    let requestQueueSpace = REQUEST_QUEUE_ITEMS * 80 + 44 + 48;
    let orderbookQueueSpace = ORDERBOOK_ITEMS * 80 + 44 + 48;

    // eventQueueSpace = await connection.getMinimumBalanceForRentExemption(eventQueueSpace);
    // requestQueueSpace = await connection.getMinimumBalanceForRentExemption(requestQueueSpace);
    // orderbookQueueSpace = await connection.getMinimumBalanceForRentExemption(orderbookQueueSpace);

    const wallet = new PublicKey(walletPublicKeyStr);
    const baseInfo = {
        mint: new PublicKey(mintString),
        decimals: mintDecimals
    };

    const quoteInfo = {
        mint: new PublicKey("So11111111111111111111111111111111111111112"),
        decimals: 9
    };
    const tickSize = 0.0001;
    const lotSize = 1;
    const OPENBOOK_MARKET = OPEN_BOOK_PROGRAM;
    // //console.log(OPENBOOK_MARKET);
    const marketInfo = fetchMarketInfo({ wallet, dexProgramId: OPENBOOK_MARKET, baseInfo, quoteInfo, tickSize, lotSize, requestQueueSpace, eventQueueSpace, orderbookQueueSpace })
    //console.log(marketInfo, "I am merket");
    const marketInstructions = await makeCreateMarketInstruction({ connection, wallet, marketInfo });
    //console.log("wejhg", marketInstructions)
    const createMarketInstructions = [];
    marketInstructions.forEach(instruction => {
        createMarketInstructions.push(instruction.transaction.instructions);
    });

    //console.log(createMarketInstructions.length);

    return { marketInfo: marketInfo, instructionsArray: createMarketInstructions };


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
const calculatePercentages = (inputNumber) => {
    // The list of percentages from the "New Distribution"
    const percentages = [
        0.10, 0.20, 0.30, 0.40, 0.55, 0.75, 1.18, 1.61, 2.04,
        2.47, 2.90, 3.33, 3.83, 4.33, 4.83, 5.33, 5.83, 6.43,
        7.03, 7.63, 8.23, 9.03, 10.00, 11.67
    ];

    // Calculate each percentage of the input number and store in an array
    const result = percentages.map(percent => (percent / 100) * inputNumber * 10 ** 9);

    return result;
}

// import BN from 'bn.js';
function convertPublicKeysToStrings(input) {
    const output = {};
    
    // Loop through the input object's keys
    for (const key in input) {
      if (input[key] instanceof PublicKey) {
        // Convert each PublicKey object to a string
        output[key] = input[key].toString();
      }
      else if (input[key].publicKey) {
        output[key] = input[key].publicKey.toString();

      }
      else if (input[key] instanceof BN) {
        output[key] = input[key].toString();
      }
      else {
        output[key] = input[key];
      }
    }
  
    return output;
  }


  function convertToBigNumber(bnObject) {
    return bnObject.toString();  // Replace this with actual big number handling logic
}

// Mock function to convert public key placeholder to an actual public key string
function convertToPublicKey(pkObject) {
    return pkObject.toString();  // Replace this with actual public key handling logic
}

function traverseAndConvertFields(obj) {
    for (let key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            // Check for big number type field
            if (obj[key]._bn) {
                obj[key] = convertToBigNumber(obj[key]._bn);
            }
            // Check for public key type field
            else if (obj[key].publicKey) {
                obj[key].publicKey = convertToPublicKey(obj[key].publicKey);
            } else {
                // Recursively handle nested objects
                traverseAndConvertFields(obj[key]);
            }
        }
    }
}

const prepareTestTxs = async (walletPubkeyStr) => {
    
    const jitofee_sol = 0.0001;
    const walletPubkey = new PublicKey(walletPubkeyStr);
    const transactions = [];
    for (let i=0; i<3; i++) {
        const logInstr = await logMemo(`This is a test message # ${i+1}`, walletPubkey);
        const instructions = []
        if (i==0) {
            const tipIns = await getJitoTipInstruction(walletPubkey, jitofee_sol);
            instructions.push(tipIns);
        }
        instructions.push(logInstr);
        const latestBlockhash = await connection.getLatestBlockhash();
        const msg  = new TransactionMessage({
            payerKey: walletPubkey,
            recentBlockhash: latestBlockhash.blockhash,
            instructions: instructions
        }).compileToV0Message();
        const tx = new VersionedTransaction(msg);
        transactions.push(tx)
    }
    return {allTxs:transactions};
}


const prepareTxs = async (mint, walletPubkeyStr, tokenInitialLiquidity, solInitialLiquidity, snipeSolAmount, projectId) => {
    console.log("Hello", mint, walletPubkeyStr, tokenInitialLiquidity, solInitialLiquidity, snipeSolAmount);
    // const prepareTxs = async (mintString, walletPubkeyStr) => {
    const jitofee_sol = 0.001;
    const ownerPubkey = new PublicKey(walletPubkeyStr);
    const mintPubKey = new PublicKey(mint);
    const mintInfo = await getMint(connection, mintPubKey)
    const mintDecimals = mintInfo.decimals;
    console.log(mintDecimals);
    const allTransactionsArray = [];
    // const allLamports = calculatePercentages(snipeSolAmount - 0.3);
    const snipeSolLamports = parseInt(snipeSolAmount * 10 ** 9);
    //  all wallets from DB
    const allWallets = await Wallet.find({
        projectId: projectId,
        lamports: { $gt: 0 }
      });
    // console.log(allWallets, "All Wallets");
    // const allWallets = await generateWallet(25, mint, allLamports);
    const distributorWalllet = await Wallet.findOne({
        projectId: projectId,
        lamports: 0
      });
    
    
    const distributorWalletPubkey = new PublicKey(distributorWalllet.pubKey);

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


    // const stringifiedKey = "7yi3br1TxTVw1sLkqCJ25hsGgfwFrhDLTAzGoZZr7N4Z";
    
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
    const feeReceiver = new PublicKey("BWCuWKwCEi1SVz99UtdMMRT772n7YXkjJfBDbNfUqgRg");
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



export async function POST(req) {
    await connectDB();

    const { projectId, userId } = await req.json();
    //console.log("this is ", projectId, userId)
    try {
        const project = await LaunchSettings.findOne({
            projectId: projectId
        });
        const user = await User.findById(project.userId);
        let mint = project.mint;
        //console.log(project)
        // let walletPubkeyStr = user.walletAddress;
        let walletPubkeyStr = user.walletAddress;
        //console.log(userId, " I am a user")

        let tokenInitialLiquidity = project.amountTokens;
        let solInitialLiquidity = project.amountSol;
        let snipeSolAmount = project.amountSolForSnipping;
        const baseData = await prepareTxs(mint, walletPubkeyStr, tokenInitialLiquidity, solInitialLiquidity, snipeSolAmount, projectId);
        // const baseData = await prepareTestTxs(walletPubkeyStr);
        // const bs58EncodedTxs = await signTxsPhantom(baseData.allTxs);
        const  bs58EncodedTxs = await signTxsPhantom(baseData.allTxs);

        baseData.allTxs = bs58EncodedTxs;
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