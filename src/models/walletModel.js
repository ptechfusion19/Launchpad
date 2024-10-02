// import mongoose from "mongoose";

// const walletSchema = new mongoose.Schema({
//   projectId: {
//     type: String,
//     required: true,
//     // Consider removing unique if multiple wallet entries per project are allowed
//     unique: true, 
//   },
//   wallets: [ // Array of wallet objects
//     {
//       pubKey: {
//         type: String,
//         required: true,
//         // Add validation regex if needed
//       },
//       privateKey: {
//         type: String,
//         required: true,
//         // Add validation regex if needed
//       },
//       solATA: {
//         type: String,
//         required: true,
//       },
//       coinATA: {
//         type: String,
//         required: true,
//       },
//       lamports: {
//         type: Number,
//         required: true,
//       }
//     }
//   ]
// }, { timestamps: true });

// // Optional: Add indexes for faster queries
// walletSchema.index({ 'wallets.pubKey': 1 });
// walletSchema.index({ projectId: 1 });

// const Wallet = mongoose.models.Wallet || mongoose.model('Wallet', walletSchema);

// export default Wallet;



import mongoose from "mongoose";

// Define the schema for the project
const walletSchema = new mongoose.Schema({
  projectId: {
    type: String,
    required: true,
  },
  pubKey: {
    type: String,
    required: true,
  },
  privateKey: {
    type: String,
    required: true,
  },
  solATA: {
    type: String,
    required: true,
  },
  coinATA: {
    type: String,
    required: true,
  },
  lamports: {
    type: Number, // Change this to Number
    required: true,
  }
});
// Create a model from the schema

const Wallet = mongoose.models.Wallet || mongoose.model('Wallet', walletSchema);
// const Project = mongoose.model('wallets', walletSchema);
module.exports = Wallet;