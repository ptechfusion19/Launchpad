import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
  Keypair,
  Connection,
  AddressLookupTableProgram,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddressSync,
  createCloseAccountInstruction,
  createTransferInstruction,
  createAssociatedTokenAccountInstruction,
  createSyncNativeInstruction,
} from "@solana/spl-token";
import {
  Liquidity,
  MarketV2,
  MAINNET_PROGRAM_ID,
  MARKET_STATE_LAYOUT_V2,
} from "@raydium-io/raydium-sdk";
import { jito_executeAndConfirm, getJitoTipInstruction } from "@/app/jito";
import bs58 from "bs58";
import crypto from "crypto";

// require("dotenv").config();
const ENCRYPTION_KEY='13533654ea70c113a05271839da628e853a4041dca1439b52d26cd43d172fbcc'

const encryptionKey = ENCRYPTION_KEY;
const transferSolInstruction = async (from_wallet, to_wallet, lamports) => {
  return SystemProgram.transfer({
    fromPubkey: from_wallet,
    toPubkey: to_wallet,
    lamports: lamports,
  });
};

export function encryptPrivateKey(privateKey) {
  //   debugger;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(encryptionKey, "hex"),
    iv
  );

  let encrypted = cipher.update(privateKey, "utf8", "hex");
  encrypted += cipher.final("hex");

  return iv.toString("hex") + ":" + encrypted;
}

function generateEncryptionKey() {
  return crypto.randomBytes(32).toString("hex");
}

// const encryptionKey =  generateEncryptionKey();
// console.log('Generated Encryption Key:', encryptionKey);

export function decryptPrivateKey(encryptedPrivateKey) {
  const parts = encryptedPrivateKey?.split(":");
  const iv = Buffer.from(parts[0], "hex");
  const encryptedText = parts[1];
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(encryptionKey, "hex"),
    iv
  );

  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

// const encryptedPrivateKey = encryptPrivateKey(bs58PrivateKey, encryptionKey);
// console.log('Encrypted Private Key:', encryptedPrivateKey);

// const decryptedPrivateKey = decryptPrivateKey(encryptedPrivateKey, encryptionKey);

async function prepareTransferAndCloseAccountInstruction(
  connection,
  senderPubkey,
  recipeintPubKey,
  mint
) {
  const owner = senderPubkey;
  const associatedTokenSender = getAssociatedTokenAddressSync(mint, owner);
  const associatedSOLTokenSender = getAssociatedTokenAddressSync(
    new PublicKey("So11111111111111111111111111111111111111112"),
    owner
  );
  const associatedTokenAReciever = getAssociatedTokenAddressSync(
    mint,
    recipeintPubKey
  );
  const balance = await getTokenBalanceWeb3(connection, associatedTokenSender);
  const transferInstruction = createTransferInstruction(
    associatedTokenSender,
    associatedTokenAReciever,
    owner,
    balance
  );
  const mintCloseAccount = createCloseAccountInstruction(
    associatedTokenSender,
    owner,
    owner
  );
  const solCloseAccount = createCloseAccountInstruction(
    associatedSOLTokenSender,
    owner,
    owner
  );
  const lamports = Math.floor(0.00203928 * 2 * 10 ** 9);
  const transferSOLInstractiion = SystemProgram.transfer({
    fromPubkey: senderPubkey,
    toPubkey: recipeintPubKey,
    lamports: lamports,
  });
  // console.log(transferInstruction.keys);
  // console.log(mintCloseAccount.keys);
  // console.log(solCloseAccount.keys);
  // console.log(transferSOLInstractiion.keys);
  if (balance) {
    return {
      instructions: [
        transferInstruction,
        mintCloseAccount,
        solCloseAccount,
        transferSOLInstractiion,
      ],
      tokens: balance,
    };
  } else {
    return {
      instructions: [
        mintCloseAccount,
        solCloseAccount,
        transferSOLInstractiion,
      ],
      tokens: 0,
    };
  }
}
function displayInstructions(instructions) {
  instructions.forEach((instruction, index) => {
    console.log(`\nInstruction ${index + 1}:`);
    console.log("Program ID:", instruction.programId.toBase58());

    // Display the keys involved in the instruction
    console.log("Keys:");
    instruction.keys.forEach((keyObj, keyIndex) => {
      console.log(`  Key ${keyIndex + 1}:`);
      console.log(`    Pubkey: ${keyObj.pubkey.toBase58()}`);
      console.log(`    IsSigner: ${keyObj.isSigner}`);
      console.log(`    IsWritable: ${keyObj.isWritable}`);
    });

    // Display the data in hex or base64 format
    const dataHex = Buffer.from(instruction.data).toString("hex");
    console.log("Data (hex):", dataHex);

    // Optionally, show the base64 format of the data
    const dataBase64 = Buffer.from(instruction.data).toString("base64");
    console.log("Data (base64):", dataBase64);
  });
}

export async function transferAllCoins(
  connection,
  distributorWallet,
  wallets,
  mint,
  recipient,
  poolKeys,
  referralWallet
) {
  const payerWallet = distributorWallet;
  const mintPubKey = new PublicKey(mint);
  //console.log(payerWallet.secretKey);
  const recipeintPubKey = new PublicKey(recipient);
  const payer = Keypair.fromSecretKey(
    bs58.decode(decryptPrivateKey(payerWallet.privateKey))
  );
  const associatedToken = getAssociatedTokenAddressSync(
    mintPubKey,
    recipeintPubKey
  );

  let accountInfo = await connection.getAccountInfo(associatedToken);
  const jitoTipIns = await getJitoTipInstruction(payer.publicKey, 0.00001);
  let instructions = [jitoTipIns];
  let ataCheck = 0;
  // console.log(accountInfo);
  if (!accountInfo) {
    const mintATAIns = createAssociatedTokenAccountInstruction(
      payer.publicKey,
      associatedToken,
      recipeintPubKey,
      mintPubKey
    );
    instructions.push(mintATAIns);
    ataCheck += 1;
  }
  const wsolATA = getAssociatedTokenAddressSync(
    new PublicKey("So11111111111111111111111111111111111111112"),
    recipeintPubKey
  );

  accountInfo = await connection.getAccountInfo(wsolATA);
  // console.log(accountInfo);
  if (!accountInfo) {
    const mintATAIns = createAssociatedTokenAccountInstruction(
      payer.publicKey,
      wsolATA,
      recipeintPubKey,
      new PublicKey("So11111111111111111111111111111111111111112")
    );
    instructions.push(mintATAIns);
    ataCheck += 1;
  }
  let signers = [];
  let totalTokens = 0;

  let batchITxs = [];
  let batchIIns = [jitoTipIns];
  let tx;
  const bundles = [];

  for (let i = 0; i < wallets.length; i++) {
    const wallet = Keypair.fromSecretKey(
      bs58.decode(decryptPrivateKey(wallets[i].privateKey))
    );
    const closeInstructions = await prepareTransferAndCloseAccountInstruction(
      connection,
      wallet.publicKey,
      recipeintPubKey,
      mintPubKey
    );
    totalTokens += Number(closeInstructions.tokens);
    // console.log(closeInstructions.instructions);
    instructions.push(...closeInstructions.instructions);
    signers.push(wallet);

    if (instructions.length >= 12) {
      tx = await buildUnsignedTransaction(
        connection,
        payer.publicKey,
        instructions
      );
      tx.sign([payer, ...signers]);
      signers = [];
      batchITxs.push(tx);
      instructions = [jitoTipIns];
    }
    if (batchITxs.length == 5) {
      bundles.push(batchITxs);
      batchITxs = [];
    }
  }
  if (batchITxs) {
    bundles.push(batchITxs);
  }
  for (let i = 0; i < bundles.length; i++) {
    const jitoResp = await jito_executeAndConfirm(
      connection,
      bundles[i],
      payer.publicKey,
      0.0001,
      false
    );
    console.log(jitoResp);
  }
  const tokenBalance = await getTokenBalanceWeb3(connection, associatedToken);
  const swapInstruction = await makeSellSwapInstructions(
    recipeintPubKey,
    poolKeys,
    connection,
    associatedToken,
    wsolATA,
    tokenBalance
  );
  const solCloseAccount = createCloseAccountInstruction(
    wsolATA,
    recipeintPubKey,
    recipeintPubKey
  );
  const mintCloseAccount = createCloseAccountInstruction(
    associatedToken,
    recipeintPubKey,
    recipeintPubKey
  );
  const feeReceiver = new PublicKey(
    "FKPxdEdddxoSq1kUogEnbVnBKda15gxcRz4cDt9b3LAh"
  );
  const swapTxInstructions = [
    swapInstruction,
    solCloseAccount,
    mintCloseAccount
  ];
  let refFee = 0;
//   if (referralWallet) {
//       const refFeeReceiever = new PublicKey(referralWallet);
//       refFee = 0.25;
//       const refFeeInstruction = SystemProgram.transfer({ fromPubkey: pubkey, toPubkey: refFeeReceiever, lamports: refFee*10**9 });
//       swapTxInstructions.push(refFeeInstruction);
//   }


  const fee = 0.1 
  const platformFeeInstruction = SystemProgram.transfer({
    fromPubkey: recipeintPubKey,
    toPubkey: feeReceiver,
    lamports: fee * 10 ** 9,
  });
  swapTxInstructions.push(platformFeeInstruction);
  // instructions.push(platformFeeInstruction);

  const transferAndCloseInstructions = instructions;

  return {
    bundles: bundles,
    swap: swapTxInstructions,
    transferAndClose: transferAndCloseInstructions,
    signers: signers,
    ataCheck: ataCheck,
  };
}

export const createLookupTableInstruction = async (
  connection,
  feePayer,
  owner
) => {
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
};

export const extendLookupTableInstruction = async (
  feePayer,
  owner,
  lookupTableAddress,
  addresses
) => {
  const addAddressesInstruction = AddressLookupTableProgram.extendLookupTable({
    payer: feePayer,
    authority: owner,
    lookupTable: lookupTableAddress,
    addresses: [...addresses],
  });
  return { instruction: addAddressesInstruction };
};

export const deactivateLookupTableInstruction = async (
  owner,
  lookupTableAddress
) => {
  const deactivateAddressesInstruction =
    AddressLookupTableProgram.deactivateLookupTable({
      authority: owner,
      lookupTable: lookupTableAddress,
    });
  return { instruction: deactivateAddressesInstruction };
};

export const closeLookupTableInstruction = async (
  owner,
  lookupTableAddress
) => {
  const closeAddressesInstruction = AddressLookupTableProgram.closeLookupTable({
    authority: owner,
    lookupTable: lookupTableAddress,
    recipient: owner,
  });
  return { instruction: closeAddressesInstruction };
};

export const buildUnsignedTransaction = async (
  connection,
  feePayer,
  instructionss
) => {
  // const instructions = instructionss.map(item => {
  //     const updatedKeys = item.keys.map(key => {
  //         // Check if pubkey is a string, and convert it to PublicKey
  //         return {
  //             ...key,
  //             pubkey: typeof key.pubkey === 'string' ? new PublicKey(key.pubkey) : key.pubkey
  //         };
  //     });
  //     return new TransactionInstruction({
  //         keys: updatedKeys,
  //         data: item.data,
  //         programId: new PublicKey(item.programId) // Assuming programId is already a string or PublicKey object
  //     });
  // });
  const lastestBlockhash = await connection.getLatestBlockhash();
  const txnMessage = new TransactionMessage({
    payerKey: feePayer,
    recentBlockhash: lastestBlockhash.blockhash,
    instructions: [...instructionss],
  });
  // console.log(txnMessage);
  return new VersionedTransaction(txnMessage.compileToV0Message());
};

export const buildUnsignedTransactionwithLookup = async (
  connection,
  feePayer,
  instructionss,
  lookupTable
) => {
  const lastestBlockhash = await connection.getLatestBlockhash();
  const txnMessage = new TransactionMessage({
    payerKey: feePayer,
    recentBlockhash: lastestBlockhash.blockhash,
    instructions: [...instructionss],
  });
  // //console.log(txnMessage);
  return new VersionedTransaction(txnMessage.compileToV0Message([lookupTable]));
};

const prepareWalletPreSwapInstruction = async (
  recipeintWallet,
  payer,
  mint,
  lamports
) => {
  const owner = recipeintWallet;
  const mintWSOL = new PublicKey("So11111111111111111111111111111111111111112");
  const associatedSolToken = getAssociatedTokenAddressSync(mintWSOL, owner);
  const associatedToken = getAssociatedTokenAddressSync(mint, owner);

  const mintATAIns = createAssociatedTokenAccountInstruction(
    payer,
    associatedToken,
    owner,
    mint
  );

  const solATAIns = createAssociatedTokenAccountInstruction(
    payer,
    associatedSolToken,
    owner,
    mintWSOL
  );
  const solTransferIns = SystemProgram.transfer({
    fromPubkey: payer,
    toPubkey: associatedSolToken,
    lamports: lamports,
  });
  // //console.log(solTransferIns.keys);
  const syncIns = createSyncNativeInstruction(associatedSolToken);
  // //console.log(mintATAIns, solATAIns, solTransferIns, syncIns);
  return {
    mintATA: associatedToken,
    solATA: associatedSolToken,
    instructions: [mintATAIns, solATAIns, solTransferIns, syncIns],
  };
};

export const prepareWallets = async (
  connection,
  distributorWallet,
  wallets,
  mint
) => {
  console.log(mint, "prepareWallets___mint");
  const jitoResponses = [];
  const payerWallet = distributorWallet;
  const mintPubKey = new PublicKey(mint);
  //console.log(payerWallet.secretKey);
  const payer = Keypair.fromSecretKey(
    bs58.decode(decryptPrivateKey(payerWallet.privateKey))
  );
  let instructions = [];
  let tx;
  let walletTest;
  let accountInfo;
  for (let i = 0; i < wallets.length; i++) {
    const wallet = Keypair.fromSecretKey(
      bs58.decode(decryptPrivateKey(wallets[i].privateKey))
    );
    const walletInstruction = await prepareWalletPreSwapInstruction(
      wallet.publicKey,
      payer.publicKey,
      mintPubKey,
      wallets[i].lamports
    );
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
      tx = await buildUnsignedTransaction(
        connection,
        payer.publicKey,
        instructions
      );
      tx.sign([payer]);
      // const jitoResp = await jito_executeAndConfirm(connection, [tx], payer, 0.001, true);
      const jitoResp = await jito_executeAndConfirm(
        connection,
        [tx],
        payer,
        0.001,
        false
      );
      if (jitoResp.confirmed) {
        jitoResponses.push(jitoResp);
        instructions = [];
      }
    }
  }
  if (instructions.length >= 0) {
    const tipInst = await getJitoTipInstruction(payer.publicKey, 0.001);
    instructions.push(tipInst);
    tx = await buildUnsignedTransaction(
      connection,
      payer.publicKey,
      instructions
    );
    tx.sign([payer]);
    // const jitoResp = await jito_executeAndConfirm(connection, [tx], payer, 0.001, true);
    const jitoResp = await jito_executeAndConfirm(
      connection,
      [tx],
      payer,
      0.001,
      false
    );
    jitoResponses.push(jitoResp);
    instructions = [];
  }
  return jitoResponses;
};

export const getPoolKeys = async (
  connection,
  baseMint,
  quoteMint,
  baseDecimals,
  quoteDecimals,
  marketId
) => {
  // console.log(connection, baseMint, quoteMint, baseDecimals, quoteDecimals, marketId, "We are necessary")
  let poolKeys = Liquidity.getAssociatedPoolKeys({
    marketId: marketId,
    version: 4,
    marketVersion: 3,
    baseMint: baseMint,
    quoteMint: quoteMint,
    baseDecimals: baseDecimals,
    quoteDecimals: quoteDecimals,
    programId: MAINNET_PROGRAM_ID.AmmV4,
    marketProgramId: MAINNET_PROGRAM_ID.OPENBOOK_MARKET,
  });
  const marketInfo = await connection.getAccountInfoAndContext(marketId);
  const marketData = MARKET_STATE_LAYOUT_V2.decode(marketInfo.value.data);
  const modifiedMarketData = {
    marketBids: marketData.bids,
    marketAsks: marketData.asks,
    marketEventQueue: marketData.eventQueue,
    marketBaseVault: marketData.baseVault,
    marketQuoteVault: marketData.quoteVault,
  };
  const minAmountOut = 1;
  poolKeys = { ...modifiedMarketData, ...poolKeys };
  // console.log(poolKeys, "we are pool keys")
  return poolKeys;
};

export const makeSwapInstructions = async (
  owner,
  poolKeys,
  amountIn,
  mintATokenAccount,
  mintBTokenAccount
) => {
  const minAmountOut = 1;
  const userKeys = {
    tokenAccountIn: mintBTokenAccount,
    tokenAccountOut: mintATokenAccount,
    owner: owner,
  };
  const swapInstruction = Liquidity.makeSwapFixedInInstruction(
    { poolKeys, userKeys, amountIn, minAmountOut },
    4
  );
  return swapInstruction.innerTransaction.instructions[0];
};

export const makeSellSwapInstructions = async (
  owner,
  poolKeys,
  connection,
  tokenInTokenAccount,
  tokenOutTokenAccount,
  amountIn
) => {
  const minAmountOut = 1;

  // const balance = await getTokenBalanceWeb3(connection, tokenInTokenAccount);
  const userKeys = {
    tokenAccountIn: tokenInTokenAccount,
    tokenAccountOut: tokenOutTokenAccount,
    owner: owner,
  };
  const swapInstruction = Liquidity.makeSwapFixedInInstruction(
    { poolKeys, userKeys, amountIn, minAmountOut },
    4
  );
  return swapInstruction.innerTransaction.instructions[0];
};

export const prepareSwapTxs = async (
  connection,
  distributorWallet,
  wallets,
  poolKeys
) => {
  const payerWallet = distributorWallet;
  const payer = Keypair.fromSecretKey(
    bs58.decode(decryptPrivateKey(payerWallet.privateKey))
  );

  const transactions = [];
  let instructions = [];
  let keys = [];

  let signers = [];
  let tx;
  for (let i = 0; i < wallets.length; i++) {
    const wallet = Keypair.fromSecretKey(
      bs58.decode(decryptPrivateKey(wallets[i].privateKey))
    );
    const coinATA = new PublicKey(wallets[i].coinATA);
    const solATA = new PublicKey(wallets[i].solATA);
    // console.log(wallet.publicKey, poolKeys, wallet.lamports, coinATA, solATA);
    // console.log(wallet);
    console.log(wallets[i]);
    const swapInstruction = await makeSwapInstructions(
      wallet.publicKey,
      poolKeys,
      wallets[i].lamports,
      coinATA,
      solATA
    );
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
};

async function getTokenBalanceWeb3(connection, tokenAccount) {
  // console.log(tokenAccount);
  const info = await connection.getTokenAccountBalance(tokenAccount);
  if (info.value.uiAmount == null) throw new Error("No balance found");
  // console.log('Balance (using Solana-Web3.js): ', info.value.uiAmount);
  return info.value.amount;
}

export const prepareSellTxs = async (
  connection,
  distributorWallet,
  wallets,
  poolKeys
) => {
  const payerWallet = distributorWallet;
  const payer = Keypair.fromSecretKey(
    bs58.decode(decryptPrivateKey(payerWallet.privateKey))
  );

  const transactions = [];
  let instructions = [];
  let keys = [];
  let tokenBalance;
  let signers = [];
  let tx;
  for (let i = 0; i < wallets.length - 1; i++) {
    const wallet = Keypair.fromSecretKey(
      bs58.decode(decryptPrivateKey(wallets[i].privateKey))
    );
    const coinATA = new PublicKey(wallets[i].coinATA);
    const solATA = new PublicKey(wallets[i].solATA);

    tokenBalance = await getTokenBalanceWeb3(connection, coinATA);
    const swapInstruction = await makeSwapInstructions(
      wallet.publicKey,
      poolKeys,
      tokenBalance,
      solATA,
      coinATA
    );
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
};
