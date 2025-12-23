const IMAGE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif',
    'image/tiff',
    'image/avif',
    'image/gif'
];

const VIDEO_TYPES = [
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
    'video/webm',
    'video/mpeg',
    'video/3gpp'
];

const AUDIO_TYPES = [
    'audio/mpeg',
    'audio/mp4',
    'audio/wav',
    'audio/webm',
    'audio/ogg',
    'audio/aac'
];

const GPX_TYPES = [
    'application/gpx+xml',
];

const ALLOWED_MIME_TYPES = [
    ...IMAGE_TYPES,
    ...VIDEO_TYPES,
    ...AUDIO_TYPES
];

const MAX_GPX_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

const isGpx = (mimeType, fileName) => {
    const lowerCaseFileName = fileName.toLowerCase();
    return GPX_TYPES.includes(mimeType) || lowerCaseFileName.endsWith('.gpx');
};

module.exports = {
    IMAGE_TYPES,
    VIDEO_TYPES,
    AUDIO_TYPES,
    ALLOWED_MIME_TYPES,
    GPX_TYPES,
    MAX_GPX_SIZE_BYTES,
    isGpx
};