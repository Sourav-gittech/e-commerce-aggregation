const mongoose = require("mongoose");

const orderModel = require("../models/orderModel");
const PaymentModel = require("../models/paymentModel");
const orderItemModel = require("../models/orderItemModel");
const productModel = require("../models/productModel");

const STATUS_CODE = require("../utils/statusCode");

class PaymentController {

    async addPayment(req, res) {
        try {
            const { orderId, paymentMethod, amount, status } = req.body;

            if (!orderId || !amount || !status) {
                return res.status(STATUS_CODE.NOT_FOUND).json({
                    success: false,
                    message: 'All fields required'
                });
            }

            else {
                const orderDetails = await orderModel.findById(orderId);

                if (!orderDetails) {
                    return res.status(STATUS_CODE.NOT_FOUND).json({
                        success: false,
                        message: 'Order not found'
                    });
                }
                else {
                    if (amount != orderDetails.totalAmount) {
                        return res.status(STATUS_CODE.BAD_GATEWAY).json({
                            success: false,
                            message: 'Order price amount not match'
                        });
                    }
                    else {

                        if (status == 'paid') {
                            const orderItemDetails = await orderItemModel.findOne({ orderId: orderDetails._id });

                            if (!orderItemDetails) {
                                return res.status(STATUS_CODE.NOT_FOUND).json({
                                    success: false,
                                    message: 'Order items not found'
                                });
                            }
                            else {
                                const productDetails = await productModel.findById(orderItemDetails.productId);

                                if (!productDetails) {
                                    return res.status(STATUS_CODE.NOT_FOUND).json({
                                        success: false,
                                        message: 'PRoduct not found'
                                    });
                                }
                                else {

                                    orderDetails.status = 'completed';
                                    await orderDetails.save();

                                    productDetails.stock = productDetails.stock - orderItemDetails.quantity;
                                    await productDetails.save();

                                    const paymentObj = new PaymentModel({ orderId, paymentMethod, amount, status });
                                    const payment = await paymentObj.save();

                                    return res.status(STATUS_CODE.CREATED).json({
                                        success: true,
                                        message: 'Order placed successfully',
                                        data: payment
                                    });
                                }
                            }
                        }

                        else if (status == 'failed') {
                            orderDetails.status = 'cancelled';
                            await orderDetails.save();

                            const paymentObj = new PaymentModel({ orderId, paymentMethod, amount, status });
                            const payment = await paymentObj.save();

                            return res.status(STATUS_CODE.FORBIDDEN).json({
                                success: true,
                                message: 'Order cancelled',
                                data: payment
                            });
                        }

                        else {
                            return res.status(STATUS_CODE.BAD_GATEWAY).json({
                                success: false,
                                message: 'Invalid payment'
                            });
                        }
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

}

module.exports = new PaymentController();