const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { read, save } = require('soly-db');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

const TOPUP_CODES_LOCAL = 'topup_codes.json';
const TOPUP_HISTORY_LOCAL = 'topup_history.json';
const USERS_LOCAL = 'users.json';

const requireAdmin = async (req, res, next) => {
    try {
        const users = read(USERS_LOCAL);
        const user = users.find(u => u.id === req.user.id);
        
        if (!user || user.role !== 1) {
            return res.json({
                success: false,
                message: 'ไม่มีสิทธิ์เข้าถึง'
            });
        }
        
        next();
    } catch (error) {
        console.error('Admin check error:', error);
        res.json({
            success: false,
            message: 'เกิดข้อผิดพลาดในระบบ'
        });
    }
};

router.post('/generate', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { amount, quantity = 1 } = req.body;

        if (!amount || amount <= 0) {
            return res.json({
                success: false,
                message: 'กรุณาระบุจำนวนเงินที่ถูกต้อง'
            });
        }

        if (quantity <= 0 || quantity > 100) {
            return res.json({
                success: false,
                message: 'จำนวนโค้ดต้องอยู่ระหว่าง 1-100'
            });
        }

        const topupCodes = read(TOPUP_CODES_LOCAL);
        const newCodes = [];

        for (let i = 0; i < quantity; i++) {
            const code = generateTopupCode();
            const newCode = {
                id: uuidv4(),
                code: code,
                amount: amount,
                status: 0, // 0 = ยังไม่ได้ใช้, 1 = ใช้แล้ว
                timestamp: new Date().toISOString()
            };
            newCodes.push(newCode);
        }

        topupCodes.push(...newCodes);
        save(TOPUP_CODES_LOCAL, topupCodes);

        res.json({
            success: true,
            message: `สร้างโค้ดเติมเงินสำเร็จ ${quantity} โค้ด`,
            codes: newCodes.map(c => ({ code: c.code, amount: c.amount }))
        });

    } catch (error) {
        console.error('Generate topup codes error:', error);
        res.json({
            success: false,
            message: 'เกิดข้อผิดพลาดในระบบ'
        });
    }
});

// Use topup code
router.post('/redeem', authenticateToken, async (req, res) => {
    try {
        const { code } = req.body;
        const userId = req.user.id;

        if (!code) {
            return res.json({
                success: false,
                message: 'กรุณากรอกโค้ดเติมเงิน'
            });
        }

        const topupCodes = read(TOPUP_CODES_LOCAL);
        const users = read(USERS_LOCAL);
        const topupHistory = read(TOPUP_HISTORY_LOCAL);

        // Find the code
        const codeIndex = topupCodes.findIndex(c => c.code === code);
        
        if (codeIndex === -1) {
            return res.json({
                success: false,
                message: 'โค้ดเติมเงินไม่ถูกต้อง'
            });
        }

        const topupCode = topupCodes[codeIndex];

        // Check if code is already used
        if (topupCode.status === 1) {
            return res.json({
                success: false,
                message: 'โค้ดเติมเงินนี้ถูกใช้แล้ว'
            });
        }

        // Find user
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex === -1) {
            return res.json({
                success: false,
                message: 'ไม่พบข้อมูลผู้ใช้'
            });
        }

        const user = users[userIndex];

        // Update user points (initialize if not exists)
        if (!user.points) {
            user.points = 0;
        }
        user.points += topupCode.amount;

        // Mark code as used
        topupCode.status = 1;
        topupCode.usedBy = userId;
        topupCode.usedAt = new Date().toISOString();

        // Save topup history
        const historyEntry = {
            id: uuidv4(),
            userId: userId,
            username: user.username,
            code: code,
            amount: topupCode.amount,
            timestamp: new Date().toISOString()
        };
        topupHistory.push(historyEntry);

        // Save all changes
        save(TOPUP_CODES_LOCAL, topupCodes);
        save(USERS_LOCAL, users);
        save(TOPUP_HISTORY_LOCAL, topupHistory);

        res.json({
            success: true,
            message: `เติมเงินสำเร็จ ${topupCode.amount} บาท`,
            points: user.points
        });

    } catch (error) {
        console.error('Redeem topup code error:', error);
        res.json({
            success: false,
            message: 'เกิดข้อผิดพลาดในระบบ'
        });
    }
});

// Get user's topup history
router.get('/history', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const topupHistory = read(TOPUP_HISTORY_LOCAL);

        const userHistory = topupHistory
            .filter(h => h.userId === userId)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        res.json({
            success: true,
            message: 'ดึงประวัติการเติมเงินสำเร็จ',
            history: userHistory
        });

    } catch (error) {
        console.error('Get topup history error:', error);
        res.json({
            success: false,
            message: 'เกิดข้อผิดพลาดในระบบ'
        });
    }
});

// Get user's current points
router.get('/points', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const users = read(USERS_LOCAL);

        const user = users.find(u => u.id === userId);
        if (!user) {
            return res.json({
                success: false,
                message: 'ไม่พบข้อมูลผู้ใช้'
            });
        }

        res.json({
            success: true,
            message: 'ดึงข้อมูลคะแนนสำเร็จ',
            points: user.points || 0
        });

    } catch (error) {
        console.error('Get user points error:', error);
        res.json({
            success: false,
            message: 'เกิดข้อผิดพลาดในระบบ'
        });
    }
});

// Get all topup codes (admin function)
router.get('/codes', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const topupCodes = read(TOPUP_CODES_LOCAL);
        
        res.json({
            success: true,
            message: 'ดึงข้อมูลโค้ดเติมเงินสำเร็จ',
            codes: topupCodes
        });

    } catch (error) {
        console.error('Get topup codes error:', error);
        res.json({
            success: false,
            message: 'เกิดข้อผิดพลาดในระบบ'
        });
    }
});

// Helper function to generate unique topup codes
function generateTopupCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

module.exports = router; 