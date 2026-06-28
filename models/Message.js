const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["text", "image", "audio", "video", "document"], default: "text" },
    content: { type: String, required: true },
    delivered: { type: Boolean, default: false },
    read: { type: Boolean, default: false },
    readAt: { type: Date },
    reactions: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, emoji: String }],
}, { timestamps: true });

module.exports = mongoose.model("Message", messageSchema);
