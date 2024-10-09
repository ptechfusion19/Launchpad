import {
    
    PublicKey,
    SystemProgram,
    sendAndConfirmTransaction,
    TransactionMessage,
    VersionedTransaction
} from "@solana/web3.js";

import axios from "axios";
import bs58 from "bs58";
import { Currency, CurrencyAmount } from "@raydium-io/raydium-sdk";
import { sleep } from "@raydium-io/raydium-sdk-v2";

const DEVNET = process.env.NEXT_PUBLIC_DEVNET === '1';
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
  
  /**
   * Generates a random validator from the list of jito_Validators.
   * @returns {PublicKey} A new PublicKey representing the random validator.
   */
  export const getRandomValidator = () => {
    const res =
      jito_Validators[Math.floor(Math.random() * jito_Validators.length)];
    return new PublicKey(res);
  }


  export const getJitoTipTx = async (connection, payerPubkey, jitofee) => {
    const jito_validator_wallet = getRandomValidator();
    //console.log("Selected Jito Validator: ", jito_validator_wallet.toBase58());
    const latestBlockhash = await connection.getLatestBlockhash()
      const fee = new CurrencyAmount(Currency.SOL, jitofee, false).raw.toNumber();
      //console.log(`Jito Fee: ${fee / 10 ** 9} sol`);
      const jitoFee_message = new TransactionMessage({
        payerKey: payerPubkey,
        recentBlockhash: latestBlockhash.blockhash,
        instructions: [
          SystemProgram.transfer({
            fromPubkey: payerPubkey,
            toPubkey: jito_validator_wallet,
            lamports: fee,
          }),
        ],
      }).compileToV0Message();
      const jitoFee_transaction = new VersionedTransaction(jitoFee_message);
      return jitoFee_transaction;
  }


  export const getJitoTipInstruction = async (payerPubkey, jitofee) => {
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

  /**
   * Executes and confirms a Jito transaction.
   * @param {Transaction} transaction - The transaction to be executed and confirmed.
   * @param {Account} payer - The payer account for the transaction.
   * @param {Blockhash} lastestBlockhash - The latest blockhash.
   * @param {number} jitofee - The fee for the Jito transaction.
   * @returns {Promise<{ confirmed: boolean, signature: string | null }>} - A promise that resolves to an object containing the confirmation status and the transaction signature.
   */
  export const jito_executeAndConfirm = async (
    connection,
    transactions,
    payer,
    jitofee,
    addTip
  ) => {
    //console.log("Executing transaction (jito)...");
    try {
      let final_transaction;
      let jitoTxSignature ;
      const lastestBlockhash = await connection.getLatestBlockhash();
      if (addTip) {
          const jitoFee_transaction = await getJitoTipTx(connection, payer.publicKey, jitofee);
          jitoFee_transaction.sign([payer]);
          jitoTxSignature = bs58.encode(jitoFee_transaction.signatures[0]);
          const serializedJitoFeeTransaction = bs58.encode(
            jitoFee_transaction.serialize()
          );
          final_transaction = [
            serializedJitoFeeTransaction
          ];
      }
      else {
        final_transaction = [];
        jitoTxSignature = bs58.encode(transactions[0].signatures[0])
      }
      if (DEVNET) {
        let txResp;
        let simResp;
        for (let i=0; i<transactions.length; i++) {
          // const serializedTransaction = bs58.encode(transactions[i].serialize());
          // simResp = await connection.simulateTransaction(transactions[i]);
          // console.log("__________________________");
          // console.log(simResp);
          // console.log("__________________________");
          txResp = await sendAndConfirmTransaction(connection, transactions[i]);
          console.log(txResp);
        
          
          // await connection.confirmTransaction(txResp);
          
          // final_transaction.push(serializedTransaction);
        }
        return {confirmed: true, signature: ""}
      }
      else {
        for (let i=0; i<transactions.length; i++) {
          const serializedTransaction = bs58.encode(transactions[i].serialize());
          final_transaction.push(serializedTransaction);
        }
        // console.log(final_transaction);
        
        const requests = endpoints.map((url) =>
          axios.post(url, {
            jsonrpc: "2.0",
            id: 1,
            method: "sendBundle",
            params: [final_transaction],
          })
        );
        //console.log("Sending tx to Jito validators...");
        const res = await Promise.all(requests.map((p) => p.catch((e) => e)));
        const success_res = res.filter((r) => !(r instanceof Error));
        // console.log(success_res);
        // console.log(success_res);
        if (success_res.length > 0) {
          
          //console.log("Jito validator accepted the tx");
          return await jito_confirm(connection, jitoTxSignature, lastestBlockhash);
        } else {
          //console.log("No Jito validators accepted the tx");
          return { confirmed: false, signature: jitoTxSignature };
        }
      }
      
    } catch (e) {
      if (e instanceof axios.AxiosError) {
        console.log("Failed to execute the jito transaction");
      } else {
        console.log("Error during jito transaction execution: ", e);
      }
      return { confirmed: false, signature: null };
    }
  }
  
  /**
   * Confirms a transaction on the Solana blockchain.
   * @param {string} signature - The signature of the transaction.
   * @param {object} latestBlockhash - The latest blockhash information.
   * @returns {object} - An object containing the confirmation status and the transaction signature.
   */
  export const jito_confirm = async (connection, signature, latestBlockhash) => {
    
    console.log("Confirming the jito transaction...");
    console.log(signature);
    const confirmation = await connection.confirmTransaction(
      {
        signature,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        blockhash: latestBlockhash.blockhash,
      },
      "confirmed"
    );
    return { confirmed: !confirmation.value.err, signature };
  }
