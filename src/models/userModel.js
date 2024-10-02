import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const userSchema = new mongoose.Schema({
  // Define your schema fields here
  type: {
    type: String,
    unique: true,
    default: uuidv4,
  },
  walletAddress: {
    type: String,
    required: true,
    // unique: true,
  },
}, { timestamps: true });

const User = mongoose.models.add_User || mongoose.model('add_User', userSchema);

export default User;