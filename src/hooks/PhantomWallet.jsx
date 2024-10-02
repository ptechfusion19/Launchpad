// import React, { useState, useMemo, useEffect } from 'react';
// import './Hooks.css'
// import {
//     WalletProvider,
//     useWallet,
//     ConnectionProvider,
// } from '@solana/wallet-adapter-react';
// import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
// import {
//     SolflareWalletAdapter,
//     PhantomWalletAdapter,
// } from '@solana/wallet-adapter-wallets';
// import { clusterApiUrl } from '@solana/web3.js';
// import {
//     WalletModalProvider,
//     WalletDisconnectButton,
//     WalletMultiButton
// } from '@solana/wallet-adapter-react-ui';
// import '@solana/wallet-adapter-react-ui/styles.css';
// import { useContext } from 'react';
// import Web3Context from '../context/Web3Context';
// const NETWORK = WalletAdapterNetwork.Devnet; // Change to Mainnet or other network if needed

// const Wallet = () => {
//     const [selectedWallet, setSelectedWallet] = useState(null);
//     const { connect, disconnect, connected } = useWallet();

//     const wallets = useMemo(
//         () => [
//             //   new SolflareWalletAdapter(),
//             new PhantomWalletAdapter(),
//             // Add other wallet adapters as needed
//         ],
//         []
//     );

//     const connectWallet = async (walletAdapter) => {

//         //console.log("hello")

//         try {
//             await connect(walletAdapter);
//             setSelectedWallet(walletAdapter);
//         } catch (error) {
//             console.error('Failed to connect:', error);
//         }
//     };

//     const disconnectWallet = async () => {

//         try {
//             await disconnect();
//             setSelectedWallet(null);

//         } catch (error) {
//             console.error('Failed to disconnect:', error);
//         }
//     };

//     return (
//         <div>
//             <h2>Wallet Connector</h2>
//             <p>Selected Wallet: {selectedWallet?.name}</p>
//             <p>Connection Status: {connected ? 'Connected' : 'Disconnected'}</p>

//             {/* Connect buttons */}
//             <div>
//                 {wallets.map((walletAdapter, index) => (
//                     <button
//                         key={index}
//                         onClick={() => connectWallet(walletAdapter)}
//                         disabled={connected}
//                     >
//                         Connect {walletAdapter.name}
//                     </button>
//                 ))}
//             </div>

//             {/* Disconnect button */}
//             {connected && (
//                 <button onClick={disconnectWallet} disabled={!connected}>
//                     Disconnect
//                 </button>
//             )}
//         </div>
//     );
// };

// const WalletWithProvider = () => {
//     const { setConnected, setSolanaKey } = useContext(Web3Context)
//     const { disconnect, connected, publicKey } = useWallet();
//     const wallets = useMemo(
//         () => [
//             new SolflareWalletAdapter(),
//             new PhantomWalletAdapter(),
//             // Add other wallet adapters as needed
//         ],
//         []
//     );
//     useEffect(() => {

//         if (connected && publicKey) {
//             setConnected(true)
//             setSolanaKey(publicKey)
//             alert("Wallet connected with public key:", publicKey);
//         }
//     }, [connected, publicKey]);


//     return (
//         <ConnectionProvider endpoint={clusterApiUrl(NETWORK)}>
//             <WalletProvider wallets={wallets} autoConnect={false}>
//                 <WalletModalProvider>
//                     {!connected && <WalletMultiButton />}
//                     {connected && <WalletDisconnectButton onClick={disconnectWallet} />}
//                     { /* Your app's components go here, nested within the context providers. */}
//                     {/* <p>{publicKey ? publicKey : "hello"}</p> */}

//                 </WalletModalProvider>
//             </WalletProvider>
//         </ConnectionProvider>
//     );
// };

// export default WalletWithProvider;
