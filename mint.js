const {Connection, PublicKey} = require('@solana/web3.js');
const { MintLayout, getMint, unpackMint } = require('@solana/spl-token');

async function main () {
    const connection = new Connection("https://api.mainnet-beta.solana.com", 'processed')

    const accountInfo = await connection.getAccountInfo(new PublicKey("7mWYMG95eecUqc63eELHcHAb9mWPZ8AVGMurrT22o4fZ"));
    const mint = await getMint(connection, new PublicKey("7mWYMG95eecUqc63eELHcHAb9mWPZ8AVGMurrT22o4fZ"));
    console.log(mint)
    // console.log(MintLayout.decode(accountInfo.data));

}


main();
