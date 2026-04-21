const fs = require("fs");
const path = require("path");
const readline = require("readline");

// folder sumber
const sourceFolder = "./rename-out";

// target folder (misal Downloads)
const targetBase = path.join(require("os").homedir(), "Downloads/images-c");

// readline untuk input user
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// tanya nama folder baru
rl.question("Masukkan nama folder baru di Downloads: ", (folderName) => {
  if (!folderName) {
    console.log("❌ Nama folder tidak boleh kosong");
    rl.close();
    return;
  }

  const targetFolder = path.join(targetBase, folderName);

  // buat folder baru jika belum ada
  if (!fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder, { recursive: true });
    console.log(`✅ Folder baru dibuat: ${targetFolder}`);
  } else {
    console.log(`⚠️ Folder sudah ada: ${targetFolder}`);
  }

  // ambil semua file dari folder sumber
  const files = fs.readdirSync(sourceFolder);

  files.forEach(file => {
    const srcPath = path.join(sourceFolder, file);
    const destPath = path.join(targetFolder, file);

    // pindahkan file
    fs.renameSync(srcPath, destPath);
    console.log(`✔ Dipindahkan: ${file}`);
  });

  console.log(`🎯 Semua file dipindahkan ke ${targetFolder}`);
  rl.close();
});