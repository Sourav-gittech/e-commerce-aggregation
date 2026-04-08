const mongoose = require("mongoose");

const orderModel = require("../models/orderModel");
const orderItemModel = require("../models/orderItemModel");
const productModel = require("../models/productModel");

const STATUS_CODE = require("../utils/statusCode");

class OrderController {

    async addOrder(req, res) {
        try {
            const { userId, productId, quantity } = req.body;

            if (!userId || !productId || !quantity) {
                return res.status(STATUS_CODE.NOT_FOUND).json({
                    success: false,
                    message: 'All fields required'
                });
            }

            else {
                const productDetails = await productModel.findById(productId);

                if (!productDetails) {
                    return res.status(STATUS_CODE.BAD_GATEWAY).json({
                        success: false,
                        message: 'No product found'
                    });
                }
                else {

                    if (productDetails.stock < quantity) {
                        return res.status(STATUS_CODE.BAD_GATEWAY).json({
                            success: false,
                            message: 'The quantity not available'
                        });
                    }
                    else {

                        const orderObj = new orderModel({ userId, totalAmount: productDetails.price * quantity });

                        const order = await orderObj.save();

                        if (order) {
                            const orderItemObj = new orderItemModel({ orderId: order._id, productId, quantity, price: productDetails.price });

                            const orderItem = await orderItemObj.save();
                        }
                        return res.status(STATUS_CODE.CREATED).json({
                            success: true,
                            message: 'Order created successfully',
                            data: order
                        });
                    }
                }
            }
        }
        catch (err) {
            return res.status(STATUS_CODE.SERVER_ERROR).json({
                success: false,
                message: err.message
            });
        }
    }

    async allOrders(req, res) {
        try {
            const order = await orderModel.find();

            return res.status(STATUS_CODE.OK).json({
                success: true,
                message: 'Order list',
                data: order
            });
        }
        catch (err) {
            return res.status(STATUS_CODE.SERVER_ERROR).json({
                success: false,
                message: err.message
            });
        }
    }

    async allOrdersWithUserDetails(req, res) {
        try {
            const order = await orderModel.aggregate([
                {
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "user-details"
                    }
                },
                {
                    $project: {
                        "user-details._id": 0,
                        "user-details.city": 0,
                        "user-details.createdAt": 0,
                        "user-details.__v": 0,
                    }
                }
            ])

            return res.status(STATUS_CODE.OK).json({
                success: true,
                message: 'Order list with user details',
                data: order
            });
        }
        catch (err) {
            return res.status(STATUS_CODE.SERVER_ERROR).json({
                success: false,
                message: err.message
            });
        }
    }

    async allOrdersWithProductListDetails(req, res) {
        try {
            const order = await orderModel.aggregate([
                {
                    $lookup: {
                        from: 'orderitems',
                        localField: "_id",
                        foreignField: "orderId",
                        as: "orderItems"
                    }
                }
            ])

            return res.status(STATUS_CODE.OK).json({
                success: true,
                message: 'Order list with product list details',
                data: order
            });
        }
        catch (err) {
            return res.status(STATUS_CODE.SERVER_ERROR).json({
                success: false,
                message: err.message
            });
        }
    }

    async allOrdersWithProductInformation(req, res) {
        try {
            const order = await orderModel.aggregate([
                {
                    $lookup: {
                        from: 'orderitems',
                        localField: "_id",
                        foreignField: "orderId",
                        as: "orderItems"
                    }
                },
                {
                    $unwind: "$orderItems"
                },
                {
                    $lookup: {
                        from: 'products',
                        foreignField: "_id",
                        localField: "orderItems.productId",
                        as: "products"
                    }
                },
                {
                    $unwind: "$products"
                }
            ])

            return res.status(STATUS_CODE.OK).json({
                success: true,
                message: 'Order list with product details',
                data: order
            });
        }
        catch (err) {
            return res.status(STATUS_CODE.SERVER_ERROR).json({
                success: false,
                message: err.message
            });
        }
    }

    async fullOrderSummery(req, res) {
        try {
            const fullOrderSummery = await orderModel.aggregate([
                {
                    $lookup: {
                        from: 'users',
                        localField: "userId",
                        foreignField: "_id",
                        as: "user-info"
                    }
                },
                {
                    $unwind: '$user-info'
                },
                {
                    $lookup: {
                        from: 'orderitems',
                        localField: "_id",
                        foreignField: "orderId",
                        as: "order-items"
                    }
                },
                {
                    $unwind: '$order-items'
                },
                {
                    $lookup: {
                        from: 'products',
                        localField: "order-items.productId",
                        foreignField: "_id",
                        as: "products"
                    }
                },
                {
                    $unwind: "$products"
                },
                {
                    $project: {
                        "user-info": 1,
                        "products": 1,
                        "totalAmount": 1
                    }
                }
            ])

            return res.status(STATUS_CODE.OK).json({
                success: true,
                message: 'Full order summery details',
                data: fullOrderSummery
            });
        }
        catch (err) {
            return res.status(STATUS_CODE.SERVER_ERROR).json({
                success: false,
                message: err.message
            });
        }
    }

    async orderWithPayment(req, res) {
        try {

            const order = await orderModel.aggregate([
                {
                    $lookup: {
                        from: "payments",
                        localField: "_id",
                        foreignField: "orderId",
                        as: "payment-details"
                    }
                },
                {
                    $project: {
                        "_id": 1,
                        "status": 1,
                        "payment-details._id": 1,
                        "payment-details.status": 1
                    }
                }
            ])

            return res.status(STATUS_CODE.OK).json({
                success: true,
                message: 'Order with payment details',
                data: order
            });
        }
        catch (err) {
            return res.status(STATUS_CODE.SERVER_ERROR).json({
                success: false,
                message: err.message
            });
        }
    }

    async orderWithPendingPayment(req, res) {
        try {

            const order = await orderModel.aggregate([
                {
                    $lookup: {
                        from: "payments",
                        localField: "_id",
                        foreignField: "orderId",
                        as: "payment-details"
                    }
                },
                {
                    $match: {
                        "payment-details.0": { $exists: false }
                    }
                }, {
                    $project: {
                        "payment-details": 0
                    }
                }
            ])

            return res.status(STATUS_CODE.OK).json({
                success: true,
                message: 'Order with payment details',
                data: order
            });
        }
        catch (err) {
            return res.status(STATUS_CODE.SERVER_ERROR).json({
                success: false,
                message: err.message
            });
        }
    }

    async getTotalRevenueFromOrders(req, res) {
        try {

            const revenue = await orderModel.aggregate([
                {
                    $group: {
                        _id: "$status",
                        "total-revenue": { $sum: "$totalAmount" }
                    }
                }
            ])

            return res.status(STATUS_CODE.OK).json({
                success: true,
                message: 'Total revenue of all orders',
                data: revenue
            });
        }
        catch (err) {
            return res.status(STATUS_CODE.SERVER_ERROR).json({
                success: false,
                message: err.message
            });
        }
    }

    async avgOrderValuePerUser(req, res) {
        try {

            const avgOrder = await orderModel.aggregate([
                {
                    $group: {
                        _id: "$userId",
                        totalOrder: {
                            $sum: 1
                        },
                        totalExpense: {
                            $sum: '$totalAmount'
                        }
                    }
                },
                {
                    $addFields: {
                        "avg-order": {
                            $divide: ["$totalExpense", "$totalOrder"]
                        }
                    }
                },
                {
                    $project: {
                        "_id": 1,
                        "avg-order": 1
                    }
                }
            ])

            return res.status(STATUS_CODE.OK).json({
                success: true,
                message: 'User wise avg order value',
                data: avgOrder
            });
        }
        catch (err) {
            return res.status(STATUS_CODE.SERVER_ERROR).json({
                success: false,
                message: err.message
            });
        }
    }

    async getMaximumOrderAmount(req, res) {
        try {

            const maxOrder = await orderModel.aggregate([
                {
                    $group: {
                        _id: "$userId",
                        maximum_order_value: { $max: "$totalAmount" }
                    }
                }
            ])

            return res.status(STATUS_CODE.OK).json({
                success: true,
                message: 'Maximum order amount',
                data: maxOrder
            });
        }
        catch (err) {
            return res.status(STATUS_CODE.SERVER_ERROR).json({
                success: false,
                message: err.message
            });
        }
    }

    async orderByStatusWithCount(req, res) {
        try {

            const order = await orderModel.aggregate([
                {
                    $group: {
                        _id: "$status",
                        order_count: { $sum: 1 }
                    }
                }
            ])

            return res.status(STATUS_CODE.OK).json({
                success: true,
                message: 'Status wise order count',
                data: order
            });
        }
        catch (err) {
            return res.status(STATUS_CODE.SERVER_ERROR).json({
                success: false,
                message: err.message
            });
        }
    }

    async getMonthlyRevenue(req, res) {
        try {

            const revenue = await orderModel.aggregate([
                {
                    $match: { "status": "completed" }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' },
                        },
                        revenue: {
                            $sum: "$totalAmount"
                        }
                    }
                }
            ])

            return res.status(STATUS_CODE.OK).json({
                success: true,
                message: 'Monthly revenue',
                data: revenue
            });
        }
        catch (err) {
            return res.status(STATUS_CODE.SERVER_ERROR).json({
                success: false,
                message: err.message
            });
        }
    }

    async getAvgOrderValuePerCategory(req, res) {
        try {

            const order = await orderModel.aggregate([
                {
                    $match: { "status": "completed" }
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
                        _id: "$product.category",
                        avg_order_value:{
                            $avg:"$totalAmount"
                        }
                    }
                }
            ])

            return res.status(STATUS_CODE.OK).json({
                success: true,
                message: 'Category wise avg order',
                data: order
            });
        }
        catch (err) {
            return res.status(STATUS_CODE.SERVER_ERROR).json({
                success: false,
                message: err.message
            });
        }
    }

    async getDailyRevenue(req, res) {
        try {

            const revenue = await orderModel.aggregate([
                {
                    $match: { "status": "completed" }
                },
                {
                    $group: {
                        _id: {
                            day: { $dayOfMonth: '$createdAt' }
                        },
                        revenue: {
                            $sum: "$totalAmount"
                        }
                    }
                }
            ])

            return res.status(STATUS_CODE.OK).json({
                success: true,
                message: 'Daily revenue',
                data: revenue
            });
        }
        catch (err) {
            return res.status(STATUS_CODE.SERVER_ERROR).json({
                success: false,
                message: err.message
            });
        }
    }
}

module.exports = new OrderController();