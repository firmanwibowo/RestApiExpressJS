// NAME: Firman Wibowo, EMAIL: firmanwibowo77@gmail.com, GITHUB: https://github.com/firmanwibowo

const express = require('express');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');

const app = express();
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');

app.use(express.json()); // Untuk mengurai data JSON
app.use(express.urlencoded({ extended: true })); // Untuk mengurai data URL-encoded

// Secret key untuk JWT (harus aman, jangan letakkan di sini)
const secretKey = 'firman';

//----------------------------------------------------------------------------------START KONEKSI DATABASE----------------------------------------------------------------------//
// Konfigurasi koneksi MySQL
const db = mysql.createConnection({
  host: 'localhost',     
  user: 'root',       
  password: '',   
  database: 'dump-dbtestbe-20230905162' 
});

// Membuka koneksi ke MySQL
db.connect((err) => {
  if (err) {
    console.error('Koneksi ke MySQL gagal: ' + err.stack);
    return;
  }
    console.log('Terhubung ke MySQL dengan ID koneksi ' + db.threadId);
});
//----------------------------------------------------------------------------------END KONEKSI DATABASE----------------------------------------------------------------------//


//----------------------------------------------------------------------------------START LOGIN----------------------------------------------------------------------//
app.post('/auth/login',  (req, res) => {
      const { username, password } = req.body;
      const sql = `select * from msuser where usr_username = '${username}'`;
      db.query(sql, (err, data) => {
        try {
          if(data.length === 0){
            res.status(404).json({
              "code": 404,
              "status": "error",
              "message": "Data not found",
              "error_exception": "",
              "data": [
                {
                  "msg": "User Tidak Terdaftar"
                }
              ]
            });
          } else {
            const user = data[0]
            bcrypt.compare(password, user.usr_pswd).then((passwordMatch) => { //password123
              if (passwordMatch) {
                const token = jwt.sign({ userId: user.usr_username }, secretKey, { expiresIn: '1h' });
                const responseData = {
                  code: 200,
                  status: "success",
                  data: {
                    token: token
                  }
                };
                res.status(200).json(responseData); 
              } else {
                res.status(400).json({
                  "code": 400,
                  "status": "error",
                  "message": "Bad request",
                  "error_exception": "",
                  "data": [
                    {
                      "msg": "Username/password tidak sesuai"
                    }
                  ]
                });
              }
            });
          } 
        } catch (error) {
          // Kirim respons kesalahan
          res.status(500).json({
            code: 500,
            status: 'error',
            message: 'Internal Server Error',
          });
        }
    });
}); 

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
 

  if (token == null) {
    return res.status(401).json({ "code": 401, "status": "error", "message": "Unauthorized" });
  }
 
  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.sendStatus(403); // Forbidden
    }

    // Set data pengguna dalam req.user
    req.user = user;

    next();
  });
}

//----------------------------------------------------------------------------------EBD LOGIN----------------------------------------------------------------------// 


//----------------------------------------------------------------------------------START REFRESH TOKEN----------------------------------------------------------------------//
// Middleware untuk verifikasi token
function verifyToken(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ "code": 401, "status": "error", "message": "Unauthorized" });
  }

  // Menghapus "Bearer " dari awalan token
  const tokenWithoutBearer = token.replace('Bearer ', '');

  jwt.verify(tokenWithoutBearer, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ "code": 401, "status": "error", "message": "Invalid token" });
    }

    // Jika token valid, set data pengguna dalam req.user
    req.user = decoded;
    next();
  });
}

app.get('/auth/me-login', verifyToken, (req, res) => {
  try {
    const user = req.user;
    const newToken = jwt.sign({ userId: user.userId }, secretKey, { expiresIn: '1h' });
    const sql = `select 
                  usr_username,
                  usr_fullname,
                  usr_foto,
                  usr_tgllahir,
                  usr_datacreated
                from 
                msuser  where usr_username = '${user.userId}'`;
        db.query(sql, (err, data) => {
          const responseData = {
            code: 200,
            status: "success",
            message: "Berhasil mendapatkan data",
            data: {
              usr_username: data[0].usr_username,
              usr_fullname: data[0].usr_fullname,
              usr_foto: data[0].usr_foto,
              usr_tgllahir: data[0].usr_tgllahir,
              usr_datacreated: data[0].usr_datacreated,
              token: newToken
            }
          };
          res.status(200).json(responseData); 
        });
    } catch (error) {
      // Kirim respons kesalahan
      res.status(500).json({
        code: 500,
        status: 'error',
        message: 'Internal Server Error',
      });
    }
});
//----------------------------------------------------------------------------------END REFRESH TOKEN----------------------------------------------------------------------//


app.get('/daftar-pinjaman-lewat-batas',authenticateToken,(req,res) =>{
//app.get('/daftar-pinjaman-lewat-batas',(req,res) =>{
    const sql = 'select pjm_no,pjm_usr_id,pjm_tglpinjam,pjm_tglkembali,pjm_judulbuku,pjm_jumlah,DATE_ADD(pjm_tglpinjam, INTERVAL 14 DAY) as pjm_tglbataswaktu from trpinjamanbuku where pjm_tglkembali is null and DATE_ADD(pjm_tglpinjam, INTERVAL 14 DAY) < current_date()';
    db.query(sql, (err, data) => {
      try {
        if(data.length === 0){
            res.status(404).json({
                "code": 404,
                "status": "error",
                "message": "Data not found",
                "error_exception": "",
                "data": [
                  {
                    "msg": "Data Tidak Ditemukan"
                  }
                ]
              });
        } else {
            res.json({
                "code": 200,
                "status": "success",
                "message": "Berhasil mendapatkan data",
                data
              });
        }
      } catch (error) {
        // Kirim respons kesalahan
        res.status(500).json({
          code: 500,
          status: 'error',
          message: 'Internal Server Error',
        });
      }
    });
});

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

app.post('/profile/edit-foto', upload.single('image'), (req, res)  =>{
  const userId = req.body.userId;
  const image = `/uploads/${req.file.filename}`;

  const updateQuery = `UPDATE msuser SET usr_foto = ? WHERE usr_username = ?`;

  // Parameter untuk query UPDATE
  const updateValues = [image, userId];

  db.query(updateQuery, updateValues, (updateErr, updateResult) => {
    try {
      res.status(200).json({
        code: 200,
        status: 'success',
        message: 'Berhasil memperbarui data',
        imageUrl: `/uploads/${req.file.filename}`, // URL gambar yang baru diunggah
      });
    } catch (error) {
      // Tangani kesalahan jika ada
      res.status(500).json({
        code: 500,
        status: 'error',
        message: 'Internal Server Error',
        error: error.message,
      });
    }

  });
});

app.listen(4040,()=>{
    console.log('listening to port 4040');
})