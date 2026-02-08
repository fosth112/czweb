const jwt = require('jsonwebtoken');

require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;

const authenticateToken = (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.json({ 
            success: false, 
            message: 'กรุณาเข้าสู่ระบบ' 
        });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.json({ 
                success: false, 
                message: 'โทเค็นไม่ถูกต้องหรือหมดอายุ' 
            });
        }
        req.user = user;
        next();
    });
};

module.exports = authenticateToken