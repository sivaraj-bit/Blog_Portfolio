
const express = require("express");
const router = express.Router();

const Blog = require("../models/Blog");
const authMiddleware = require("../middleware/authMiddleware");

// Create a new blog - Admin only
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, content, image, category } = req.body;

    const newBlog = new Blog({
      title,
      content,
      image,
      category,
    });

    const savedBlog = await newBlog.save();

    res.status(201).json({
      message: "Blog created successfully",
      blog: savedBlog,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all blogs - Public
router.get("/", async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single blog - Public
router.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        message: "Blog not found",
      });
    }

    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Delete a blog - Admin only
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const deletedBlog = await Blog.findByIdAndDelete(req.params.id);

    if (!deletedBlog) {
      return res.status(404).json({
        message: "Blog not found",
      });
    }

    res.status(200).json({
      message: "Blog deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Update a blog - Admin only
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { title, content, image, category } = req.body;

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      { title, content, image, category },
      { new: true, runValidators: true }
    );

    if (!updatedBlog) {
      return res.status(404).json({
        message: "Blog not found",
      });
    }

    res.status(200).json({
      message: "Blog updated successfully",
      blog: updatedBlog,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;
