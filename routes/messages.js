const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const Message = require("../models/Message");
const Chat = require("../models/Chat");

// Get messages (paginated)
router.get("/:chatId", protect, async (req, res) => {
    const { page = 1, limit = 50 } = req.query;
    const messages = await Message.find({ chatId: req.params.chatId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate("sender", "name avatar");
    res.json(messages.reverse());
});

// Send message
router.post("/", protect, async (req, res) => {
    const { chatId, type, content } = req.body;
    const message = await Message.create({
        chatId, sender: req.user._id, type: type || "text", content,
    });
    await Chat.findByIdAndUpdate(chatId, {
        lastMessage: message._id, updatedAt: new Date(),
    });
    const populated = await Message.findById(message._id).populate("sender", "name avatar");
    res.status(201).json(populated);
});

// Mark as read
router.put("/read/:chatId", protect, async (req, res) => {
    await Message.updateMany(
        { chatId: req.params.chatId, sender: { $ne: req.user._id }, read: false },
        { read: true, readAt: new Date() }
    );
    res.json({ success: true });
});

// Add reaction
router.post("/react/:messageId", protect, async (req, res) => {
    const { emoji } = req.body;
    const message = await Message.findById(req.params.messageId);
    const existing = message.reactions.findIndex(r => r.user.toString() === req.user._id.toString());
    if (existing !== -1) {
        message.reactions[existing].emoji = emoji;
    } else {
        message.reactions.push({ user: req.user._id, emoji });
    }
    await message.save();
    res.json(message);
});

module.exports = router;