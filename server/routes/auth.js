const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { read, save } = require('soly-db');
require('dotenv').config();

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_NAME = 'token';
const USERS_LOCAL = 'users.json';

const authenticateToken = require('../middleware/auth');

router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.json({ 
                success: false, 
                message: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' 
            });
        }

        if (username.length < 3) {
            return res.json({ 
                success: false, 
                message: 'ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร' 
            });
        }

        if (password.length < 6) {
            return res.json({ 
                success: false, 
                message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' 
            });
        }

        const users = read(USERS_LOCAL);

        const existingUser = users.find(user => user.username === username);
        if (existingUser) {
            return res.json({ 
                success: false, 
                message: 'ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว' 
            });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = {
            id: uuidv4(),
            username,
            points: 0,
            role: 0,
            password: hashedPassword,
            timestamp: new Date().toISOString()
        };

        users.push(newUser);
        save(USERS_LOCAL, users);

        const token = jwt.sign(
            { 
                id: newUser.id, 
                username: newUser.username,
                points: newUser.points,
                role: newUser.role
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.cookie(COOKIE_NAME, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        const { password: _, ...userWithoutPassword } = newUser;
        res.json({
            success: true,
            message: 'ลงทะเบียนสำเร็จ',
            user: userWithoutPassword,
            token
        });

    } catch (error) {
        console.error('Register error:', error);
        res.json({ 
            success: false, 
            message: 'เกิดข้อผิดพลาดในระบบ' 
        });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.json({ 
                success: false, 
                message: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' 
            });
        }

        const users = read(USERS_LOCAL);

        const user = users.find(u => u.username === username);
        if (!user) {
            return res.json({ 
                success: false, 
                message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' 
            });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.json({ 
                success: false, 
                message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' 
            });
        }

        const token = jwt.sign(
            { 
                id: user.id, 
                username: user.username,
                points: user.points,
                role: user.role
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.cookie(COOKIE_NAME, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        const { password: _, ...userWithoutPassword } = user;
        res.json({
            success: true,
            message: 'เข้าสู่ระบบสำเร็จ',
            user: userWithoutPassword,
            token
        });

    } catch (error) {
        console.error('Login error:', error);
        res.json({ 
            success: false, 
            message: 'เกิดข้อผิดพลาดในระบบ' 
        });
    }
});

router.post('/logout', (req, res) => {
    res.clearCookie(COOKIE_NAME);
    res.json({ 
        success: true, 
        message: 'ออกจากระบบสำเร็จ' 
    });
});

router.get('/me', authenticateToken, (req, res) => {
    try {
        const users = read(USERS_LOCAL);
        const user = users.find(u => u.id === req.user.id);
        
        if (!user) {
            return res.json({
                success: false,
                message: 'ไม่พบข้อมูลผู้ใช้'
            });
        }

        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        
        res.json({
            success: true,
            message: 'ดึงข้อมูลผู้ใช้สำเร็จ',
            user: {
                ...userWithoutPassword,
                admin: user.role === 1
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.json({
            success: false,
            message: 'เกิดข้อผิดพลาดในระบบ'
        });
    }
});

router.get('/verify', authenticateToken, (req, res) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.json({ 
                success: false, 
            });
        }

        const users = read(USERS_LOCAL);
        const user = users.find(u => u.id === req.user.id);
        
        if (!user) {
            return res.json({ 
                success: false
            });
        }

        res.json({ 
            success: true,
            admin: user.role === 1
        });
    } catch (error) {
        console.error('Verify error:', error);
        res.json({ 
            success: false
        });
    }
});

module.exports = router;