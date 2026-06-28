const mongoose = require("mongoose");

const storySchema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    image: { type: String, required: true },
    viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    expiresAt: { type: Date, default: () => new Date(+new Date() + 24 * 60 * 60 * 1000) }, // 24 hours
}, { timestamps: true });

module.exports = mongoose.model("Story", storySchema);