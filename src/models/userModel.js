import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const userSchema = new mongoose.Schema({
  // A unique type identifier, defaulted to a UUID
  type: {
    type: String,
    unique: true,
    default: uuidv4,
  },
  // User's wallet address
  walletAddress: {
    type: String,
    required: true,
    // unique: true,
  },
  // The wallet address of the user who referred them, if any
  referralWalletAddress: {
    type: String,
    default: null, // Default to null if no referrer
  },
}, { timestamps: true });

// Define the User model using the updated schema
const User = mongoose.models.add_User || mongoose.model('add_User', userSchema);

export default User;
