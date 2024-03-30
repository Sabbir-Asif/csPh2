const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

const userSchema = new mongoose.Schema({
    userId: { type: Number, },
    username: { type: String, required: true },
    contact: {type: String},
    email: { type: String, required: true },
    password: { type: String, required: true },
    roleId: { type: Number},
    branch: { type: String, required: true },
    pin: { type: String, required: true}
});

userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({ usrId: this.userId,roleId:this.roleId}, process.env.JWTPRIVATEKEY, {
        expiresIn: "7d",
    });
    return token;
};

const User = mongoose.model("user", userSchema);

const validate = (data) => {
    const schema = Joi.object({
        username: Joi.string().required().label("Username"),
        email: Joi.string().email().required().label("Email"),
        password: passwordComplexity().required().label("Password"),
        branch: Joi.string().optional().label("Branch"),
        pin: Joi.string().required().label("PIN"),
        contact: Joi.string().optional().label("Contact")
    });
    return schema.validate(data);
};

module.exports = { User, validate };