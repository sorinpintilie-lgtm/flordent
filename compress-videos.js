const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const ffmpegPath = require('ffmpeg-static');

// Supported video formats
const supportedVideoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv'];

function compressVideo(inputFile, outputFile) {
    return new Promise((resolve, reject) => {
        // FFmpeg command for compressing MP4 videos
        const command = `${ffmpegPath} -i "${inputFile}" -vcodec libx264 -crf 28 -preset medium -acodec aac -b:a 128k "${outputFile}"`;
        
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}

async function compressVideos() {
    try {
        const files = fs.readdirSync('.');
        
        const videoFiles = files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return supportedVideoExtensions.includes(ext);
        });
        
        console.log(`Found ${videoFiles.length} videos to compress`);
        
        for (const file of videoFiles) {
            const ext = path.extname(file).toLowerCase();
            const tempFile = `temp_${file}`;
            
            try {
                console.log(`Compressing ${file}...`);
                
                await compressVideo(file, tempFile);
                
                // Replace original file with compressed version
                fs.unlinkSync(file);
                fs.renameSync(tempFile, file);
                
                const compressedSize = fs.statSync(file).size;
                
                console.log(`✓ Compressed ${file}: ${(compressedSize / 1024 / 1024).toFixed(2)} MB`);
            } catch (error) {
                console.error(`Error compressing ${file}:`, error.message);
                // Clean up temp file if it exists
                if (fs.existsSync(tempFile)) {
                    fs.unlinkSync(tempFile);
                }
            }
        }
        
        console.log('Video compression completed!');
    } catch (error) {
        console.error('Error:', error.message);
    }
}

compressVideos();