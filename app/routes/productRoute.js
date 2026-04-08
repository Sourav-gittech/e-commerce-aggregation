const express = require('express');

const productController = require('./../controllers/productController');

const router = express.Router();

router.post('/add', productController.addProduct);
router.get('/', productController.allProducts);

// section-2($group)
router.get('/sold-product-per-category', productController.countProductSoldPerCategory);
router.get('/sold-product', productController.countTotalQuantitySoldProductWise);

// section-3($group+$lookup)
router.get('/top-selling-product', productController.topSellingProduct);

module.exports = router;