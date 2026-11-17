
const express = require("express");
const router = express.Router();

const Blog = require("../models/Blog");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const cloudinary = require("../config/cloudinary");

// Upload image to Cloudinary
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "blog-portfolio",
        transformation: [
          {
            width: 1200,
            height: 800,
            crop: "limit",
          },
        ],
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve(result);
      }
    );

    stream.end(buffer);
  });
};

// CREATE BLOG
router.post(
  "/",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      const {
        title,
        content,
        category,
        projectUrl,
      } = req.body || {};

      if (!title || !content) {
        return res.status(400).json({
          message: "Title and content are required.",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          message: "Please upload a cover image.",
        });
      }

      const uploadedImage = await uploadToCloudinary(
        req.file.buffer
      );

      const newBlog = new Blog({
        title,
        content,
        category: category || "General",
        image: uploadedImage.secure_url,
        projectUrl: projectUrl || "",
      });

      const savedBlog = await newBlog.save();

      return res.status(201).json({
        message: "Blog created successfully.",
        blog: savedBlog,
      });
    } catch (error) {
      console.error("Create blog error:", error);

      return res.status(500).json({
        message: error.message || "Unable to create blog.",
      });
    }
  }
);

// GET ALL BLOGS (PUBLIC)
router.get("/", async (req, res) => {
  try {
    const blogs = await Blog.find().sort({
      createdAt: -1,
    });

    return res.status(200).json(blogs);
  } catch (error) {
    console.error("Get blogs error:", error);

    return res.status(500).json({
      message: "Unable to fetch blogs.",
    });
  }
});

// GET SINGLE BLOG (PUBLIC)
router.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        message: "Blog not found.",
      });
    }

    return res.status(200).json(blog);
  } catch (error) {
    console.error("Get single blog error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
});

// UPDATE BLOG
router.put(
  "/:id",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      const {
        title,
        content,
        category,
        projectUrl,
      } = req.body || {};

      const updateData = {
        title,
        content,
        category: category || "General",
        projectUrl: projectUrl || "",
      };

      // Upload a new image only if selected
      if (req.file) {
        const uploadedImage = await uploadToCloudinary(
          req.file.buffer
        );

        updateData.image = uploadedImage.secure_url;
      }

      const updatedBlog = await Blog.findByIdAndUpdate(
        req.params.id,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!updatedBlog) {
        return res.status(404).json({
          message: "Blog not found.",
        });
      }

      return res.status(200).json({
        message: "Blog updated successfully.",
        blog: updatedBlog,
      });
    } catch (error) {
      console.error("Update blog error:", error);

      return res.status(500).json({
        message: error.message || "Unable to update blog.",
      });
    }
  }
);

// DELETE BLOG
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const deletedBlog = await Blog.findByIdAndDelete(
      req.params.id
    );

    if (!deletedBlog) {
      return res.status(404).json({
        message: "Blog not found.",
      });
    }

    return res.status(200).json({
      message: "Blog deleted successfully.",
    });
  } catch (error) {
    console.error("Delete blog error:", error);

    return res.status(500).json({
      message: error.message || "Unable to delete blog.",
    });
  }
});

module.exports = router;
