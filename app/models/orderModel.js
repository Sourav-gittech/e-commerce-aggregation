const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const orderSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    totalAmount: {
        type: Number,
        require: true
    },
    status: {
        type: String,
        emun: ['pending', 'completed', 'cancelled'],
        default: "pending"
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
});

const orderModel = mongoose.model('order', orderSchema);

module.exports = orderModel;