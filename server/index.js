require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connection = require("./db");
const userRoutes = require("./routes/signup");
const authRoutes = require("./routes/login");
const passwordResetRoutes = require("./routes/passwordReset");
const addUser = require("./routes/addUser");
const rbacRoutes = require("./routes/rbac"); // Make sure this is required at the top
const profileRoutes = require('./routes/profile'); // Adjust the path as necessary

// Use profile routes

const app = express();

// database connection
connection();

// Middlewares
app.use(cors()); // CORS middleware
app.use(express.json()); // Apply express.json() as one of the first middlewares

// Routes
app.use("/admin", userRoutes);
app.use("/auth/login", authRoutes);
app.use("/auth/", passwordResetRoutes);
app.use("/users", addUser);
app.use("/rbac", rbacRoutes); // Use RBAC routes
app.use(profileRoutes);

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listening on port ${port}...`));
