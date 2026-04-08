const userModel = require("../models/userModel");
const orderModel = require("../models/orderModel");

const STATUS_CODE = require("../utils/statusCode");

class UserController {

    async addUser(req, res) {
        try {
            const { name, email, city } = req.body;

            if (!name || !email || !city) {
                return res.status(STATUS_CODE.BAD_GATEWAY).json({
                    success: false,
                    message: 'All fields are required'
                });
            }

            const existUser = await userModel.findOne({ email });

            if (existUser) {
                return res.status(STATUS_CODE.BAD_GATEWAY).json({
                    success: false,
                    message: 'User already exist'
                });
            }
            else {
                const userObj = new userModel({ name, email, city });
                const user = await userObj.save();

                return res.status(STATUS_CODE.CREATED).json({
                    success: true,
                    message: 'User added successfully',
                    data: user
                });
            }
        }
        catch (err) {
            return res.status(STATUS_CODE.SERVER_ERROR).json({
                success: false,
                message: err.message
            });
        }
    }

    async allUser(req, res) {
        try {
            const user = await userModel.find();

            return res.status(STATUS_CODE.OK).json({
                success: true,
                message: 'User List',
                data: user
            });
        }
        catch (err) {
            return res.status(STATUS_CODE.SERVER_ERROR).json({
                success: false,
                message: err.message
            });
        }
    }

    async getAllUserWithOrder(req, res) {
        try {
            const user = await userModel.aggregate([
                {
                    $lookup: {
                        from: "orders",
                        localField: "_id",
                        foreignField: "userId",
                        as: "orders"
                    }
                }
            ])

            return res.status(STATUS_CODE.OK).json({
                success: true,
                message: 'User List with order',
                data: user
            });
        }
        catch (err) {
            return res.status(STATUS_CODE.SERVER_ERROR).json({
                success: false,
                message: err.message
            });
        }
    }

    async getUserplacedOneOrder(req, res) {
        try {
            const user = await userModel.aggregate([
                {
                    $lookup: {
                        from: 'orders',
                        foreignField: "userId",
                        localField: "_id",
                        as: "orders"
                    }
                },
                {
                    $match: {
                        "orders.0": { $exists: true }
                    }
                }
            ])

            return res.status(STATUS_CODE.OK).json({
                success: true,
                message: 'User List placed atleast one order',
                data: user
            });
        }
        catch (err) {
            return res.status(STATUS_CODE.SERVER_ERROR).json({
                success: false,
                message: err.message
            });
        }
    }

    async getUserNaverplacedOrder(req, res) {
        try {
            const user = await userModel.aggregate([
                {
                    $lookup: {
                        from: 'orders',
                        foreignField: "userId",
                        localField: "_id",
                        as: "orders"
                    }
                },
                {
                    $match: {
                        "orders.0": { $exists: false }
                    }
                }
            ])

            return res.status(STATUS_CODE.OK).json({
                success: true,
                message: 'User List placed with no order',
                data: user
            });
        }
        catch (err) {
            return res.status(STATUS_CODE.SERVER_ERROR).json({
                success: false,
                message: err.message
            });
        }
    }

    async getUserWithLatestOrder(req, res) {
        try {

            const user = await userModel.aggregate([
                {
                    $lookup: {
                        from: "orders",
                        localField: "_id",
                        foreignField: "userId",
                        as: "orders"
                    }
                },
                {
                    $sort: {
                        "orders.createdAt": 1
                    }
                },
                {
                    $addFields: {
                        "latest-order": {
                            $slice: ["$orders", 1]
                        }
                    }
                },
                {
                    $project: {
                        "orders": 0
                    }
                }
            ])
            return res.status(STATUS_CODE.OK).json({
                success: true,
                message: 'User List placed with latest order',
                data: user
            });
        }
        catch (err) {
            return res.status(STATUS_CODE.SERVER_ERROR).json({
                success: false,
                message: err.message
            });
        }
    }

    async getTotalOrderNumberPerUser(req, res) {
        try {

            const userOrder = await userModel.aggregate([
                {
                    $lookup: {
                        from: 'orders',
                        foreignField: 'userId',
                        localField: "_id",
                        as: "orders"
                    }
                },
                {
                    $addFields: {
                        "totalOrder": {
                            $size: "$orders"
                        }
                    }
                },
                {
                    $project: {
                        "_id": 1,
                        "name": 1,
                        "totalOrder": 1
                    }
                }
            ])
            return res.status(STATUS_CODE.OK).json({
                success: true,
                message: 'User wise total order',
                data: userOrder
            });
        }
        catch (err) {
            return res.status(STATUS_CODE.SERVER_ERROR).json({
                success: false,
                message: err.message
            });
        }
    }

    async topFiveUserByTotalSpending(req, res) {
        try {

            const user = await orderModel.aggregate([
                {
                    $match: { "status": "completed" }
                },
                {
                    $group: {
                        _id: "$userId",
                        total_expense: {
                            $sum: "$totalAmount"
                        }
                    }
                },
                {
                    $sort: {
                        total_expense: -1
                    }
                },
                {
                    $limit: 5
                }
            ])

            return res.status(STATUS_CODE.OK).json({
                success: true,
                message: 'Top 5 user by total expense',
                data: user
            });
        }
        catch (err) {
            return res.status(STATUS_CODE.SERVER_ERROR).json({
                success: false,
                message: err.message
            });
        }
    }

    async findDuplicateUser(req, res) {
        try {

            const user = await userModel.aggregate([
                {
                    $group: {
                        _id: '$email',
                        count: { $sum: 1 }
                    }
                },
                {
                    $match: { "count": { $gt: 1 } }
                }
            ])

            return res.status(STATUS_CODE.OK).json({
                success: true,
                message: 'Duplicate user by email',
                data: user
            });
        }
        catch (err) {
            return res.status(STATUS_CODE.SERVER_ERROR).json({
                success: false,
                message: err.message
            });
        }
    }

    async calculateTotalSpendingUserWise(req, res) {
        try {

            const user = await orderModel.aggregate([
                {
                    $match: { "status": "completed" }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "user"
                    }
                },
                {
                    $unwind: "$user"
                },
                {
                    $group: {
                        _id: '$user._id',
                        name: { $first: "$user.name" },
                        total_expense: { $sum: "$totalAmount" }
                    }
                }
            ])

            return res.status(STATUS_CODE.OK).json({
                success: true,
                message: 'Calculate user wise spending',
                data: user
            });
        }
        catch (err) {
            return res.status(STATUS_CODE.SERVER_ERROR).json({
                success: false,
                message: err.message
            });
        }
    }

    async FindUserOfSpendingGreaterThenAmount(req, res) {
        try {

            const amount = req.params.amount;

            if (!amount) {
                res.status(STATUS_CODE.NOT_FOUND).json({
                    success: false,
                    message: "No amount fund"
                })
            }
            else {
                const user = await orderModel.aggregate([
                    {
                        $match: { "status": "completed" }
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "userId",
                            foreignField: "_id",
                            as: "user"
                        }
                    },
                    {
                        $unwind: "$user"
                    },
                    {
                        $group: {
                            _id: '$user._id',
                            name: { $first: "$user.name" },
                            total_expense: { $sum: "$totalAmount" }
                        }
                    },
                    {
                        $match: {
                            total_expense: { $gte: Number(amount) }
                        }
                    }
                ])

                return res.status(STATUS_CODE.OK).json({
                    success: true,
                    message: `Calculate user wise spending more than ${amount}`,
                    data: user
                });
            }
        }
        catch (err) {
            return res.status(STATUS_CODE.SERVER_ERROR).json({
                success: false,
                message: err.message
            });
        }
    }

    async userTotalSpendingWithDetails(req, res) {
        try {

            const user = await orderModel.aggregate([
                {
                    $match: { "status": "completed" }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "user"
                    }
                },
                {
                    $unwind: "$user"
                },
                {
                    $group: {
                        _id: '$user._id',
                        user_details: { $push: "$user" },
                        total_expense: { $sum: "$totalAmount" }
                    }
                },
                {
                    $unwind: "$user_details"
                }
            ])

            return res.status(STATUS_CODE.OK).json({
                success: true,
                message: 'Calculate user wise spending with details',
                data: user
            });
        }
        catch (err) {
            return res.status(STATUS_CODE.SERVER_ERROR).json({
                success: false,
                message: err.message
            });
        }
    }

    async getTotalOrderNumberPerUserGreaterThan3(req, res) {
        try {

            const userOrder = await userModel.aggregate([
                {
                    $lookup: {
                        from: 'orders',
                        foreignField: 'userId',
                        localField: "_id",
                        as: "orders"
                    }
                },
                {
                    $addFields: {
                        "totalOrder": {
                            $size: "$orders"
                        }
                    }
                },
                {
                    $project: {
                        "_id": 1,
                        "name": 1,
                        "totalOrder": 1
                    }
                },
                {
                    $match: {
                        "totalOrder": { $gte: 3} 
                    }
                }
            ])
            return res.status(STATUS_CODE.OK).json({
                success: true,
                message: 'User wise total order',
                data: userOrder
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

module.exports = new UserController();