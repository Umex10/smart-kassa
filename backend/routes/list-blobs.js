import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { del, list, put } from "@vercel/blob";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const router = express.Router();

/**
 * To get the .pdf files of the bills
 * @returns {Object} response - the whole response Object containing Information and all files (Also the Bills Marker)
 * @returns {Array} actualFiles - the pdf. files that are the bills (without marker File/Object)
 * @author Casper Zielinski
 */
router.get("/invoices", authenticateToken, async (req, res) => {
  try {
    /**
     * @todo in the future use user id to identify if user is company owner or not, if owner, change prfix to
     * `Bills/${company_id}`, for employees: `Bills/${company_id}/${user_id}`
     */
    const user_id = req.user.userId;
    const company_id = req.user.companyId;

    const response = await list({
      token: process.env.BLOB_READ_WRITE_TOKEN,
      prefix: `Bills/${company_id}/${user_id}`,
    });

    const actualFiles = response.blobs.filter((blob) => blob.size > 0);

    res.status(200).send({
      response: response,
      actualFiles: actualFiles,
    });
  } catch (error) {
    console.error("Error fetching Blob for Invoices: ", error);
    res.status(500).send({ error: "Internal Server Error", path: "invoices" });
  }
});

router.post(
  "/invoices",
  authenticateToken,
  upload.single("newInvoice"),
  async (req, res) => {
    try {
      const user_id = req.user.userId;
      const company_id = req.user.companyId;

      const newInvoice = req.file;

      if (!newInvoice) {
        return res.status(400).send({
          error: "No File for the invoice provided",
          path: "invoices",
        });
      }

      const fileExtension = newInvoice.originalname
        .split(".")
        .pop()
        .toLocaleLowerCase();
      const filename = `Bills/${company_id}/${user_id}/${newInvoice.originalname}.${fileExtension}`;

      const response = await put(filename, newInvoice.buffer, {
        addRandomSuffix: true,
        token: process.env.BLOB_READ_WRITE_TOKEN,
        access: "public",
        allowOverwrite: false,
      });

      return res
        .status(200)
        .send({ response: response, newInvoice: newInvoice });
    } catch (error) {
      console.error("Error appending new Bill", error);
      res
        .status(500)
        .send({ error: "Internal Server Error", path: "invoices" });
    }
  }
);

router.get("/avatar", authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.userId;

    const response = await list({
      token: process.env.BLOB_READ_WRITE_TOKEN,
      prefix: `Profile_Picture/${user_id}`,
    });

    const actualFiles = response.blobs.filter((blob) => blob.size > 0);

    return res
      .status(200)
      .setHeader("Cache-Control", "no-cache, no-store, must-revalidate")
      .send({
        response: response,
        actualFiles: actualFiles,
      });
  } catch (error) {
    console.error("Error fetching blob for Avatar: ", error);
    return res.status(500).send({ error: error });
  }
});

router.put(
  "/avatar",
  authenticateToken,
  upload.single("newAvatar"),
  async (req, res) => {
    try {
      const user_id = req.user.userId;
      //const userId = req.user.userId;
      const newAvatar = req.file;

      if (!newAvatar) {
        return res
          .status(400)
          .send({ error: "Keine Datei im Request gefunden." });
      }

      // Alte Avatare fetchen
      const existingBlobs = await list({
        token: process.env.BLOB_READ_WRITE_TOKEN,
        prefix: `Profile_Picture/${user_id}`,
      });

      const urlsToDelete = existingBlobs.blobs.map((blob) => blob.url);

      // Delete all old Profile Pictures
      if (urlsToDelete.length > 0) {
        await del(urlsToDelete, {
          token: process.env.BLOB_READ_WRITE_TOKEN,
        });
      }

      const timeStamp = Date.now();

      // Get file extension from the uploaded file
      const fileExtension = newAvatar.originalname
        .split(".")
        .pop()
        .toLowerCase();
      const filename = `Profile_Picture/${user_id}/avatar_${timeStamp}.${fileExtension}`;

      const response = await put(filename, newAvatar.buffer, {
        token: process.env.BLOB_READ_WRITE_TOKEN,
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: true,
      });

      return res.status(200).send({
        response: response,
        url: response.url,
      });
    } catch (error) {
      console.error("Error uploading avatar to blob:", error);
      return res
        .status(500)
        .send({ error: "Internal Server Error", details: error.message });
    }
  }
);

export default router;
