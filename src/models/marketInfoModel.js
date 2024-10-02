import mongoose from "mongoose";

// Define the schema for the project
const marketInfo = new mongoose.Schema({
    projectId: {
        type: String,
        required: true,
    },
    marketInfo: {
        type: Object,
    },
    mint: {
        type: String
    }
    //  Market Info type is objec

});
// Create a model from the schema

const MarketInfo = mongoose.models.MarketInfo || mongoose.model('MarketInfo', marketInfo);
module.exports = MarketInfo;