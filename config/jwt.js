
const jwt = require('jsonwebtoken');

const secretKey = 'firman';

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

module.exports = {
    authenticateToken,
    verifyToken,
    jwt,
    secretKey
  };