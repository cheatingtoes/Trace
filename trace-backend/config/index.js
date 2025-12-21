const dotenv = require('dotenv');
const envFound = dotenv.config();
const {
    InternalServerError,
 } = require('../errors/customErrors');

if (envFound.error) {
    throw new InternalServerError("⚠️  .env file not found  ⚠️");
}

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const config = {
    app: {
        port: parseInt(process.env.PORT, 10) || 3001,
        env: process.env.NODE_ENV || 'development',
        bypassAuth: process.env.BYPASS_AUTH === 'true',

    },
    db: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        name: process.env.DB_NAME,
        port: parseInt(process.env.DB_PORT, 10) || 5432,
    },
    redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    },
    s3: {
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
        region: process.env.AWS_REGION || 'us-east-1',
        bucketName: process.env.S3_BUCKET_NAME,
        endpoint: process.env.S3_ENDPOINT,
        publicEndpoint: process.env.S3_PUBLIC_ENDPOINT,
        forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
    },
    jwt: {
        accessSecret: process.env.JWT_ACCESS_SECRET,
        refreshSecret: process.env.JWT_REFRESH_SECRET,
        accessExpiration: '15m',
        refreshExpiration: '7d',
    }
};

// --- VALIDATION ---
if (!config.jwt.accessSecret || !config.jwt.refreshSecret) {
    throw new Error("FATAL ERROR: JWT secrets are missing in .env");
}

if (!config.db.host || !config.db.user || !config.db.name) {
    throw new Error("FATAL ERROR: One or more Database variables are missing in .env");
}

if (!config.s3.credentials.accessKeyId || !config.s3.bucketName) {
    throw new Error("FATAL ERROR: S3 configuration is incomplete in .env");
}

module.exports = config;