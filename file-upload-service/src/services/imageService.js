const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

// Resize and compress image
const processImage = async (filePath) => {
  try {
    const maxWidth = parseInt(process.env.IMAGE_MAX_WIDTH) || 1920;
    const maxHeight = parseInt(process.env.IMAGE_MAX_HEIGHT) || 1920;
    
    await sharp(filePath)
      .resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 85 })
      .toFile(filePath + '.temp');
    
    // Replace original with processed
    await fs.unlink(filePath);
    await fs.rename(filePath + '.temp', filePath);
    
    console.log('✅ Image processed:', path.basename(filePath));
    return true;
  } catch (error) {
    console.error('❌ Image processing failed:', error);
    return false;
  }
};

// Create thumbnail
const createThumbnail = async (filePath) => {
  try {
    const thumbWidth = parseInt(process.env.THUMBNAIL_WIDTH) || 300;
    const thumbHeight = parseInt(process.env.THUMBNAIL_HEIGHT) || 300;
    
    const ext = path.extname(filePath);
    const thumbPath = filePath.replace(ext, `_thumb${ext}`);
    
    await sharp(filePath)
      .resize(thumbWidth, thumbHeight, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80 })
      .toFile(thumbPath);
    
    console.log('✅ Thumbnail created:', path.basename(thumbPath));
    return thumbPath;
  } catch (error) {
    console.error('❌ Thumbnail creation failed:', error);
    return null;
  }
};

module.exports = { processImage, createThumbnail };
