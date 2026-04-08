const mongoose = require('mongoose');

const productModel = require("../models/productModel");
const orderModel = require("../models/orderModel");
const orderItemModel = require("../models/orderItemModel");
const STATUS_CODE = require("../utils/statusCode");

class ProductController {

    async addProduct(req, res) {
        try {
            const { name, category, price, stock } = req.body;

            if (!name || !category || !price || !stock) {
                return res.status(STATUS_CODE.NOT_FOUND).json({
                    success: false,
                    message: 'All fields are required'
                });
            }

            const existingProduct = await productModel.findOne({ name });

            if (existingProduct) {
                return res.status(STATUS_CODE.FORBIDDEN).json({
                    success: false,
                    message: 'Product already available'
                })
            }
            else {
                const productObj = new productModel({ name, category, price, stock });

                const product = await productObj.save();

                return res.status(STATUS_CODE.CREATED).json({
                    success: true,
                    message: 'Product added successfully',
                    data: product
                })
            }
        }
        catch (err) {
            return res.status(STATUS_CODE.SERVER_ERROR).json({
                success: false,
                message: err.message
            });
        }
    }

    async allProducts(req, res) {
        try {
            const product = await productModel.find();

            return res.status(STATUS_CODE.OK).json({
                success: true,
                message: 'Product List',
                data: product
            })
        }
        catch (err) {
            return res.status(STATUS_CODE.SERVER_ERROR).json({
                success: false,
                message: err.message
            });
        }
    }

    async countProductSoldPerCategory(req, res) {
        try {

            const product = await orderModel.aggregate([
                {
                    $match: {
                        "status": "completed"
                    }
                },
                {
                    $lookup: {
                        from: "orderitems",
                        localField: "_id",
                        foreignField: "orderId",
                        as: "order-items"
                    }
                },
                {
                    $unwind: "$order-items"
                },
                {
                    $lookup: {
                        from: "products",
                        foreignField: "_id",
                        localField: "order-items.productId",
                        as: "products"
                    }
                },
                {
                    $unwind: "$products"
                },
                {
                    $group: {
                        _id: "$products.category",
                        count: {
                            $sum: "$order-items.quantity"
                        }
                    }
                }
            ])
            return res.status(STATUS_CODE.OK).json({
                success: true,
                message: 'Sold product count by category',
                data: product
            })
        }
        catch (err) {
            return res.status(STATUS_CODE.SERVER_ERROR).json({
                success: false,
                message: err.message
            });
        }
    }

    async countTotalQuantitySoldProductWise(req, res) {
        try {

            const product = await orderModel.aggregate([
                {
                    $match: {
                        "status": "completed"
                    }
                },
                {
                    $lookup: {
                        from: "orderitems",
                        localField: "_id",
                        foreignField: "orderId",
                        as: "order-items"
                    }
                },
                {
                    $unwind: "$order-items"
                },
                {
                    $lookup: {
                        from: "products",
                        localField: "order-items.productId",
                        foreignField: "_id",
                        as: "products"
                    }
                },
                {
                    $unwind: "$products"
                },
                {
                    $group: {
                        _id: "$products._id",
                        sold_item: { $sum: "$order-items.quantity" }
                    }
                }
            ])

            return res.status(STATUS_CODE.OK).json({
                success: true,
                message: 'Sold product count by product',
                data: product
            })
        }
        catch (err) {
            return res.status(STATUS_CODE.SERVER_ERROR).json({
                success: false,
                message: err.message
            });
        }
    }

    async topSellingProduct(req, res) {
        try {

            const product = await orderModel.aggregate([
                {
                    $match: {
                        "status": "completed"
                    }
                },
                {
                    $lookup: {
                        from: "orderitems",
                        localField: "_id",
                        foreignField: "orderId",
                        as: "order-items"
                    }
                },
                {
                    $unwind: "$order-items"
                },
                {
                    $lookup: {
                        from: "products",
                        localField: "order-items.productId",
                        foreignField: "_id",
                        as: "product"
                    }
                },
                {
                    $unwind: "$product"
                },
                {
                    $group: {
                        _id: "$product._id",
                        name: { $first: "$product.name" },
                        soldItems: { $sum: "$order-items.quantity" }
                    }
                },
                {
                    $sort: {
                        "soldItems": -1
                    }
                },
                {
                    $limit: 1
                }
            ])
            return res.status(STATUS_CODE.OK).json({
                success: true,
                message: 'Top selling product',
                data: product
            })
        }
        catch (err) {
            return res.status(STATUS_CODE.SERVER_ERROR).json({
                success: false,
                message: err.message
            });
        }
    }
}

module.exports = new ProductController();