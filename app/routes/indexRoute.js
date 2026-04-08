const express = require("express");

const userRoute = require("./userRoute");
const productRoute = require("./productRoute");
const orderRoute = require("./orderRoute");
const paymentRoute = require("./paymentRoute");

const router = express.Router();

router.use('/user', userRoute);
router.use('/product', productRoute);
router.use('/order', orderRoute);
router.use('/payment', paymentRoute);

module.exports = router;