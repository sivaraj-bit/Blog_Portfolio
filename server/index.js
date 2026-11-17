
const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Import files
const connectDB = require("./config/db");
const authRoutes = require("./Routes/authRoutes");
const blogRoutes = require("./Routes/blogRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Authentication routes
app.use("/api/auth", authRoutes);

// Blog routes
app.use("/api/blogs", blogRoutes);

// Home route
app.get("/", (req, res) => {
  res.send("Blog Portfolio API is running!");
});

// Server configuration
const PORT = process.env.PORT || 5000;

// Start server
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();
