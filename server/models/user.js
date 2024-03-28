const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

const userSchema = new mongoose.Schema({
    userId: { type: Number, },
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
   // Add this line in your userSchema object
    role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },

    branch: { type: String },
    pin: { type: String, required: true}
});

userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({ _id: this._id,role:this.role }, process.env.JWTPRIVATEKEY, {
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
        role: Joi.string().valid('admin', 'stsManager', 'landfilManager', 'unassigned').default('unassigned').label("Role"),
        branch: Joi.string().optional().label("Branch"),
        pin: Joi.string().required().label("PIN")
    });
    return schema.validate(data);
};

module.exports = { User, validate };
