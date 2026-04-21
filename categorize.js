const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const inputFolder = "./output/full";      // folder gambar asli
const outputFolder = "./rename-out";    // folder output baru

/*// buat folder output jika belum ada
if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder, { recursive: true });
}*/

// ambil daftar file, urutkan secara alfabet
let files = fs.readdirSync(inputFolder)
  .filter(file => file.match(/\.(jpg|jpeg|png|webp)$/i))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

let countPortrait = 0;
let countLandscape = 0;

console.log(`📂 Processing ${files.length} images...\n`);

files.forEach(async (file) => {
  const inputPath = path.join(inputFolder, file);

  try {
    const metadata = await sharp(inputPath).metadata();

    let newName;
    if (metadata.height > metadata.width) {
      countPortrait++;
      newName = `portrait_${countPortrait}${path.extname(file)}`;
    } else if (metadata.width > metadata.height) {
      countLandscape++;
      newName = `landscape_${countLandscape}${path.extname(file)}`;
    } else {
      // square (opsional)
      newName = `square_${file}`;
    }

    const outputPath = path.join(outputFolder, newName);

    // simpan file baru (tanpa resize)
    await sharp(inputPath)
      .rotate() // perbaiki EXIF orientation
      .toFile(outputPath);

    console.log(`✔ ${file} → ${newName}`);
  } catch (err) {
    console.error(`❌ Error: ${file}`, err);
  }
});