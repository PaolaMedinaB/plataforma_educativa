// middleware/authenticateToken.js
import jwt from 'jsonwebtoken';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, 'tu_secreto_jwt', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}


export default authenticateToken; 