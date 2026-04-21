const fs = require("fs");
const path = require("path");

// daftar folder yang ingin dibersihkan
const folders = [
  "./input",
  "./output/thumb",
  "./output/full",
  "./rename-in",
  "./rename-out"
];

folders.forEach(folder => {
  if (fs.existsSync(folder)) {
    const files = fs.readdirSync(folder);
    files.forEach(file => {
      const filePath = path.join(folder, file);
      if (fs.lstatSync(filePath).isFile()) {
        fs.unlinkSync(filePath); // hapus file
        console.log(`🗑️ Deleted: ${filePath}`);
      }
      // opsional: jika ada subfolder, bisa tambahkan recursion
    });
    console.log(`✅ Folder cleaned: ${folder}\n`);
  } else {
    console.log(`⚠️ Folder not found: ${folder}`);
  }
});

console.log("🎯 All folders cleaned!");