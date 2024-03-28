const router = require("express").Router();
const bcrypt = require("bcrypt");
const { User } = require("../models/user");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");


const validateUser = (data) => {
    const schema = Joi.object({
        username: Joi.string().required().label("Username"),
        email: Joi.string().email().required().label("Email"),
        password: passwordComplexity().required().label("Password"),
        role: Joi.string().valid('admin', 'stsManager', 'landfilManager', 'unassigned').default('unassigned').label("Role"),
        branch: Joi.string().optional().label("Branch"),
    });
    return schema.validate(data);
};

const validateUpdatedUser = (data) => {
    const schema = Joi.object({
        username: Joi.string().optional().label("Username"),
        role: Joi.string().valid('admin', 'stsManager', 'landfilManager', 'unassigned').default('unassigned').label("Role"),
        branch: Joi.string().optional().label("Branch"),
    });
    return schema.validate(data);
};

//GET method to get all users
router.get("/", async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// GET a specific user's details by userId
router.get("/:userId", async (req, res) => {
    try {
        const user = await User.findOne({ userId: req.params.userId });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// POST method for creating a new user
router.post("/", async (req, res) => {
    try {

        const { error } = validateUser(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        let user = await User.findOne({ email: req.body.email });
        if (user) return res.status(400).json({ message: "User already exists." });

        const highestUserIdUser = await User.findOne({}, {}, { sort: { 'userId': -1 } });
        let userId;
        if (highestUserIdUser && highestUserIdUser > 0) {
            userId = parseInt(highestUserIdUser.userId) + 1;
        }
        else{
            userId = 1;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        user = new User({
            userId: userId,
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
            role: req.body.role || "unassigned", 
            branch: req.body.branch,
            pin: 111
        });

        await user.save();
        res.status(201).json({ message: "User created successfully", user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


//PUT method to update a specific user with userId
router.put("/:userId", async (req, res) => {
    try {
        const { error } = validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const user = await User.findOne({ userId: req.params.userId });
        if (!user) return res.status(404).json({ message: "User not found" });

        // Update user properties other than email and password
        user.username = req.body.username;
        user.role = req.body.role || "unassigned";
        user.branch = req.body.branch;
        user.pin = req.body.pin || 111;

        await user.save();
        res.status(200).json({ message: "User updated successfully", user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});



module.exports = router;
