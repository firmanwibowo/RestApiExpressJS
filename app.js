// NAME: Firman Wibowo, EMAIL: firmanwibowo77@gmail.com, GITHUB: https://github.com/firmanwibowo
// link untuk melihat dokumentasi -> http://localhost:4040/api-docs

//---------------------------------------start file path----------------------------//
const db = require('./config/db');
const jwtUtil = require('./config/jwt'); //pass : password123
const uploadUtil = require('./config/upload');
const swaggerUtil = require('./config/swagger');
//---------------------------------------end file path----------------------------//

//---------------------------------------start swagger path----------------------------//
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
//---------------------------------------start swagger path----------------------------//

const express = require('express');
const bcrypt = require('bcrypt');
const app = express();

app.use(express.json()); // Untuk mengurai data JSON
app.use(express.urlencoded({ extended: true })); // Untuk mengurai data URL-encoded

 // Initialize Swagger-jsdoc
const swaggerSpec = swaggerJSDoc(swaggerUtil.swaggerOptions);


// Serve the Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Masuk ke akun dengan username dan password.
 *     description: Mengautentikasi pengguna dengan mengirimkan data `username` dan `password` dalam body permintaan.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Nama pengguna (username).
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Kata sandi pengguna.
 *             required:
 *               - username
 *               - password
 *     responses:
 *       '200':
 *         description: Successfully.
 */

/**
 * @swagger
 * /auth/me-login:
 *   get:
 *     summary: Refresh User Token
 *     description: Refreshes the user token and retrieves user data if the previous token is valid.
 *     tags:
 *       - Authentication
*     securitySchemes:
 *        Bearer :
 *           type: apiKey
 *           description: JWT Authorization header using the Bearer scheme. Enter Bearer 
 *           name: Authorization
 *     responses:
 *       200:
 *         description: Successfully.
 *         headers:
 *           Authorization:
 *             description: The refreshed JWT token.
 *             schema:
 *               type: string
 *               format: jwt
 */

//----------------------------------------------------------------------------------Start Authentication----------------------------------------------------------------------//
app.post('/auth/login',  (req, res) => {
      const { username, password } = req.body;
      console.log(req.body)
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
                const token = jwtUtil.jwt.sign({ userId: user.usr_username }, jwtUtil.secretKey, { expiresIn: '1h' });
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

app.get('/auth/me-login', jwtUtil.verifyToken, (req, res) => {
  console.log(jwtUtil.verifyToken)
  try {
    const user = req.user;
    const newToken = jwtUtil.jwt.sign({ userId: user.userId }, jwtUtil.secretKey, { expiresIn: '1h' });
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
//----------------------------------------------------------------------------------End Authentication----------------------------------------------------------------------//

/**
 * @swagger
 * /daftar-pinjaman-lewat-batas:
 *   get:
 *     summary: Get Overdue Loans
 *     description: Retrieves a list of overdue loans where the return date has passed 14 days.
 *     tags:
 *       - Loan Management
 *     securitySchemes:
 *        Bearer :
 *           type: apiKey
 *           description: JWT Authorization header using the Bearer scheme. Enter Bearer 
 *           name: Authorization
 *     responses:
 *       200:
 *         description: Successfully.
 *         headers:
 *           Authorization:
 *             description: The Bearer token for authentication.
 */
app.get('/daftar-pinjaman-lewat-batas',jwtUtil.authenticateToken,(req,res) =>{
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

/**
 * @swagger
 * /profile/edit-foto:
 *   post:
 *     summary: Mengunggah dan mengupdate foto profil pengguna.
 *     description: Mengunggah foto profil pengguna dan mengupdate informasi foto profil di database.
 *     tags:
 *       - Profile
 *     securitySchemes:
 *        Bearer :
 *           type: apiKey
 *           description: JWT Authorization header using the Bearer scheme. Enter Bearer 
 *           name: Authorization
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *             required:
 *               - image
 *     responses:
 *       '200':
 *         description: Successfully
 */

app.post('/profile/edit-foto', jwtUtil.authenticateToken,uploadUtil.upload.single('image'), (req, res)  =>{
  const userId = req.user.userId;
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