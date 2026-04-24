// src/middleware/auth.js
const jwt = require('jsonwebtoken');

function protect(req, res, next) {
  // 1. Read the Authorization header
  const authHeader = req.headers['authorization'];

  // 2. Header must exist and start with 'Bearer '
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  // 3. Extract the token (remove 'Bearer ' prefix)
  const token = authHeader.split(' ')[1];

  try {
    // 4. Verify and decode
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // 5. Attach decoded payload to request for downstream use
    req.user = decoded; // { userId, role, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

module.exports = protect;
