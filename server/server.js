const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

const authRoutes = require('./routes/auth');
const topupRoutes = require('./routes/topup');
const productRoutes = require('./routes/product');
const orderRoutes = require('./routes/order');

app.use('/auth', authRoutes);
app.use('/topup', topupRoutes);
app.use('/product', productRoutes);
app.use('/order', orderRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
