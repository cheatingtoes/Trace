
const express = require('express');
const router = express.Router();
const { ALLOWED_MIME_TYPES } = require('../constants/mediaTypes');
const { getPresignedUploadUrl } = require('../services/PhotoService');

/**
 * @swagger
 * /media/presigned-url:
 *   get:
 *     summary: Get a presigned URL for uploading a file to S3
 *     parameters:
 *       - in: query
 *         name: fileName
 *         schema:
 *           type: string
 *         required: true
 *         description: The name of the file to be uploaded
 *       - in: query
 *         name: fileType
 *         schema:
 *           type: string
 *         required: true
 *         description: The MIME type of the file to be uploaded
 *     responses:
 *       200:
 *         description: A presigned URL
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 presignedUrl:
 *                   type: string
 *       500:
 *         description: Server error
 */

router.get('/presigned-url', async (req, res) => {
  const { activityId, fileName, fileType } = req.query;

  if (!activityId || !fileName || !fileType) {
    return res.status(400).send('Missing activityId, fileName, or fileType query parameter');
  }

  // SECURITY CHECK: Whitelist Validation
  if (!ALLOWED_MIME_TYPES.includes(fileType)) {
      return res.status(400).json({ 
          error: `File type ${fileType} is not supported. Upload images, video, or audio recordings only.` 
      });
  }

  try {
    const { signedUrl, key } = await getPresignedUploadUrl(activityId, fileName, fileType);
    res.json({ presignedUrl: signedUrl, key: key });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error generating presigned URL');
  }
});

module.exports = router;
