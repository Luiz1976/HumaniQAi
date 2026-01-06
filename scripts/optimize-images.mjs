import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
        } else {
            arrayOfFiles.push(fullPath);
        }
    });

    return arrayOfFiles;
}

const allFiles = getAllFiles('./public');
const images = allFiles.filter(f => f.match(/\.(png|jpg|jpeg)$/i) && !f.endsWith('.webp'));

console.log(`Found ${images.length} images to optimize.`);

async function convert() {
    let count = 0;
    for (const img of images) {
        const ext = path.extname(img);
        if (ext === '.svg') continue; // Skip svgs just in case regex matched weirdly

        const newPath = img.replace(new RegExp(ext + '$'), '.webp');

        // Skip if webp already exists and is newer? No, just overwrite for now or skip if exists to save time.
        if (fs.existsSync(newPath)) {
            // console.log(`Skipping existing: ${newPath}`);
            // continue;
        }

        try {
            await sharp(img).webp({ quality: 80 }).toFile(newPath);
            console.log(`✅ Converted: ${img} -> ${newPath}`);
            count++;
        } catch (e) {
            console.error(`❌ Error converting ${img}`, e);
        }
    }
    console.log(`\n🎉 Process complete! ${count} images converted to WebP.`);
}

convert();
