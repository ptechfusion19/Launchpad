import mongoose from "mongoose"
const { v4: uuidv4 } = require('uuid');


const launchSettingsSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    default: uuidv4,
  },
  projectId: {
    type: String,
    default: () => uuidv4(),
    unique: true,
  },
  userId: {
    type: String,
    required: true,
  },
  mint: {
    type: String,
    required: true,
  },
  amountSol: {
    type: Number,
    required: true,
  },
  amountTokens: {
    type: Number,
    required: true,
  },
  amountSolForSnipping: {
    type: Number,
    required: true,
  },
}, { timestamps: true });

const LaunchSettings = mongoose.models.launchsettings || mongoose.model('launchsettings', launchSettingsSchema);

export default LaunchSettings;