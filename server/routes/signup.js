const router = require("express").Router();
const { User, validate } = require("../models/user");
const bcrypt = require("bcrypt");

router.post("/", async (req, res) => {
    try {
        const { error } = validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        // Check if user already exists
        let user = await User.findOne({ email: req.body.email });
        if (user) return res.status(400).json({ message: "User already registered." });

       
        const lowestUserIdUser = await User.findOne({}, {}, { sort: { 'userId': 1 } });

        let userId;
        if (lowestUserIdUser && lowestUserIdUser < 0) {
            userId = parseInt(lowestUserIdUser.userId) -1;
        } else {
            userId = -1; 
        }



        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        // Create new user
        user = new User({
            userId: userId, 
            username: req.body.username,
            contact: req.body.contact,
            email: req.body.email,
            password: hashedPassword,
            roleId: 1,
            branch: req.body.branch,
            pin: req.body.pin
        });

        await user.save();
        res.status(201).json({ success: true, message: "User created successfully", user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;
