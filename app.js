// NAME: Firman Wibowo, EMAIL: firmanwibowo77@gmail.com, GITHUB: https://github.com/firmanwibowo
// link untuk melihat dokumentasi -> http://localhost:4040/api-docs

//---------------------------------------start file path----------------------------//
const db = require('./config/db');
const jwtUtil = require('./config/jwt'); 
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
 *         description: OK. Autentikasi berhasil, token diterbitkan.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       '400':
 *         description: Permintaan tidak valid, username/password tidak sesuai.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 400
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Bad request
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                         example: Username/password tidak sesuai
 *       '404':
 *         description: Data pengguna tidak ditemukan.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 404
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Data not found
 *                 error_exception:
 *                   type: string
 *                   example: 
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                         example: User Tidak Terdaftar
 *       '500':
 *         description: Kesalahan internal server.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 500
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 *     security: []
 */

//----------------------------------------------------------------------------------START LOGIN----------------------------------------------------------------------//
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
//----------------------------------------------------------------------------------EBD LOGIN----------------------------------------------------------------------// 


//----------------------------------------------------------------------------------START REFRESH TOKEN----------------------------------------------------------------------//
/**
 * @swagger
 * /auth/me-login:
 *   get:
 *     summary: Refresh User Token
 *     description: Refreshes the user token and retrieves user data if the previous token is valid.
 *     tags:
 *       - Authentication
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully refreshed token and retrieved user data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 usr_username:
 *                   type: string
 *                   description: The username of the authenticated user.
 *                 usr_fullname:
 *                   type: string
 *                   description: The full name of the authenticated user.
 *                 usr_foto:
 *                   type: string
 *                   description: The user's profile picture URL.
 *                 usr_tgllahir:
 *                   type: string
 *                   description: The user's date of birth.
 *                 usr_datacreated:
 *                   type: string
 *                   description: The date when the user's data was created.
 *                 token:
 *                   type: string
 *                   description: The new JWT token.
 *         headers:
 *           Authorization:
 *             description: The refreshed JWT token.
 *             schema:
 *               type: string
 *               format: jwt
 *       401:
 *         description: Unauthorized. Invalid or expired token.
 *       500:
 *         description: Internal Server Error.
 */

app.get('/auth/me-login', jwtUtil.verifyToken, (req, res) => {
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
//----------------------------------------------------------------------------------END REFRESH TOKEN----------------------------------------------------------------------//
/**
 * @swagger
 * /daftar-pinjaman-lewat-batas:
 *   get:
 *     summary: Get Overdue Loans
 *     description: Retrieves a list of overdue loans where the return date has passed 14 days.
 *     tags:
 *       - Loan Management
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved a list of overdue loans.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   description: The HTTP status code.
 *                 status:
 *                   type: string
 *                   description: The status of the request.
 *                 message:
 *                   type: string
 *                   description: A message describing the result.
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       pjm_no:
 *                         type: integer
 *                         description: The loan number.
 *                       pjm_usr_id:
 *                         type: integer
 *                         description: The user ID associated with the loan.
 *                       pjm_tglpinjam:
 *                         type: string
 *                         format: date
 *                         description: The loan start date.
 *                       pjm_tglkembali:
 *                         type: string
 *                         format: date
 *                         description: The expected return date.
 *                       pjm_judulbuku:
 *                         type: string
 *                         description: The title of the borrowed book.
 *                       pjm_jumlah:
 *                         type: integer
 *                         description: The quantity of books borrowed.
 *                       pjm_tglbataswaktu:
 *                         type: string
 *                         format: date
 *                         description: The due date for returning the book.
 *         headers:
 *           Authorization:
 *             description: The Bearer token for authentication.
 *       404:
 *         description: No overdue loans found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   description: The HTTP status code.
 *                 status:
 *                   type: string
 *                   description: The status of the request.
 *                 message:
 *                   type: string
 *                   description: A message indicating that no overdue loans were found.
 *                 error_exception:
 *                   type: string
 *                   description: An error exception message (empty in this case).
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                         description: A message indicating that no data was found.
 *       500:
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   description: The HTTP status code.
 *                 status:
 *                   type: string
 *                   description: The status of the request.
 *                 message:
 *                   type: string
 *                   description: A message indicating an internal server error.
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
 *     security:
 *       - BearerAuth: []
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
 *               userId:
 *                 type: string
 *             required:
 *               - image
 *               - userId
 *     responses:
 *       '200':
 *         description: OK. Data berhasil diperbarui.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Berhasil memperbarui data
 *                 imageUrl:
 *                   type: string
 *                   example: /uploads/foto_baru.jpg
 *       '500':
 *         description: Kesalahan internal server.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 500
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 *                 error:
 *                   type: string
 *                   example: Terjadi kesalahan dalam pembaruan data.
 */
app.post('/profile/edit-foto', jwtUtil.authenticateToken,uploadUtil.upload.single('image'), (req, res)  =>{
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