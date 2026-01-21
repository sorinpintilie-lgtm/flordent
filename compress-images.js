const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Supported image formats
const supportedImageExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

async function compressImages() {
    try {
        const files = fs.readdirSync('.');
        
        const imageFiles = files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return supportedImageExtensions.includes(ext);
        });
        
        console.log(`Found ${imageFiles.length} images to compress`);
        
        for (const file of imageFiles) {
            const ext = path.extname(file).toLowerCase();
            const tempFile = `temp_${file}`;
            
            try {
                console.log(`Compressing ${file}...`);
                
                const image = sharp(file);
                
                if (ext === '.png') {
                    // Compress PNG
                    await image.png({ quality: 80 }).toFile(tempFile);
                } else if (ext === '.webp') {
                    // Compress WebP
                    await image.webp({ quality: 85 }).toFile(tempFile);
                } else {
                    // Compress JPEG
                    await image.jpeg({ quality: 80, progressive: true }).toFile(tempFile);
                }
                
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
        
        console.log('Image compression completed!');
    } catch (error) {
        console.error('Error:', error.message);
    }
}

compressImages();