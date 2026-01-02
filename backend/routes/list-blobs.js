import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import multer from "multer";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const router = express.Router();

// S3 Client für Railway Buckets
const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
  forcePathStyle: false, // Railway nutzt virtual-hosted style
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME;

/**
 * To get the .pdf files of the bills
 */
router.get("/invoices", authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.userId;
    const company_id = req.user.companyId;

    const listCommand = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: `Bills/${company_id}/${user_id}/`,
    });

    const response = await s3Client.send(listCommand);

    // Filter nur echte Files (keine Ordner-Marker)
    const actualFiles = (response.Contents || []).filter(
      (item) => item.Size > 0
    );

    // Presigned URLs generieren (7 Tage für RKSV Compliance)
    const filesWithUrls = await Promise.all(
      actualFiles.map(async (file) => {
        const url = await getSignedUrl(
          s3Client,
          new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: file.Key,
          }),
          { expiresIn: 7 * 24 * 60 * 60 } // 7 Tage
        );

        return {
          key: file.Key,
          size: file.Size,
          lastModified: file.LastModified,
          url: url,
        };
      })
    );

    res.status(200).send({
      files: filesWithUrls,
      count: filesWithUrls.length,
    });
  } catch (error) {
    console.error("Error fetching invoices from S3:", error);
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

      // Zeitstempel für unique filename
      const timestamp = Date.now();
      const filename = `Bills/${company_id}/${user_id}/${timestamp}_${newInvoice.originalname}`;

      const putCommand = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: filename,
        Body: newInvoice.buffer,
        ContentType: newInvoice.mimetype,
      });

      await s3Client.send(putCommand);

      // Presigned URL für Response
      const url = await getSignedUrl(
        s3Client,
        new GetObjectCommand({
          Bucket: BUCKET_NAME,
          Key: filename,
        }),
        { expiresIn: 7 * 24 * 60 * 60 }
      );

      return res.status(200).send({
        message: "Invoice uploaded successfully",
        key: filename,
        url: url,
        size: newInvoice.size,
        lastModified: new Date(timestamp),
      });
    } catch (error) {
      console.error("Error uploading invoice to S3:", error);
      res
        .status(500)
        .send({ error: "Internal Server Error", path: "invoices" });
    }
  }
);

router.get("/avatar", authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.userId;

    const listCommand = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: `Profile_Picture/${user_id}/`,
    });

    const response = await s3Client.send(listCommand);
    const actualFiles = (response.Contents || []).filter(
      (item) => item.Size > 0
    );

    // Presigned URLs generieren (1 Stunde für Avatare)
    const filesWithUrls = await Promise.all(
      actualFiles.map(async (file) => {
        const url = await getSignedUrl(
          s3Client,
          new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: file.Key,
          }),
          { expiresIn: 3600 } // 1 Stunde
        );

        return {
          key: file.Key,
          url: url,
        };
      })
    );

    return res
      .status(200)
      .setHeader("Cache-Control", "no-cache, no-store, must-revalidate")
      .send({
        files: filesWithUrls,
      });
  } catch (error) {
    console.error("Error fetching avatar from S3:", error);
    return res.status(500).send({ error: error.message });
  }
});

router.put(
  "/avatar",
  authenticateToken,
  upload.single("newAvatar"),
  async (req, res) => {
    try {
      const user_id = req.user.userId;
      const newAvatar = req.file;

      if (!newAvatar) {
        return res
          .status(400)
          .send({ error: "Keine Datei im Request gefunden." });
      }

      // Alte Avatare fetchen
      const listCommand = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: `Profile_Picture/${user_id}/`,
      });

      const existingBlobs = await s3Client.send(listCommand);

      // Alte Avatare löschen
      if (existingBlobs.Contents && existingBlobs.Contents.length > 0) {
        await Promise.all(
          existingBlobs.Contents.map(async (file) => {
            const deleteCommand = new DeleteObjectCommand({
              Bucket: BUCKET_NAME,
              Key: file.Key,
            });
            await s3Client.send(deleteCommand);
          })
        );
      }

      const timeStamp = Date.now();
      const fileExtension = newAvatar.originalname
        .split(".")
        .pop()
        .toLowerCase();
      const filename = `Profile_Picture/${user_id}/avatar_${timeStamp}.${fileExtension}`;

      // Neuen Avatar hochladen
      const putCommand = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: filename,
        Body: newAvatar.buffer,
        ContentType: newAvatar.mimetype,
      });

      await s3Client.send(putCommand);

      // Presigned URL generieren
      const url = await getSignedUrl(
        s3Client,
        new GetObjectCommand({
          Bucket: BUCKET_NAME,
          Key: filename,
        }),
        { expiresIn: 3600 }
      );

      return res.status(200).send({
        message: "Avatar uploaded successfully",
        url: url,
        key: filename,
      });
    } catch (error) {
      console.error("Error uploading avatar to S3:", error);
      return res
        .status(500)
        .send({ error: "Internal Server Error", details: error.message });
    }
  }
);

export default router;
