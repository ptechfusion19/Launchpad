import { PublicKey,SystemProgram, TransactionMessage, VersionedTransaction,Keypair, Connection, AddressLookupTableProgram } from "@solana/web3.js";
import { getAssociatedTokenAddressSync, createCloseAccountInstruction, createTransferInstruction, createAssociatedTokenAccountInstruction, createSyncNativeInstruction } from "@solana/spl-token";
import { Liquidity, MarketV2, MAINNET_PROGRAM_ID, MARKET_STATE_LAYOUT_V2 } from "@raydium-io/raydium-sdk";
import { jito_executeAndConfirm, getJitoTipInstruction } from "@/app/jito";
import bs58 from "bs58";
const transferSolInstruction = async (from_wallet, to_wallet, lamports) => {
    return SystemProgram.transfer({ fromPubkey: from_wallet, toPubkey: to_wallet, lamports: lamports })
}

async function prepareTransferAndCloseAccountInstruction(connection, senderPubkey, recipeintPubKey, mint) {
    const owner = senderPubkey;
    const associatedTokenSender = getAssociatedTokenAddressSync(mint, owner);
    const associatedSOLTokenSender = getAssociatedTokenAddressSync(new PublicKey("So11111111111111111111111111111111111111112"), owner);
    const associatedTokenAReciever = getAssociatedTokenAddressSync(mint, recipeintWallet);
    const balance = getTokenBalanceWeb3(connection, associatedTokenSender);
    const transferInstruction = createTransferInstruction(associatedTokenSender, associatedTokenAReciever, owner, balance);
    const mintCloseAccount = createCloseAccountInstruction(associatedTokenSender, owner, owner);
    const solCloseAccount = createCloseAccountInstruction(associatedSOLTokenSender, owner, owner);
    const lamports = Math.floor((0.00203928)*2*10**9);
    const transferSOLInstractiion = SystemProgram.transfer({
        fromPubkey: senderPubkey,
        toPubkey: recipeintPubKey,
        lamports: lamports,
    })
    return {instructions: [transferInstruction, mintCloseAccount, solCloseAccount, transferSOLInstractiion]}

}


export async function transferAllCoins(connection, distributorWallet, wallets, mint, recipient, poolKeys) {
    const payerWallet = distributorWallet;
    const mintPubKey = new PublicKey(mint);
    //console.log(payerWallet.secretKey);
    const recipeintPubKey = new PublicKey(recipient);
    const payer = Keypair.fromSecretKey(bs58.decode(payerWallet.privateKey));
    const associatedToken = getAssociatedTokenAddressSync(mint, owner);
    let accountInfo = await connection.getAccountInfo(associatedToken);
    let instructions = [];
    let ataCheck = 0;
    if (!accountInfo) {
        const mintATAIns = createAssociatedTokenAccountInstruction(
            payer,
            associatedToken,
            recipeintPubKey,
            mintPubKey
        );    
        instructions.push(mintATAIns);
        ataCheck+=1;
    };
    const wsolATA = getAssociatedTokenAddressSync(new PublicKey("So11111111111111111111111111111111111111112"), owner);
    accountInfo =  await connection.getAccountInfo(wsolATA);
    if (!accountInfo) {
        const mintATAIns = createAssociatedTokenAccountInstruction(
            payer,
            associatedToken,
            recipeintPubKey,
            mintPubKey
        );    
        instructions.push(mintATAIns);
        ataCheck+=1;
    };
    let signers = [];
    for (let i = 0; i < wallets.length; i++) {
        const wallet = Keypair.fromSecretKey(bs58.decode(wallets[i].privateKey));
        const closeInstructions = await prepareTransferAndCloseAccountInstruction(connection, wallet.publicKey, recipeintPubKey, mintPubKey)
        instructions.push(...closeInstructions.instructions);
        signers.push(wallet);
    }
    const swapInstruction = await makeSellSwapInstructions(recipeintPubKey, poolKeys, connection, associatedToken, wsolATA);
    const solCloseAccount = createCloseAccountInstruction(wsolATA, recipeintPubKey, recipeintPubKey);
    const mintCloseAccount = createCloseAccountInstruction(associatedToken,recipeintPubKey, recipeintPubKey);
    const swapTxInstructions = [swapInstruction, solCloseAccount, mintCloseAccount];
    const transferAndCloseInstructions = instructions;

    return {swap: swapTxInstructions, transferAndClose: transferAndCloseInstructions, signers: signers, ataCheck: ataCheck};
}


export const createLookupTableInstruction = async (connection, feePayer, owner) => {
    // Step 1 - Get a lookup table address and create lookup table instruction
    const [lookupTableInst, lookupTableAddress] =
        AddressLookupTableProgram.createLookupTable({
            authority: owner,
            payer: feePayer,
            recentSlot: await connection.getSlot(),
        });

    // Step 2 - Log Lookup Table Address
    // console.log("Lookup Table Address:", lookupTableAddress.toBase58());
    return { instruction: lookupTableInst, address: lookupTableAddress };
}

export const extendLookupTableInstruction = async (feePayer, owner, lookupTableAddress, addresses) => {
    const addAddressesInstruction = AddressLookupTableProgram.extendLookupTable({
        payer: feePayer,
        authority: owner,
        lookupTable: lookupTableAddress,
        addresses: [
            ...addresses
        ],
    });
    return { instruction: addAddressesInstruction };
}

export const deactivateLookupTableInstruction = async (owner, lookupTableAddress) => {
    const deactivateAddressesInstruction = AddressLookupTableProgram.deactivateLookupTable({
        authority: owner,
        lookupTable: lookupTableAddress
    });
    return { instruction: deactivateAddressesInstruction };
}


export const closeLookupTableInstruction = async (owner, lookupTableAddress) => {
    const closeAddressesInstruction = AddressLookupTableProgram.closeLookupTable({
        authority: owner,
        lookupTable: lookupTableAddress,
        recipient: owner
    });
    return { instruction: closeAddressesInstruction };
}

export const buildUnsignedTransaction = async (connection, feePayer, instructionss) => {

    const lastestBlockhash = (await connection.getLatestBlockhash());
    const txnMessage = new TransactionMessage({
        payerKey: feePayer,
        recentBlockhash: lastestBlockhash.blockhash,
        instructions: [
            ...instructionss
        ],
    });
    // //console.log(txnMessage);
    return new VersionedTransaction(txnMessage.compileToV0Message());
}


export const buildUnsignedTransactionwithLookup = async (connection, feePayer, instructionss, lookupTable) => {

    const lastestBlockhash = (await connection.getLatestBlockhash());
    const txnMessage = new TransactionMessage({
        payerKey: feePayer,
        recentBlockhash: lastestBlockhash.blockhash,
        instructions: [
            ...instructionss
        ],
    });
    // //console.log(txnMessage);
    return new VersionedTransaction(txnMessage.compileToV0Message([lookupTable]));
}

const prepareWalletPreSwapInstruction = async (recipeintWallet, payer, mint, lamports) => {

    const owner = recipeintWallet;
    const mintWSOL = new PublicKey("So11111111111111111111111111111111111111112");
    const associatedSolToken = getAssociatedTokenAddressSync(mintWSOL, owner);
    const associatedToken = getAssociatedTokenAddressSync(mint, owner);

    const mintATAIns = createAssociatedTokenAccountInstruction(
        payer,
        associatedToken,
        owner,
        mint
    )

    const solATAIns = createAssociatedTokenAccountInstruction(
        payer,
        associatedSolToken,
        owner,
        mintWSOL
    )
    const solTransferIns = SystemProgram.transfer({
        fromPubkey: payer,
        toPubkey: associatedSolToken,
        lamports: lamports,
    })
    // //console.log(solTransferIns.keys);
    const syncIns = createSyncNativeInstruction(associatedSolToken)
    // //console.log(mintATAIns, solATAIns, solTransferIns, syncIns);
    return { mintATA: associatedToken, solATA: associatedSolToken, instructions: [mintATAIns, solATAIns, solTransferIns, syncIns] }
}


export const prepareWallets = async (connection, distributorWallet, wallets, mint) => {
    console.log(mint, "prepareWallets___mint");
    const jitoResponses = []
    const payerWallet = distributorWallet;
    const mintPubKey = new PublicKey(mint);
    //console.log(payerWallet.secretKey);
    const payer = Keypair.fromSecretKey(bs58.decode(payerWallet.privateKey));
    let instructions = [];
    let tx;
    let walletTest;
    let accountInfo;
    for (let i = 0; i < wallets.length; i++) {
        const wallet = Keypair.fromSecretKey(bs58.decode(wallets[i].privateKey));
        const walletInstruction = await prepareWalletPreSwapInstruction(wallet.publicKey, payer.publicKey, mintPubKey, wallets[i].lamports);
        // // console.log(walletInstruction);
        walletTest = walletInstruction.mintATA;
            accountInfo = await connection.getAccountInfo(walletTest);
            if (accountInfo) {
                continue;
            }
        instructions.push(...walletInstruction.instructions);
        
        

        // for (i=0; i<walletInstruction.instructions.length; i++) {
        //     //console.log(walletInstruction.instructions[i].keys);
        // }
        if (instructions.length >= 12) {
            const tipInst = await getJitoTipInstruction(payer.publicKey, 0.001);
            instructions.push(tipInst);
            tx = await buildUnsignedTransaction(connection, payer.publicKey, instructions);
            tx.sign([payer]);
            // const jitoResp = await jito_executeAndConfirm(connection, [tx], payer, 0.001, true);
            const jitoResp = await jito_executeAndConfirm(connection, [tx], payer, 0.001, false);
            if (jitoResp.confirmed) {
                jitoResponses.push(jitoResp);
                instructions = [];
            }
        }

    }
    if (instructions.length >= 0) {
        const tipInst = await getJitoTipInstruction(payer.publicKey, 0.001);
        instructions.push(tipInst);
        tx = await buildUnsignedTransaction(connection, payer.publicKey, instructions);
        tx.sign([payer]);
        // const jitoResp = await jito_executeAndConfirm(connection, [tx], payer, 0.001, true);
        const jitoResp = await jito_executeAndConfirm(connection, [tx], payer, 0.001, false);
        jitoResponses.push(jitoResp);
        instructions = [];
    }
    return jitoResponses;

}


export const getPoolKeys = async (connection, baseMint, quoteMint, baseDecimals, quoteDecimals, marketId) => {
    console.log(connection, baseMint, quoteMint, baseDecimals, quoteDecimals, marketId, "We are necessary")
    let poolKeys = Liquidity.getAssociatedPoolKeys({ marketId: marketId, version: 4, marketVersion: 3, baseMint: baseMint, quoteMint: quoteMint, baseDecimals: baseDecimals, quoteDecimals: quoteDecimals, programId: MAINNET_PROGRAM_ID.AmmV4, marketProgramId: MAINNET_PROGRAM_ID.OPENBOOK_MARKET })
    const marketInfo = await connection.getAccountInfoAndContext(marketId);
    const marketData = MARKET_STATE_LAYOUT_V2.decode(marketInfo.value.data);
    const modifiedMarketData = {
        marketBids: marketData.bids,
        marketAsks: marketData.asks,
        marketEventQueue: marketData.eventQueue,
        marketBaseVault: marketData.baseVault,
        marketQuoteVault: marketData.quoteVault
    }
    const minAmountOut = 1;
    poolKeys = { ...modifiedMarketData, ...poolKeys }
    console.log(poolKeys, "we are pool keys")
    return poolKeys
}


export const makeSwapInstructions = async (owner, poolKeys, amountIn, mintATokenAccount, mintBTokenAccount) => {
    const minAmountOut = 1;
    const userKeys = { tokenAccountIn: mintBTokenAccount, tokenAccountOut: mintATokenAccount, owner: owner };
    const swapInstruction = Liquidity.makeSwapFixedInInstruction({ poolKeys, userKeys, amountIn, minAmountOut }, 4);
    return swapInstruction.innerTransaction.instructions[0];
}


export const makeSellSwapInstructions = async (owner, poolKeys, connection, tokenInTokenAccount, tokenOutTokenAccount) => {
    const minAmountOut = 1;
    const balance = await getTokenBalanceWeb3(connection, tokenInTokenAccount);
    const userKeys = {tokenAccountIn: tokenInTokenAccount, tokenAccountOut: tokenOutTokenAccount, owner: owner};
    const swapInstruction = Liquidity.makeSwapFixedInInstruction({ poolKeys, userKeys, balance, minAmountOut }, 4);
    return swapInstruction.innerTransaction.instructions[0];
}


export const prepareSwapTxs = async (connection, distributorWallet, wallets, poolKeys) => {
    const payerWallet = distributorWallet;
    const payer = Keypair.fromSecretKey(bs58.decode(payerWallet.privateKey));

    const transactions = [];
    let instructions = [];
    let keys = [];

    let signers = [];
    let tx;
    for (let i = 0; i < wallets.length - 1; i++) {
        const wallet = Keypair.fromSecretKey(bs58.decode(wallets[i].privateKey));
        const coinATA = new PublicKey(wallets[i].coinATA);
        const solATA = new PublicKey(wallets[i].solATA);
        // console.log(wallet.publicKey, poolKeys, wallet.lamports, coinATA, solATA);
        // console.log(wallet);
        console.log(wallets[i]);
        const swapInstruction = await makeSwapInstructions(wallet.publicKey, poolKeys, wallets[i].lamports, coinATA, solATA);
        console.log(swapInstruction);
        instructions.push(swapInstruction);
        signers.push(wallet);
        keys.push(...swapInstruction.keys);
        // if (instructions.length==8) {
        //    tx = await buildUnsignedTransaction(connection, payer.publicKey, instructions);
        //     console.log("Transaction size:", tx.serialize().length); 
        //    tx.sign(signers);
        //    transactions.push(tx);
        //    instructions = []
        //    signers = [payer];
        // }

    }
    // if (instructions.length>=0) {
    //     tx = await buildUnsignedTransaction(connection, payer.publicKey, instructions);
    //     tx.sign(signers);
    //     transactions.push(tx);
    //     instructions = []
    //     signers = [payer];
    //  }
    return { instructions: instructions, keys: keys, signers: signers };
}  


async function getTokenBalanceWeb3(connection, tokenAccount) {    
    const info = await connection.getTokenAccountBalance(tokenAccount);    
    if (info.value.uiAmount == null) throw new Error('No balance found');    
    console.log('Balance (using Solana-Web3.js): ', info.value.uiAmount);    
    return info.value.amount ;
}




export const prepareSellTxs = async (connection, distributorWallet, wallets, poolKeys) => {
    const payerWallet = distributorWallet;
    const payer = Keypair.fromSecretKey(bs58.decode(payerWallet.privateKey));

    const transactions = [];
    let instructions = [];
    let keys = [];
    let tokenBalance;
    let signers = [];
    let tx;
    for (let i = 0; i < wallets.length - 1; i++) {
        const wallet = Keypair.fromSecretKey(bs58.decode(wallets[i].privateKey));
        const coinATA = new PublicKey(wallets[i].coinATA);
        const solATA = new PublicKey(wallets[i].solATA);
        
        
        tokenBalance = await getTokenBalanceWeb3(connection, coinATA);
        const swapInstruction = await makeSwapInstructions(wallet.publicKey, poolKeys, tokenBalance, solATA, coinATA);
        // console.log(swapInstruction);
        instructions.push(swapInstruction);
        signers.push(wallet);
        keys.push(...swapInstruction.keys);
        // if (instructions.length==8) {
        //    tx = await buildUnsignedTransaction(connection, payer.publicKey, instructions);
        //     console.log("Transaction size:", tx.serialize().length); 
        //    tx.sign(signers);
        //    transactions.push(tx);
        //    instructions = []
        //    signers = [payer];
        // }

    }
    // if (instructions.length>=0) {
    //     tx = await buildUnsignedTransaction(connection, payer.publicKey, instructions);
    //     tx.sign(signers);
    //     transactions.push(tx);
    //     instructions = []
    //     signers = [payer];
    //  }
    return { instructions: instructions, keys: keys, signers: signers };
}  