const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images');

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(fullPath));
    } else if (file.endsWith('.jpg') || file.endsWith('.png')) {
      results.push(fullPath);
    }
  });
  return results;
}

async function optimizeAll() {
  const files = getFiles(IMAGES_DIR);
  console.log(`Found ${files.length} images to optimize.`);

  let totalBefore = 0;
  let totalAfterJpg = 0;
  let totalWebp = 0;

  for (const file of files) {
    const originalSize = fs.statSync(file).size;
    totalBefore += originalSize;

    const parsed = path.parse(file);
    const isOccasion = file.includes('occasions');
    const isHero = file.includes('hero');
    const isProduct = file.includes('products');

    let targetWidth = 800;
    if (isOccasion) {
      targetWidth = 240; // High-DPI for 64px circle
    } else if (isHero) {
      targetWidth = 1200;
    } else if (isProduct) {
      targetWidth = 800;
    }

    const inputBuffer = fs.readFileSync(file);

    // 1. Generate WebP version
    const webpPath = path.join(parsed.dir, `${parsed.name}.webp`);
    await sharp(inputBuffer)
      .resize({ width: targetWidth, withoutEnlargement: true })
      .webp({ quality: 82, effort: 6 })
      .toFile(webpPath);
    const webpSize = fs.statSync(webpPath).size;
    totalWebp += webpSize;

    // 2. Re-compress the JPG in-place with mozjpeg
    const tempJpgPath = path.join(parsed.dir, `${parsed.name}_temp.jpg`);
    await sharp(inputBuffer)
      .resize({ width: targetWidth, withoutEnlargement: true })
      .jpeg({ quality: 80, mozjpeg: true })
      .toFile(tempJpgPath);
    
    fs.unlinkSync(file);
    fs.renameSync(tempJpgPath, file);
    const newJpgSize = fs.statSync(file).size;
    totalAfterJpg += newJpgSize;

    const relPath = path.relative(IMAGES_DIR, file);
    console.log(
      `✓ ${relPath}: ${(originalSize / 1024).toFixed(0)}KB -> JPG: ${(newJpgSize / 1024).toFixed(0)}KB (-${(
        (1 - newJpgSize / originalSize) *
        100
      ).toFixed(0)}%), WebP: ${(webpSize / 1024).toFixed(0)}KB (-${(
        (1 - webpSize / originalSize) *
        100
      ).toFixed(0)}%)`
    );
  }

  console.log('\n=======================================');
  console.log(`Total Original Size: ${(totalBefore / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`Total Optimized JPG: ${(totalAfterJpg / (1024 * 1024)).toFixed(2)} MB (-${((1 - totalAfterJpg / totalBefore) * 100).toFixed(0)}%)`);
  console.log(`Total Optimized WebP: ${(totalWebp / (1024 * 1024)).toFixed(2)} MB (-${((1 - totalWebp / totalBefore) * 100).toFixed(0)}%)`);
  console.log('=======================================');
}

optimizeAll().catch(console.error);
