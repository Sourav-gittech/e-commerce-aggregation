const express = require("express");

const orderController = require("../controllers/orderController");

const router = express.Router();

router.post('/add', orderController.addOrder);
router.get('/', orderController.allOrders);

// section-1($lookup)
router.get('/userDetails', orderController.allOrdersWithUserDetails);
router.get('/productList', orderController.allOrdersWithProductListDetails);
router.get('/product', orderController.allOrdersWithProductInformation);
router.get('/summery', orderController.fullOrderSummery);
router.get('/payment', orderController.orderWithPayment);
router.get('/without-payment', orderController.orderWithPendingPayment);

// section-2($group)
router.get('/total-revenue', orderController.getTotalRevenueFromOrders);
router.get('/avg-Order', orderController.avgOrderValuePerUser);
router.get('/max-Order', orderController.getMaximumOrderAmount);
router.get('/status-count', orderController.orderByStatusWithCount);
router.get('/monthly-revenue', orderController.getMonthlyRevenue);

// section-3($group+$lookup)
router.get('/avg-order-category', orderController.getAvgOrderValuePerCategory);
router.get('/daily-revenue', orderController.getDailyRevenue);


module.exports = router;