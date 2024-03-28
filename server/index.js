require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const connection = require("./db");
const userRoutes = require("./routes/signup");
const authRoutes = require("./routes/login");
const passwordResetRoutes = require("./routes/passwordReset");
const addUser = require("./routes/addUser")

// database connection
connection();

// middlewares
app.use(express.json());
app.use(cors());

// routes
app.use("/admin", userRoutes);
app.use("/auth/login", authRoutes);
app.use("/auth/", passwordResetRoutes);
app.use("/create",addUser)

const port = process.env.PORT || 8080;
app.listen(port, console.log(`Listening on port ${port}...`));
