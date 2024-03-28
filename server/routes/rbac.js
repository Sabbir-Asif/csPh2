const express = require("express");
const router = express.Router();
const Role = require("../models/role");

// In-memory store for permissions. In a real app, use a database.
let availablePermissions = [
    "create_user", "delete_user", "view_all_users", 
    "manage_settings", "approve_accounts", "view_sensitive_data"
];

// Define a role
router.post("/roles", async (req, res) => {
    try {
        const role = new Role(req.body);
        await role.save();
        res.status(201).send(role);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Get all roles
router.get("/roles", async (req, res) => {
    try {
        const roles = await Role.find();
        res.status(200).send(roles);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Get all permissions
router.get("/permissions", (req, res) => {
    res.json(availablePermissions);
});

// Add a new permission
router.post("/permissions", (req, res) => {
    const { permission } = req.body;
    if (!permission) {
        return res.status(400).send({ message: "Permission name is required." });
    }
    if (availablePermissions.includes(permission)) {
        return res.status(409).send({ message: "Permission already exists." });
    }
    availablePermissions.push(permission);
    res.status(201).send({ message: "Permission added successfully.", permissions: availablePermissions });
});

// Assign permissions to a role
// Assign permissions to a role by roleId
router.put("/roles/:roleId/permissions", async (req, res) => {
    try {
        const { roleId } = req.params; // Get roleId from URL params
        const { permissions } = req.body;

        // Ensure all specified permissions exist
        const allPermissionsExist = permissions.every(p => availablePermissions.includes(p));
        if (!allPermissionsExist) {
            return res.status(400).send({ message: "One or more permissions do not exist." });
        }

        // Find and update the role by roleId instead of _id
        const role = await Role.findOneAndUpdate({ roleId: parseInt(roleId) }, { $set: { permissions: permissions }}, { new: true });
        if (!role) {
            return res.status(404).send({ message: "Role not found." });
        }
        res.send(role);
    } catch (error) {
        res.status(400).send(error);
    }
});


module.exports = router;
