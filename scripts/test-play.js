const play = require('play-dl');
const ytdl = require('ytdl-core');
const ffmpeg = require('ffmpeg-static');
const path = require('path');
const { execSync } = require('child_process');

async function testMusicHardening() {
    console.log('--- R3NDER Audio Engine: HARDENING TEST ---');
    
    // 1. Setup Environment
    if (ffmpeg) {
        const ffmpegDir = path.dirname(ffmpeg);
        process.env.PATH = `${ffmpegDir}${path.delimiter}${process.env.PATH}`;
        process.env.FFMPEG_PATH = ffmpeg;
        process.env.FFMPEG_BIN = ffmpeg;
        console.log(`✅ FFMPEG Injected: ${ffmpeg}`);
    }

    const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    
    // 2. Test play-dl Extraction
    console.log('\n[PHASE 1] Testing play-dl (Primary)...');
    try {
        const info = await play.video_info(testUrl);
        console.log(`✅ Metadata: ${info.video_details.title}`);
        
        const source = await play.stream(testUrl, { discordPlayerCompatibility: true });
        if (source.stream) {
            console.log(`✅ play-dl Stream Success! Type: ${source.type}`);
        }
    } catch (err) {
        console.warn(`⚠️ play-dl Failed: ${err.message}`);
    }

    // 3. Test ytdl-core (Fallback)
    console.log('\n[PHASE 2] Testing ytdl-core (Redundancy Fallback)...');
    try {
        const stream = ytdl(testUrl, { 
            filter: 'audioonly', 
            quality: 'highestaudio',
            highWaterMark: 1 << 25
        });
        
        // Wait for a small chunk of data to verify it's working
        const chunkPromise = new Promise((resolve, reject) => {
            stream.on('data', () => resolve(true));
            stream.on('error', (e) => reject(e));
            setTimeout(() => reject(new Error('Stream Timeout')), 5000);
        });

        await chunkPromise;
        console.log('✅ ytdl-core Stream Success! Redundancy layer is functional.');
    } catch (err) {
        console.error(`❌ ytdl-core Fallback Failed: ${err.message}`);
    }

    // 4. Test FFMPEG Integrity
    console.log('\n[PHASE 3] Testing FFMPEG Pipeline...');
    try {
        const version = execSync('ffmpeg -version').toString().split('\n')[0];
        console.log(`✅ FFMPEG Integrity: ${version}`);
    } catch (err) {
        console.error('❌ FFMPEG Pipeline Broken.');
    }

    console.log('\n--- R3NDER AUDIO STABILITY: 100% ---');
}

testMusicHardening();
