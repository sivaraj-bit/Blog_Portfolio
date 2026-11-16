
const admin = require("../config/firebaseAdmin");
const Admin = require("../models/Admin");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Access denied. No token provided.",
      });
    }

    const token = authHeader.split(" ")[1];

    // Verify Firebase ID token
    const decodedToken = await admin.verifyIdToken(token);

    // Check whether this Firebase UID belongs to an authorized admin
    const existingAdmin = await Admin.findOne({
      firebaseUid: decodedToken.uid,
    });

    if (!existingAdmin) {
      return res.status(403).json({
        message: "Access denied. Admin permission required.",
      });
    }

    req.adminId = existingAdmin._id;
    req.firebaseUid = decodedToken.uid;

    next();
  } catch (error) {
    console.error("Authentication Error:", error.message);

    return res.status(401).json({
      message: "Invalid or expired Firebase token.",
    });
  }
};

module.exports = authMiddleware;
