const express = require("express");

const userController = require("../controllers/userController");

const router = express.Router();

router.post('/add', userController.addUser);
router.get('/', userController.allUser);

// section-1($lookup)
router.get('/orderdetails', userController.getAllUserWithOrder);
router.get('/one-Order', userController.getUserplacedOneOrder);
router.get('/no-Order', userController.getUserNaverplacedOrder);
router.get('/latest-Order', userController.getUserWithLatestOrder);

// section-2($group)
router.get('/total-Order', userController.getTotalOrderNumberPerUser);
router.get('/top5-spending', userController.topFiveUserByTotalSpending);
router.get('/duplicate', userController.findDuplicateUser);

// section-3($group+$lookup)
router.get('/spending', userController.calculateTotalSpendingUserWise);
router.get('/spending/:amount', userController.FindUserOfSpendingGreaterThenAmount);
router.get('/total-spending/details', userController.userTotalSpendingWithDetails);
router.get('/top3-order', userController.getTotalOrderNumberPerUserGreaterThan3);


module.exports = router;