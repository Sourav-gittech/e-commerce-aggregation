const express = require("express");

const paymentController = require("../controllers/paymentController");

const router = express.Router();

router.post('/add', paymentController.addPayment);

module.exports = router;