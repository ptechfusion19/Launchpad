import mongoose from "mongoose";

// Define the schema for the project
const poolKey = new mongoose.Schema({
    projectId: {
        type: String,
        required: true,
    },
    poolKey: {
        type: Object,
    },
    mint: {
        type: String
    }
    //  Market Info type is objec

});
// Create a model from the schema

const PoolKey = mongoose.models.PoolKey || mongoose.model('PoolKey', poolKey);
module.exports = PoolKey;