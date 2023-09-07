// config/db.js
const mysql = require('mysql2')

const dbConfig = {
    host: 'localhost',     
    user: 'root',       
    password: '',   
    database: 'dump-dbtestbe-20230905162' 
};

const db = mysql.createConnection(dbConfig);

db.connect(err => {
  if (err) {
    console.error('Error koneksi ke database:', err);
  } else {
    console.log('Terhubung ke database');
  }
});

module.exports = db;