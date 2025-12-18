import express from "express";
import pool from "../db.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

/**
 * PUT /account/me
 * Updates authenticated user's profile data
 * Fields: name, email, image, theme
 * Uses access token
 */
router.put("/me", authenticateToken, async (req, res) => {
  const { name, email, image, theme } = req.body;
  const user_id = req.user.userId;

  // Validate theme if provided
  if (theme && !["light", "dark", "system"].includes(theme)) {
    return res.status(400).json({
      error: "Invalid theme",
      message: "Theme must be light, dark, or system",
    });
  }

  // Build dynamic update object
  const fields = [];
  const values = [];
  let index = 1;

  if (name) {
    fields.push(`name = $${index++}`);
    values.push(name);
  }

  if (email) {
    fields.push(`email = $${index++}`);
    values.push(email);
  }

  if (image) {
    fields.push(`image = $${index++}`);
    values.push(image);
  }

  if (theme) {
    fields.push(`theme = $${index++}`);
    values.push(theme);
  }

  if (fields.length === 0) {
    return res.status(400).json({
      error: "No data provided",
      message: "At least one field must be updated",
    });
  }

  try {
    const result = await pool.query(
      `UPDATE users SET ${fields.join(", ")} WHERE user_id = $${index}`,
      [...values, user_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    return res.status(200).json({
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

export default router;
