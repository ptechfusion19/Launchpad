import mongoose from "mongoose"
const { v4: uuidv4 } = require('uuid');


const projectSchema = new mongoose.Schema({
  projectId: {
    type: String,
    default: () => uuidv4(),
    unique: true,
  },
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  mintAddress: {
    type: String,
    required: true,
  },
  tokenName: {
    type: String,
    required: true,
  },
  symbol: {
    type: String,
    required: true,
  },
  logoUrl: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  websiteUrl: {
    type: String,
    default: null, // Optional
  },
  twitterUrl: {
    type: String,
    default: null, // Optional
  },
  telegramUrl: {
    type: String,
    default: null, // Optional
  },
  discordUrl: {
    type: String,
    default: null, // Optional
  },
  vanity: {
    type: String,
    default: null, // Optional
  },
}, { timestamps: true });


const Project = mongoose.models.mintSettings || mongoose.model('mintSettings', projectSchema);

export default Project;
