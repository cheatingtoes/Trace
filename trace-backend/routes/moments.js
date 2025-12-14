
const express = require('express');
const router = express.Router();
const AWS = require('aws-sdk');

// Configure the AWS SDK
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  endpoint: process.env.S3_ENDPOINT, // This is for local development with MinIO
  s3ForcePathStyle: true, // Needed for MinIO
});

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
router.get('/presigned-url', (req, res) => {
  const { fileName, fileType } = req.query;

  if (!fileName || !fileType) {
    return res.status(400).send('Missing fileName or fileType query parameter');
  }

  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileName,
    ContentType: fileType,
    Expires: 60 * 5, // 5 minutes
  };

  s3.getSignedUrl('putObject', params, (err, url) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error generating presigned URL');
    }
    res.json({ presignedUrl: url });
  });
});

module.exports = router;
