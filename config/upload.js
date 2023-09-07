const multer = require('multer');
const path = require('path');

// Konfigurasi penyimpanan berkas
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      // Menentukan direktori penyimpanan
      cb(null, './uploads'); // Simpan berkas di dalam folder "uploads"
    },
    filename: (req, file, cb) => {
      // Menentukan nama berkas yang disimpan
      const ext = path.extname(file.originalname);
      cb(null, `${Date.now()}${ext}`); // Nama berkas akan menjadi timestamp saat ini + ekstensi asli
    },
  });
  
  // Middleware multer untuk mengunggah berkas
  const upload = multer({ storage: storage });

  module.exports = {
    upload
  };