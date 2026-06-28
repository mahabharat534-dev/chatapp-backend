const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const User = require("../models/User");
const OTP = require("../models/OTP");
const jwt = require("jsonwebtoken");
const { sendOTP } = require("../config/email");

// Generate JWT token
const generateToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });

// STEP 1: Send OTP to email
router.post("/send-otp", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    try {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await OTP.deleteMany({ email }); // delete old OTPs
        await OTP.create({ email, otp });
        await sendOTP(email, otp);
        res.json({ message: "OTP sent to your email" });
    } catch (err) {
        res.status(500).json({ message: "Failed to send OTP: " + err.message });
    }
});

// STEP 2: Verify OTP
router.post("/verify-otp", async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP required" });

    try {
        const record = await OTP.findOne({ email, otp });
        if (!record) return res.status(400).json({ message: "Invalid or expired OTP" });

        await OTP.deleteMany({ email });

        let user = await User.findOne({ email });
        const isNew = !user;

        if (!user) {
            user = await User.create({ email, name: email.split("@")[0] });
        }

        const token = generateToken(user._id);
        res.json({ token, user, isNew });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// STEP 3: Save profile (name, phone)
router.post("/profile", async (req, res) => {
    const { token, name, phone } = req.body;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByIdAndUpdate(
            decoded.id,
            { name, phone },
            { new: true }
        );
        res.json(user);
    } catch {
        res.status(400).json({ message: "Invalid token" });
    }
});

module.exports = router;