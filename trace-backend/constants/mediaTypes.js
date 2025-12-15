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
    'audio/mpeg',  // .mp3
    'audio/mp4',   // .m4a (Apple Voice Memos)
    'audio/wav',
    'audio/webm',
    'audio/ogg',
    'audio/aac'
];

const ALLOWED_MIME_TYPES = [
    ...IMAGE_TYPES,
    ...VIDEO_TYPES,
    ...AUDIO_TYPES
];

module.exports = {
    IMAGE_TYPES,
    VIDEO_TYPES,
    AUDIO_TYPES,
    ALLOWED_MIME_TYPES
};