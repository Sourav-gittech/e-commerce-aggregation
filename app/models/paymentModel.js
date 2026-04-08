const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const paymentSchema = new Schema({
    orderId: {
        type: Schema.Types.ObjectId,
        ref: 'order'
    },
    paymentMethod: {
        type: String,
        default: 'upi'
    },
    amount: {
        type: Number,
        require: true
    },
    status: {
        type: String,
        enum: ['paid', 'failed', 'pending'],
        default:'paid'
    },
    paidAt: {
        type: Date,
        default: Date.now()
    }
})

const paymentModel = mongoose.model("payment", paymentSchema);

module.exports = paymentModel;