const router = require("express").Router();
const bcrypt = require("bcrypt");
const { User, validate } = require("../models/user");
const jwt = require("jsonwebtoken");

// Middleware to authenticate and authorize admin users
const isAdmin = (req, res, next) => {
    // Check if user is authenticated and has admin role
    // For simplicity, assuming authentication is done using JWT and the user's role is stored in the JWT payload
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ message: "Access denied. No token provided." });

    try {
        const decoded = jwt.verify(token, process.env.JWTPRIVATEKEY);
        if (decoded.role !== "admin") return res.status(403).json({ message: "Access denied. Not an admin user." });
        req.user = decoded; // Set user object in the request for future use
        next();
    } catch (error) {
        res.status(400).json({ message: "Invalid token." });
    }
};

// POST method for creating a new user (System Admin access)
router.post("/users", isAdmin, async (req, res) => {
    try {
        // Validate request body
        const { error } = validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        // Check if the user already exists
        let user = await User.findOne({ email: req.body.email });
        if (user) return res.status(400).json({ message: "User already exists." });

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        // Create new user
        user = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
            role: req.body.role || "unassigned", // Set role to 'unassigned' if not provided
            branch: req.body.branch,
            pin: req.body.pin
        });

        await user.save();
        res.status(201).json({ message: "User created successfully", user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;
