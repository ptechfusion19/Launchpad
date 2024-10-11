import mongoose from "mongoose";

const ReferralSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    walletAddress: {
        type: String,
        required: true,
    },
    referralCode: {
        type: String,
        required: true,
        unique: true,
    },
    referralLink: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.Referral || mongoose.model('Referral', ReferralSchema);
