
const express = require("express");
const admin = require("../config/firebaseAdmin");
const Admin = require("../models/Admin");

const router = express.Router();

// POST /api/auth/register
// Only the email configured in ADMIN_EMAIL can become an admin.
router.post("/register", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Firebase token is required.",
      });
    }

    const token = authHeader.split(" ")[1];

    // Verify Firebase ID token
    const decodedToken = await admin.verifyIdToken(token);
    
    const email = decodedToken.email?.toLowerCase();
    const firebaseUid = decodedToken.uid;
    const allowedEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

    if (!email || !allowedEmail || email !== allowedEmail) {
      return res.status(403).json({
        message: "This account is not authorized as an admin.",
      });
    }

    // Check whether this admin already exists
    let existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      existingAdmin.firebaseUid = firebaseUid;
      await existingAdmin.save();
    } else {
      existingAdmin = await Admin.create({
        email,
        firebaseUid,
      });
    }

    return res.status(200).json({
      message: "Admin account verified successfully.",
      admin: {
        id: existingAdmin._id,
        email: existingAdmin.email,
      },
    });
  } catch (error) {
    console.error("Admin Registration Error:", error.message);

    return res.status(401).json({
      message: "Admin registration failed. Invalid Firebase token.",
    });
  }
});

module.exports = router;
