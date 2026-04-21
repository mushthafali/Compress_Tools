const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const inputFolder = "./input";
const outputFull = "./output/full";
const outputThumb = "./output/thumb";

// buat folder output jika belum ada
[outputFull, outputThumb].forEach(folder => {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }
});

// ambil semua file gambar
const files = fs.readdirSync(inputFolder).filter(file => file.match(/\.(jpg|jpeg|png)$/i));
console.log(`🚀 Processing ${files.length} images...\n`);

files.forEach(file => {
  const inputPath = path.join(inputFolder, file);
  const fileName = path.parse(file).name;

  // =========================
  // FULL IMAGE (HIGH QUALITY)
  // =========================
  sharp(inputPath)
    .rotate() // ← fix EXIF orientation otomatis
    .resize({
      width: 1920,
      kernel: sharp.kernel.lanczos3,
      withoutEnlargement: true
    })
    .sharpen({ sigma: 1.2 }) // anti blur
    .webp({
      quality: 80,
      effort: 4
    })
    .toFile(path.join(outputFull, `${fileName}.webp`))
    .then(() => console.log(`✔ Full  : ${file}`))
    .catch(err => console.error(`❌ Full Error: ${file}`, err));

  /*  
  // =========================
  // THUMBNAIL (LIGHTWEIGHT)
  // =========================
  sharp(inputPath)
    .rotate() // ← fix EXIF orientation otomatis
    .resize({
      width: 1200,
      kernel: sharp.kernel.lanczos3,
      withoutEnlargement: true
    })
    .sharpen({ sigma: 1.0 }) // sedikit lebih ringan
    .webp({
      quality: 70,
      effort: 4
    })
    .toFile(path.join(outputThumb, `${fileName}.webp`))
    .then(() => console.log(`✔ Thumb : ${file}`))
    .catch(err => console.error(`❌ Thumb Error: ${file}`, err));
    */
});