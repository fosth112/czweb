const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { read, save } = require('soly-db');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

const PRODUCTS_LOCAL = 'products.json';
const STOCKS_LOCAL = 'stocks.json';

// Admin middleware to check if user has role=1
const requireAdmin = async (req, res, next) => {
    try {
        const users = read('users.json');
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

// Create product (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { name, image_url, price, status = 0 } = req.body;

        if (!name || !image_url || !price) {
            return res.json({
                success: false,
                message: 'กรุณากรอกข้อมูลให้ครบถ้วน'
            });
        }

        if (price <= 0) {
            return res.json({
                success: false,
                message: 'ราคาต้องมากกว่า 0'
            });
        }

        const products = read(PRODUCTS_LOCAL);
        
        const newProduct = {
            id: uuidv4(),
            name,
            image_url,
            status: status === 1 ? 1 : 0, // 0 = พร้อมจำหน่าย, 1 = ไม่พร้อมจำหน่าย
            price: parseFloat(price),
            timestamp: new Date().toISOString()
        };

        products.push(newProduct);
        save(PRODUCTS_LOCAL, products);

        res.json({
            success: true,
            message: 'สร้างสินค้าสำเร็จ',
            product: newProduct
        });

    } catch (error) {
        console.error('Create product error:', error);
        res.json({
            success: false,
            message: 'เกิดข้อผิดพลาดในระบบ'
        });
    }
});

// Get all products (public)
router.get('/', async (req, res) => {
    try {
        const products = read(PRODUCTS_LOCAL);
        const stocks = read(STOCKS_LOCAL);

        // Add stock count to each product (count active stocks only)
        const productsWithStockCount = products.map(product => {
            const productStocks = stocks.filter(stock => 
                stock.id_product === product.id && stock.status === 0
            );
            const totalStockCount = productStocks.length; // Count active stock entries
            
            return {
                ...product,
                stock: totalStockCount
            };
        });

        res.json({
            success: true,
            message: 'ดึงข้อมูลสินค้าสำเร็จ',
            products: productsWithStockCount
        });

    } catch (error) {
        console.error('Get products error:', error);
        res.json({
            success: false,
            message: 'เกิดข้อผิดพลาดในระบบ'
        });
    }
});

// Get product by ID (public)
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const products = read(PRODUCTS_LOCAL);
        const stocks = read(STOCKS_LOCAL);

        const product = products.find(p => p.id === id);
        
        if (!product) {
            return res.json({
                success: false,
                message: 'ไม่พบสินค้า'
            });
        }

        // Count active stocks for this product
        const productStocks = stocks.filter(stock => 
            stock.id_product === id && stock.status === 0
        );
        const totalStockCount = productStocks.length;

        const productWithStockCount = {
            ...product,
            stock: totalStockCount
        };

        res.json({
            success: true,
            message: 'ดึงข้อมูลสินค้าสำเร็จ',
            product: productWithStockCount
        });

    } catch (error) {
        console.error('Get product by ID error:', error);
        res.json({
            success: false,
            message: 'เกิดข้อผิดพลาดในระบบ'
        });
    }
});

// Get product with stock details (public)
router.get('/:id/with-stocks', async (req, res) => {
    try {
        const { id } = req.params;
        const products = read(PRODUCTS_LOCAL);
        const stocks = read(STOCKS_LOCAL);

        const product = products.find(p => p.id === id);
        
        if (!product) {
            return res.json({
                success: false,
                message: 'ไม่พบสินค้า'
            });
        }

        // Get all stock entries for this product
        const productStocks = stocks.filter(stock => stock.id_product === id);
        const activeStockCount = productStocks.filter(stock => stock.status === 0).length;

        const productWithStocks = {
            ...product,
            stock: activeStockCount,
            stocks: productStocks
        };

        res.json({
            success: true,
            message: 'ดึงข้อมูลสินค้าและสต็อกสำเร็จ',
            product: productWithStocks
        });

    } catch (error) {
        console.error('Get product with stocks error:', error);
        res.json({
            success: false,
            message: 'เกิดข้อผิดพลาดในระบบ'
        });
    }
});

// Update product (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, image_url, price, status } = req.body;

        const products = read(PRODUCTS_LOCAL);
        const productIndex = products.findIndex(p => p.id === id);

        if (productIndex === -1) {
            return res.json({
                success: false,
                message: 'ไม่พบสินค้า'
            });
        }

        const updatedProduct = {
            ...products[productIndex],
            ...(name && { name }),
            ...(image_url && { image_url }),
            ...(price && { price: parseFloat(price) }),
            ...(status !== undefined && { status: status === 1 ? 1 : 0 })
        };

        products[productIndex] = updatedProduct;
        save(PRODUCTS_LOCAL, products);

        res.json({
            success: true,
            message: 'อัปเดตสินค้าสำเร็จ',
            product: updatedProduct
        });

    } catch (error) {
        console.error('Update product error:', error);
        res.json({
            success: false,
            message: 'เกิดข้อผิดพลาดในระบบ'
        });
    }
});

// Delete product (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const products = read(PRODUCTS_LOCAL);
        const stocks = read(STOCKS_LOCAL);

        const productIndex = products.findIndex(p => p.id === id);

        if (productIndex === -1) {
            return res.json({
                success: false,
                message: 'ไม่พบสินค้า'
            });
        }

        // Remove product
        products.splice(productIndex, 1);
        save(PRODUCTS_LOCAL, products);

        // Remove related stocks
        const updatedStocks = stocks.filter(stock => stock.id_product !== id);
        save(STOCKS_LOCAL, updatedStocks);

        res.json({
            success: true,
            message: 'ลบสินค้าสำเร็จ'
        });

    } catch (error) {
        console.error('Delete product error:', error);
        res.json({
            success: false,
            message: 'เกิดข้อผิดพลาดในระบบ'
        });
    }
});

// Add stock (admin only) - Accepts stock data object
router.post('/:id/stock', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const stockData = req.body; // Now accepts stock data object

        if (!stockData || !stockData.stock) {
            return res.json({
                success: false,
                message: 'ข้อมูลสต็อกไม่ถูกต้อง'
            });
        }

        const products = read(PRODUCTS_LOCAL);
        const stocks = read(STOCKS_LOCAL);

        const product = products.find(p => p.id === id);
        if (!product) {
            return res.json({
                success: false,
                message: 'ไม่พบสินค้า'
            });
        }

        const newStock = {
            id: uuidv4(),
            id_product: id,
            stock: stockData.stock, // URL/string
            status: stockData.status || 0, // 0 = active, 1 = inactive
            timespame: new Date().toISOString(),
            ...stockData // Include any additional stock data
        };

        stocks.push(newStock);
        save(STOCKS_LOCAL, stocks);

        res.json({
            success: true,
            message: 'เพิ่มสต็อกสำเร็จ',
            stock: newStock
        });

    } catch (error) {
        console.error('Add stock error:', error);
        res.json({
            success: false,
            message: 'เกิดข้อผิดพลาดในระบบ'
        });
    }
});

// Get stock by product ID (admin only)
router.get('/:id/stock', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const stocks = read(STOCKS_LOCAL);

        const productStocks = stocks.filter(stock => stock.id_product === id);

        res.json({
            success: true,
            message: 'ดึงข้อมูลสต็อกสำเร็จ',
            stocks: productStocks
        });

    } catch (error) {
        console.error('Get stock error:', error);
        res.json({
            success: false,
            message: 'เกิดข้อผิดพลาดในระบบ'
        });
    }
});

// Delete stock by ID (admin only)
router.delete('/stock/:stockId', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { stockId } = req.params;
        const stocks = read(STOCKS_LOCAL);

        const stockIndex = stocks.findIndex(s => s.id === stockId);

        if (stockIndex === -1) {
            return res.json({
                success: false,
                message: 'ไม่พบสต็อก'
            });
        }

        stocks.splice(stockIndex, 1);
        save(STOCKS_LOCAL, stocks);

        res.json({
            success: true,
            message: 'ลบสต็อกสำเร็จ'
        });

    } catch (error) {
        console.error('Delete stock error:', error);
        res.json({
            success: false,
            message: 'เกิดข้อผิดพลาดในระบบ'
        });
    }
});

module.exports = router; 