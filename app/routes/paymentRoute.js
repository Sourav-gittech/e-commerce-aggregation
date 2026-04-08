const express = require("express");

const paymentController = require("../controllers/paymentController");

const router = express.Router();

router.post('/add', paymentController.addPayment);

// section-3($group+$lookup)
router.get('/total-expense', paymentController.getPaidAmount);

module.exports = router;