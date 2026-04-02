const ffmpeg = require('ffmpeg-static');
const path = require('path');
const { execSync } = require('child_process');

console.log('--- R3NDER Music Diagnostic System ---');
console.log('Static FFmpeg Path:', ffmpeg);

if (ffmpeg) {
    const ffmpegDir = path.dirname(ffmpeg);
    process.env.PATH = `${ffmpegDir}${path.delimiter}${process.env.PATH}`;
    process.env.FFMPEG_PATH = ffmpeg;
    process.env.FFMPEG_BIN = ffmpeg;
    
    console.log('Updated process.env.PATH with FFmpeg directory.');
} else {
    console.warn('FFmpeg static path not found!');
}

try {
    const version = execSync('ffmpeg -version').toString().split('\n')[0];
    console.log('FFmpeg Verification Success:', version);
} catch (err) {
    console.error('FFmpeg Verification FAILED:', err.message);
    console.log('\nSuggested Solution:\n1. Ensure "ffmpeg-static" is installed.\n2. Try running "npm install ffmpeg-static" again.');
}

console.log('--- End of Diagnostic ---');
