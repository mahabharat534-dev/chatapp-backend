const jwt = require("jsonwebtoken");
const User = require("../models/User");

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "mahabharat534@gmail.com";

const isAdmin = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ message: "No token provided" });

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user || user.email !== ADMIN_EMAIL) {
            return res.status(403).json({ message: "Admin access only" });
        }

        req.adminUser = user;
        next();
    } catch (err) {
        res.status(401).json({ message: "Invalid or expired token" });
    }
};

module.exports = isAdmin;