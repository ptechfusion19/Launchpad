
import LaunchSettings from "@/models/launchSettingsModel";
import { VersionedTransaction } from "@solana/web3.js";
import { PublicKey, Connection, Keypair } from "@solana/web3.js";
import { Token, MintLayout } from "@solana/spl-token";
import PoolKey from "@/models/poolKeysModel";
import MarketInfo from "@/models/marketInfoModel";
import { getJitoTipInstruction, jito_executeAndConfirm } from "@/app/jito";
import { prepareWallets, getPoolKeys, prepareSwapTxs, createLookupTableInstruction, extendLookupTableInstruction, deactivateLookupTableInstruction, closeLookupTableInstruction, buildUnsignedTransactionwithLookup, buildUnsignedTransaction } from "@/app/utils";
import Wallet from "@/models/walletModel";
import User from "@/models/userModel";
import connectDB from '@/config/database';
import bs58 from "bs58";

export async function testLaunch(signedTransactions, userId, projectId) {
  await connectDB();
  const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=e2090957-8cc3-44ab-bb60-82985d36cad5', 'processed');
  const settings = await LaunchSettings.findOne({ projectId });
  const user = await User.findById(userId);
  console.log(user);
  const ownerPubkey = new PublicKey(user.walletAddress);
  console.log(ownerPubkey);
  // const wallets = await Wallet.find({ projectId });
  // let poolKeys = await PoolKey.find({ projectId });
  // poolKeys = poolKeys[poolKeys.length-1];
  // let marketInfo = await MarketInfo.find({ projectId });
  // marketInfo = marketInfo[marketInfo.length-1];

  const signedTransactionsByes = []
  for (let i = 0; i < signedTransactions.length; i++) {
    const array = Object.keys(signedTransactions[i]).map(key => signedTransactions[i][key]);
    const uint8Array = new Uint8Array(array);
    signedTransactionsByes.push(uint8Array);
    // console.log(new Uint8Array(signedTransactions[i]).length);
    // console.log((new Uint8Array(signedTransactions[i])).slice(0,10));
  }

  const tx1 = VersionedTransaction.deserialize(signedTransactionsByes[0]);
  // let latestBlockhash = await connection.getLatestBlockhash();
  // tx1.message.recentBlockhash = latestBlockhash.blockhash;
  const tx2 = VersionedTransaction.deserialize(signedTransactionsByes[1]);
  // latestBlockhash = await connection.getLatestBlockhash();
  // tx2.message.recentBlockhash = latestBlockhash.blockhash;
  const tx3 = VersionedTransaction.deserialize(signedTransactionsByes[2]);
  // latestBlockhash = await connection.getLatestBlockhash();
  // tx3.message.recentBlockhash = latestBlockhash.blockhash;

  const bundleResponse = await jito_executeAndConfirm(connection, [tx1, tx2, tx3], ownerPubkey, 0.001, false);

  console.log(bundleResponse);

}

export async function launch(signedTransactions, userId, projectId) {
  // console.log(userId, "___userid")
  //console.log(projectId,"___projectId")
  await connectDB();
  const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=e2090957-8cc3-44ab-bb60-82985d36cad5', 'processed');
  const settings = await LaunchSettings.findOne({ projectId });
  const user = await User.findById(userId);
  // console.log(user);
  const ownerPubkey = new PublicKey(user.walletAddress);
  // console.log(ownerPubkey);
  const distributorWallet = await Wallet.findOne({
    projectId: projectId,
    lamports: 0
  });

  const distKeypair = Keypair.fromSecretKey(bs58.decode(distributorWallet.privateKey));

  const wallets = await Wallet.find({
    projectId: projectId,
    lamports: { $gt: 0 }
  });
  // const wallets = await Wallet.find({ projectId });



  let poolKeys = await PoolKey.find({ projectId });
  poolKeys = poolKeys[poolKeys.length - 1];
  let marketInfo = await MarketInfo.find({ projectId });
  // let marketInfo = await MarketInfo.findById("66e7f55f9176272a91efc239");
  marketInfo = marketInfo[marketInfo.length-1];
  console.log(marketInfo);

  const signedTransactionsByes = []
  for (let i = 0; i < signedTransactions.length; i++) {
    const array = Object.keys(signedTransactions[i]).map(key => signedTransactions[i][key]);
    const uint8Array = new Uint8Array(array);
    signedTransactionsByes.push(uint8Array);
  }

  const signedSolTransferTransaction = VersionedTransaction.deserialize(signedTransactionsByes[0]);
  const signedCreateMarketTx1 = VersionedTransaction.deserialize(signedTransactionsByes[1]);
  const signedCreateMarketTx2 = VersionedTransaction.deserialize(signedTransactionsByes[2]);

  const signedAddLiquidtyTransaction = VersionedTransaction.deserialize(signedTransactionsByes[3]);

  // Send SOL to Distributor Wallet i.e. send => [signedSolTransferTransaction]
  // Must uncomment
  const solTransferResponse = await jito_executeAndConfirm(connection, [signedSolTransferTransaction], ownerPubkey, 0.001, false);

  console.log("solTransferResponse:", solTransferResponse);

  // prepareWallets 
  // must remove slice
  const prepareWalletsResponse = await prepareWallets(connection, distributorWallet, wallets, settings.mint);

  console.log("prepareWalletsResponse", prepareWalletsResponse);

  // Must Uncomment
  // Create Market
  console.log(marketInfo, "____marketInfo");
  const createMarketResponse = await jito_executeAndConfirm(connection, [signedCreateMarketTx1, signedCreateMarketTx2], ownerPubkey, 0.001, false);
  console.log("Create Market Response", createMarketResponse);


  // Prepare Swap Txs
  const baseMint = new PublicKey(marketInfo.marketInfo.baseMint);
  const quoteMint = new PublicKey(marketInfo.marketInfo.quoteMint);
  const baseTokenAccountInfo = await connection.getAccountInfo(baseMint);
  const decodedAI = MintLayout.decode(baseTokenAccountInfo.data);
  const baseDecimals = decodedAI.decimals;
  const quoteDecimals = 9;
  const marketId = new PublicKey(marketInfo.marketInfo.id);
  const freshPoolKeys = await getPoolKeys(connection, baseMint, quoteMint, baseDecimals, quoteDecimals, marketId);
  const swapResponse = await prepareSwapTxs(connection, distributorWallet, wallets, freshPoolKeys);


  const pubKeys = swapResponse.keys.map((key) => {
    return key.pubkey

  });
  const allKeys = [...new Set(pubKeys)];
  // console.log(distKeypair);
  const createALTResponse = await createLookupTableInstruction(connection, distKeypair.publicKey, distKeypair.publicKey);
  const jitoInstruction = await getJitoTipInstruction(distKeypair.publicKey, 0.0001);

  const extendALTInstructions = []
  for (let i = 0; i < allKeys.length; i += 20) {
    const extenALTResponse = await extendLookupTableInstruction(distKeypair.publicKey, distKeypair.publicKey, createALTResponse.address, allKeys.slice(i, i + 20));

    extendALTInstructions.push(extenALTResponse);
  }


  const createALTTx = await buildUnsignedTransaction(connection, distKeypair.publicKey, [createALTResponse.instruction, extendALTInstructions.slice(-1)[0].instruction]);
  createALTTx.sign([distKeypair]);

  const ALTBundle = [createALTTx];
  console.log(extendALTInstructions.length);

  for (let i = 0; i < extendALTInstructions.length - 1; i++) {
    const instructions = [];
    if (i == 0) {
      instructions.push(jitoInstruction);
    }
    instructions.push(extendALTInstructions[i].instruction)
    const extendALTTx = await buildUnsignedTransaction(connection, distKeypair.publicKey, instructions)
    extendALTTx.sign([distKeypair]);
    ALTBundle.push(extendALTTx);
  }
  console.log(`Lookup Table Address: ${createALTResponse.address}`);

  console.log(ALTBundle.length);

  const ALTResponse = await jito_executeAndConfirm(connection, ALTBundle, distKeypair.publicKey, 0.001, false);

  console.log(ALTResponse);

  const lookupTableAddress = createALTResponse.address;

  // const lookupTableAddress = new PublicKey("97xzf2H28cKtKfuQv842qECymhenZUu5fBhwozTwLqh8");


  const lookupTable = (await connection.getAddressLookupTable(lookupTableAddress)).value;
  const swapInstructions = swapResponse.instructions;
  const swapSigners = swapResponse.signers;

  const swapTxs = [];

  const SWAPS_PER_TX = 6;
  for (let i = 0; i < swapInstructions.length; i += SWAPS_PER_TX) {
    const swapTx = await buildUnsignedTransactionwithLookup(connection, distKeypair.publicKey, swapInstructions.slice(i, i + SWAPS_PER_TX), lookupTable);
    swapTx.sign([distKeypair, ...swapSigners.slice(i, i + SWAPS_PER_TX)])
    swapTxs.push(swapTx);
  }
  

  // Send Liquidity Txs with Swap Txs


  // console.log(swapTxs[3]);
  // const extendALTTxResp = await connection.sendRawTransaction(swapTxs[3].serialize(), {skipPreflight:false});
  // console.log(extendALTTxResp);
  // const addLiqSimResponse = await connection.simulateTransaction(signedAddLiquidtyTransaction);
  // console.log(addLiqSimResponse);
  const addLiquiditySnipeResponse = await jito_executeAndConfirm(connection, [signedAddLiquidtyTransaction, ...swapTxs], ownerPubkey, 0.001, false);
  console.log('Add Liquidity Response', addLiquiditySnipeResponse);
  const deactivateLUTIns = await deactivateLookupTableInstruction(distKeypair.publicKey, lookupTableAddress);
  const closeLUTIns = await closeLookupTableInstruction(distKeypair.publicKey, lookupTableAddress);

  const closeLUTTxn = await buildUnsignedTransaction(connection, distKeypair.publicKey, [deactivateLUTIns.instruction, jitoInstruction]);
  closeLUTTxn.sign([distKeypair]);
  const closeLUTResp = await jito_executeAndConfirm(connection, [closeLUTTxn], distKeypair.publicKey, 0.0001, false);

  return true;

}




export async function sellAllSnipes(signedTransactions, settings, user) {
  
  await connectDB();
  const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=e2090957-8cc3-44ab-bb60-82985d36cad5', 'processed');
  
  // console.log(user);
  const ownerPubkey = new PublicKey(user.walletAddress);
  // console.log(ownerPubkey);
  const distributorWallet = await Wallet.findOne({
    projectId: projectId,
    lamports: 0
  });

  const distKeypair = Keypair.fromSecretKey(bs58.decode(distributorWallet.privateKey));

  const wallets = await Wallet.find({
    projectId: projectId,
    lamports: { $gt: 0 }
  });
  // const wallets = await Wallet.find({ projectId });



  // let poolKeys = await PoolKey.find({ projectId });
  // poolKeys = poolKeys[poolKeys.length - 1];
  let marketInfo = await MarketInfo.find({ projectId });
  // let marketInfo = await MarketInfo.findById("66e7f55f9176272a91efc239");
  marketInfo = marketInfo[marketInfo.length-1];
  console.log(marketInfo);

  
  // Prepare Swap Txs
  const baseMint = new PublicKey(marketInfo.marketInfo.baseMint);
  const quoteMint = new PublicKey(marketInfo.marketInfo.quoteMint);
  const baseTokenAccountInfo = await connection.getAccountInfo(baseMint);
  const decodedAI = MintLayout.decode(baseTokenAccountInfo.data);
  const baseDecimals = decodedAI.decimals;
  const quoteDecimals = 9;
  const marketId = new PublicKey(marketInfo.marketInfo.id);
  const freshPoolKeys = await getPoolKeys(connection, baseMint, quoteMint, baseDecimals, quoteDecimals, marketId);
  const swapResponse = await prepareSwapTxs(connection, distributorWallet, wallets, freshPoolKeys);


  const pubKeys = swapResponse.keys.map((key) => {
    return key.pubkey

  });
  const allKeys = [...new Set(pubKeys)];
  // console.log(distKeypair);
  const createALTResponse = await createLookupTableInstruction(connection, distKeypair.publicKey, distKeypair.publicKey);
  const jitoInstruction = await getJitoTipInstruction(distKeypair.publicKey, 0.0001);

  const extendALTInstructions = []
  for (let i = 0; i < allKeys.length; i += 20) {
    const extenALTResponse = await extendLookupTableInstruction(distKeypair.publicKey, distKeypair.publicKey, createALTResponse.address, allKeys.slice(i, i + 20));

    extendALTInstructions.push(extenALTResponse);
  }


  const createALTTx = await buildUnsignedTransaction(connection, distKeypair.publicKey, [createALTResponse.instruction, extendALTInstructions.slice(-1)[0].instruction]);
  createALTTx.sign([distKeypair]);

  const ALTBundle = [createALTTx];
  console.log(extendALTInstructions.length);

  for (let i = 0; i < extendALTInstructions.length - 1; i++) {
    const instructions = [];
    if (i == 0) {
      instructions.push(jitoInstruction);
    }
    instructions.push(extendALTInstructions[i].instruction)
    const extendALTTx = await buildUnsignedTransaction(connection, distKeypair.publicKey, instructions)
    extendALTTx.sign([distKeypair]);
    ALTBundle.push(extendALTTx);
  }
  console.log(`Lookup Table Address: ${createALTResponse.address}`);

  console.log(ALTBundle.length);

  const ALTResponse = await jito_executeAndConfirm(connection, ALTBundle, distKeypair.publicKey, 0.001, false);

  console.log(ALTResponse);

  const lookupTableAddress = createALTResponse.address;

  // const lookupTableAddress = new PublicKey("97xzf2H28cKtKfuQv842qECymhenZUu5fBhwozTwLqh8");


  const lookupTable = (await connection.getAddressLookupTable(lookupTableAddress)).value;
  const swapInstructions = swapResponse.instructions;
  const swapSigners = swapResponse.signers;

  const swapTxs = [];

  const SWAPS_PER_TX = 6;
  for (let i = 0; i < swapInstructions.length; i += SWAPS_PER_TX) {
    const swapTx = await buildUnsignedTransactionwithLookup(connection, distKeypair.publicKey, swapInstructions.slice(i, i + SWAPS_PER_TX), lookupTable);
    swapTx.sign([distKeypair, ...swapSigners.slice(i, i + SWAPS_PER_TX)])
    swapTxs.push(swapTx);
  }
  

  // Send Liquidity Txs with Swap Txs


  // console.log(swapTxs[3]);
  // const extendALTTxResp = await connection.sendRawTransaction(swapTxs[3].serialize(), {skipPreflight:false});
  // console.log(extendALTTxResp);
  // const addLiqSimResponse = await connection.simulateTransaction(signedAddLiquidtyTransaction);
  // console.log(addLiqSimResponse);
  const addLiquiditySnipeResponse = await jito_executeAndConfirm(connection, [signedAddLiquidtyTransaction, ...swapTxs], ownerPubkey, 0.001, false);
  console.log('Add Liquidity Response', addLiquiditySnipeResponse);
  const deactivateLUTIns = await deactivateLookupTableInstruction(distKeypair.publicKey, lookupTableAddress);
  const closeLUTIns = await closeLookupTableInstruction(distKeypair.publicKey, lookupTableAddress);

  const closeLUTTxn = await buildUnsignedTransaction(connection, distKeypair.publicKey, [deactivateLUTIns.instruction, jitoInstruction]);
  closeLUTTxn.sign([distKeypair]);
  const closeLUTResp = await jito_executeAndConfirm(connection, [closeLUTTxn], distKeypair.publicKey, 0.0001, false);

  return true;

}
