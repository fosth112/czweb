const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { read, save } = require('soly-db');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

const PRODUCTS_LOCAL = 'products.json';
const STOCKS_LOCAL = 'stocks.json';
const USERS_LOCAL = 'users.json';
const ORDER_HISTORY_LOCAL = 'order_history.json';

// Admin middleware to check if user has role=1
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
        res.json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ' });
    }
};

// POST /order - Place an order
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;
        if (!productId || quantity <= 0) {
            return res.json({ success: false, message: 'ข้อมูลคำสั่งซื้อไม่ถูกต้อง' });
        }
        const products = read(PRODUCTS_LOCAL);
        const stocks = read(STOCKS_LOCAL);
        const users = read(USERS_LOCAL);
        const orderHistory = read(ORDER_HISTORY_LOCAL);

        const product = products.find(p => p.id === productId);
        if (!product) {
            return res.json({ success: false, message: 'ไม่พบสินค้า' });
        }
        if (product.status !== 0) {
            return res.json({ success: false, message: 'สินค้านี้ไม่พร้อมจำหน่าย' });
        }
        // Find available stocks (status=0)
        const availableStocks = stocks.filter(s => s.id_product === productId && s.status === 0);
        if (availableStocks.length < quantity) {
            return res.json({ success: false, message: 'สต็อกสินค้าไม่เพียงพอ' });
        }
        const userIndex = users.findIndex(u => u.id === req.user.id);
        if (userIndex === -1) {
            return res.json({ success: false, message: 'ไม่พบข้อมูลผู้ใช้' });
        }
        const user = users[userIndex];
        if (!user.points || user.points < product.price * quantity) {
            return res.json({ success: false, message: 'คะแนนของคุณไม่เพียงพอ' });
        }
        // Deduct points
        user.points -= product.price * quantity;
        // Update stocks status to 1 (used)
        const usedStocks = availableStocks.slice(0, quantity);
        for (const stock of usedStocks) {
            const stockIndex = stocks.findIndex(s => s.id === stock.id);
            if (stockIndex !== -1) {
                stocks[stockIndex].status = 1;
                stocks[stockIndex].usedBy = user.id;
                stocks[stockIndex].usedAt = new Date().toISOString();
            }
        }
        // Save order history
        const order = {
            id: uuidv4(),
            userId: user.id,
            username: user.username,
            productId: product.id,
            productName: product.name,
            productPrice: product.price,
            quantity,
            stocks: usedStocks.map(s => ({ id: s.id, stock: s.stock })),
            total: product.price * quantity,
            timestamp: new Date().toISOString()
        };
        orderHistory.push(order);
        // Save all
        save(USERS_LOCAL, users);
        save(STOCKS_LOCAL, stocks);
        save(ORDER_HISTORY_LOCAL, orderHistory);
        res.json({
            success: true,
            message: 'สั่งซื้อสินค้าสำเร็จ',
            order,
            stockData: usedStocks
        });
    } catch (error) {
        console.error('Order error:', error);
        res.json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ' });
    }
});

// GET /order/history - Get user's order history
router.get('/history', authenticateToken, async (req, res) => {
    try {
        const orderHistory = read(ORDER_HISTORY_LOCAL);
        const userOrders = orderHistory
            .filter(o => o.userId === req.user.id)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        res.json({
            success: true,
            message: 'ดึงประวัติการสั่งซื้อสำเร็จ',
            history: userOrders
        });
    } catch (error) {
        res.json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ' });
    }
});

// GET /order/:id - Get order detail (only own order or admin)
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const orderHistory = read(ORDER_HISTORY_LOCAL);
        const users = read(USERS_LOCAL);
        const order = orderHistory.find(o => o.id === id);
        if (!order) {
            return res.json({ success: false, message: 'ไม่พบข้อมูลคำสั่งซื้อ' });
        }
        // Only owner or admin can view
        const user = users.find(u => u.id === req.user.id);
        if (!user || (order.userId !== req.user.id && user.role !== 1)) {
            return res.json({ success: false, message: 'ไม่มีสิทธิ์เข้าถึง' });
        }
        res.json({
            success: true,
            message: 'ดึงข้อมูลคำสั่งซื้อสำเร็จ',
            order
        });
    } catch (error) {
        res.json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ' });
    }
});

module.exports = router; 