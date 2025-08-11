const express = require('express');
const router = express.Router();
const ipfsService = require('../services/ipfsService');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

/**
 * @swagger
 * tags:
 *   name: IPFS Storage
 *   description: Decentralized file storage and encryption
 */

/**
 * @swagger
 * /ipfs/upload:
 *   post:
 *     tags: [IPFS Storage]
 *     summary: Upload file to IPFS (public)
 *     description: Upload a file to IPFS for public access
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File to upload
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cid:
 *                   type: string
 *                   description: IPFS Content Identifier
 *                 url:
 *                   type: string
 *                   description: Accessible IPFS URL
 *       400:
 *         description: Bad request - file is required
 *       500:
 *         description: Server error
 */
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const cid = await ipfsService.uploadToIPFS(
      req.file.buffer,
      req.file.originalname
    );
    const url = `https://${cid}.ipfs.w3s.link/${req.file.originalname}`;

    res.json({
      cid: cid,
      url: url,
      filename: req.file.originalname,
      size: req.file.size,
    });
  } catch (error) {
    console.error('IPFS upload error:', error);
    res.status(500).json({ error: 'Failed to upload to IPFS' });
  }
});

/**
 * @swagger
 * /ipfs/upload/encrypted:
 *   post:
 *     tags: [IPFS Storage]
 *     summary: Upload encrypted file to IPFS
 *     description: Upload a file to IPFS with AES-256-GCM encryption
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - password
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File to upload
 *               password:
 *                 type: string
 *                 description: Encryption password
 *     responses:
 *       200:
 *         description: Encrypted file uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cid:
 *                   type: string
 *                   description: IPFS Content Identifier
 *                 encryptedUrl:
 *                   type: string
 *                   description: Accessible encrypted IPFS URL
 *                 filename:
 *                   type: string
 *                   description: Original filename
 *       400:
 *         description: Bad request - file and password are required
 *       500:
 *         description: Server error
 */
router.post('/upload/encrypted', upload.single('file'), async (req, res) => {
  try {
    if (!req.file || !req.body.password) {
      return res.status(400).json({ error: 'File and password are required' });
    }

    const cid = await ipfsService.uploadEncryptedToIPFS(
      req.file.buffer,
      req.file.originalname,
      req.body.password
    );
    const encryptedUrl = `https://${cid}.ipfs.w3s.link/${req.file.originalname}.encrypted`;

    res.json({
      cid: cid,
      encryptedUrl: encryptedUrl,
      filename: req.file.originalname,
      size: req.file.size,
      encrypted: true,
    });
  } catch (error) {
    console.error('Encrypted IPFS upload error:', error);
    res.status(500).json({ error: 'Failed to upload encrypted file to IPFS' });
  }
});

/**
 * @swagger
 * /ipfs/download/{cid}:
 *   get:
 *     tags: [IPFS Storage]
 *     summary: Download file from IPFS
 *     description: Download a file from IPFS using its CID
 *     parameters:
 *       - in: path
 *         name: cid
 *         required: true
 *         schema:
 *           type: string
 *         description: IPFS Content Identifier
 *     responses:
 *       200:
 *         description: File downloaded successfully
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: File not found
 *       500:
 *         description: Server error
 */
router.get('/download/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const fileData = await ipfsService.downloadFromIPFS(cid);

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${cid}"`);
    res.send(fileData);
  } catch (error) {
    console.error('IPFS download error:', error);
    res.status(500).json({ error: 'Failed to download from IPFS' });
  }
});

/**
 * @swagger
 * /ipfs/download/decrypt:
 *   post:
 *     tags: [IPFS Storage]
 *     summary: Download and decrypt file from IPFS
 *     description: Download an encrypted file from IPFS and decrypt it
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cid
 *               - password
 *             properties:
 *               cid:
 *                 type: string
 *                 description: IPFS Content Identifier
 *               password:
 *                 type: string
 *                 description: Decryption password
 *     responses:
 *       200:
 *         description: File downloaded and decrypted successfully
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Bad request - cid and password are required
 *       500:
 *         description: Server error
 */
router.post('/download/decrypt', async (req, res) => {
  try {
    const { cid, password } = req.body;
    if (!cid || !password) {
      return res.status(400).json({ error: 'CID and password are required' });
    }

    const decryptedData = await ipfsService.downloadAndDecryptFromIPFS(
      cid,
      password
    );

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="decrypted_${cid}"`
    );
    res.send(decryptedData);
  } catch (error) {
    console.error('IPFS decrypt error:', error);
    res.status(500).json({ error: 'Failed to decrypt file from IPFS' });
  }
});

/**
 * @swagger
 * /ipfs/info/{cid}:
 *   get:
 *     tags: [IPFS Storage]
 *     summary: Get file information from IPFS
 *     description: Retrieve metadata and information about a file stored on IPFS
 *     parameters:
 *       - in: path
 *         name: cid
 *         required: true
 *         schema:
 *           type: string
 *         description: IPFS Content Identifier
 *     responses:
 *       200:
 *         description: File information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cid:
 *                   type: string
 *                   description: IPFS Content Identifier
 *                 size:
 *                   type: number
 *                   description: File size in bytes
 *                 url:
 *                   type: string
 *                   description: Accessible IPFS URL
 *       404:
 *         description: File not found
 *       500:
 *         description: Server error
 */
router.get('/info/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const fileInfo = await ipfsService.getFileInfo(cid);
    res.json(fileInfo);
  } catch (error) {
    console.error('IPFS info error:', error);
    res.status(500).json({ error: 'Failed to get file info from IPFS' });
  }
});

module.exports = router;
