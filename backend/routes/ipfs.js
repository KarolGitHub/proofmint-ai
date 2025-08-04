const express = require('express');
const router = express.Router();
const multer = require('multer');
const ipfsService = require('../services/ipfsService');
const { sendError } = require('../utils/errorResponse');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

/**
 * @swagger
 * /ipfs/upload:
 *   post:
 *     summary: Upload a file to IPFS (public)
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: File uploaded successfully
 */
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, 400, 'No file uploaded');
    }

    const { buffer, originalname, mimetype } = req.file;
    const result = await ipfsService.uploadToIPFS(
      buffer,
      originalname,
      mimetype
    );

    res.json(result);
  } catch (error) {
    console.error('IPFS upload error:', error);
    sendError(res, 500, 'Failed to upload to IPFS', error.message);
  }
});

/**
 * @swagger
 * /ipfs/upload/encrypted:
 *   post:
 *     summary: Upload an encrypted file to IPFS
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               encryptionKey:
 *                 type: string
 *                 description: Optional encryption key in hex format
 *     responses:
 *       200:
 *         description: Encrypted file uploaded successfully
 */
router.post('/upload/encrypted', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, 400, 'No file uploaded');
    }

    const { buffer, originalname, mimetype } = req.file;
    const { encryptionKey } = req.body;

    let key = null;
    if (encryptionKey) {
      try {
        key = Buffer.from(encryptionKey, 'hex');
      } catch (error) {
        return sendError(res, 400, 'Invalid encryption key format');
      }
    }

    const result = await ipfsService.uploadEncryptedToIPFS(
      buffer,
      originalname,
      mimetype,
      key
    );

    res.json(result);
  } catch (error) {
    console.error('Encrypted IPFS upload error:', error);
    sendError(
      res,
      500,
      'Failed to upload encrypted file to IPFS',
      error.message
    );
  }
});

/**
 * @swagger
 * /ipfs/download/{cid}:
 *   get:
 *     summary: Download a file from IPFS (public files)
 *     parameters:
 *       - in: path
 *         name: cid
 *         required: true
 *         schema:
 *           type: string
 *         description: IPFS CID
 *     responses:
 *       200:
 *         description: File downloaded successfully
 */
router.get('/download/:cid', async (req, res) => {
  try {
    const { cid } = req.params;

    if (!cid) {
      return sendError(res, 400, 'CID is required');
    }

    const result = await ipfsService.downloadFromIPFS(cid);

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="ipfs_${cid}"`);
    res.send(result.data);
  } catch (error) {
    console.error('IPFS download error:', error);
    sendError(res, 500, 'Failed to download from IPFS', error.message);
  }
});

/**
 * @swagger
 * /ipfs/download/encrypted/{cid}:
 *   post:
 *     summary: Download and decrypt a file from IPFS
 *     parameters:
 *       - in: path
 *         name: cid
 *         required: true
 *         schema:
 *           type: string
 *         description: IPFS CID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - encryptionKey
 *             properties:
 *               encryptionKey:
 *                 type: string
 *                 description: Encryption key in hex format
 *     responses:
 *       200:
 *         description: File downloaded and decrypted successfully
 */
router.post('/download/encrypted/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const { encryptionKey } = req.body;

    if (!cid) {
      return sendError(res, 400, 'CID is required');
    }

    if (!encryptionKey) {
      return sendError(res, 400, 'Encryption key is required');
    }

    const result = await ipfsService.downloadAndDecryptFromIPFS(
      cid,
      encryptionKey
    );

    res.setHeader(
      'Content-Type',
      result.contentType || 'application/octet-stream'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${result.fileName}"`
    );
    res.send(result.data);
  } catch (error) {
    console.error('IPFS download and decrypt error:', error);
    sendError(
      res,
      500,
      'Failed to download and decrypt from IPFS',
      error.message
    );
  }
});

/**
 * @swagger
 * /ipfs/info/{cid}:
 *   get:
 *     summary: Get file information from IPFS
 *     parameters:
 *       - in: path
 *         name: cid
 *         required: true
 *         schema:
 *           type: string
 *         description: IPFS CID
 *     responses:
 *       200:
 *         description: File information retrieved successfully
 */
router.get('/info/:cid', async (req, res) => {
  try {
    const { cid } = req.params;

    if (!cid) {
      return sendError(res, 400, 'CID is required');
    }

    const result = await ipfsService.getFileInfo(cid);

    res.json(result);
  } catch (error) {
    console.error('IPFS file info error:', error);
    sendError(res, 500, 'Failed to get file info from IPFS', error.message);
  }
});

/**
 * @swagger
 * /ipfs/generate-key:
 *   post:
 *     summary: Generate a new encryption key
 *     responses:
 *       200:
 *         description: Encryption key generated successfully
 */
router.post('/generate-key', (req, res) => {
  try {
    const key = ipfsService.generateEncryptionKey();
    res.json({
      success: true,
      encryptionKey: key.toString('hex'),
      keyLength: key.length * 8, // bits
    });
  } catch (error) {
    console.error('Key generation error:', error);
    sendError(res, 500, 'Failed to generate encryption key', error.message);
  }
});

module.exports = router;
