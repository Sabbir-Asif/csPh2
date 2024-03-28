const express = require('express');
const router = express.Router();
const User = require('../models/user'); // Assuming your user model file is named user.js

// Middleware to authenticate and set the user in request
// Placeholder for your actual authentication middleware
const authenticate = (req, res, next) => {
    // Your authentication logic here that sets req.user
    next();
};

// GET method for retrieving the logged-in user's profile
router.get('/profile', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user._id); // Assuming req.user is set by your auth middleware
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }
        // Selectively send user information excluding sensitive fields like password
        res.send({ 
            username: user.username, 
            email: user.email,
            // Add other fields you wish to include in the profile view
        });
    } catch (error) {
        res.status(500).send({ message: "Internal server error" });
    }
});

// PUT method for updating the logged-in user's profile
router.put('/profile', authenticate, async (req, res) => {
    const updates = req.body; // Consider validating and limiting updatable fields
    try {
        const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }
        // Send back the updated profile information
        res.send({ 
            username: user.username, 
            email: user.email,
            // Include any other fields that were updated
        });
    } catch (error) {
        res.status(400).send(error);
    }
});

module.exports = router;
