const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const orderItemSchema = new Schema({
    orderId: {
        type: Schema.Types.ObjectId,
        ref: 'order'
    },
    productId: {
        type: Schema.Types.ObjectId,
        ref: 'product'
    },
    quantity: {
        type: Number,
        require: true
    },
    price: {
        type: Number,
        require: true
    }
})

const orderItemModel = mongoose.model("orderItem", orderItemSchema);

module.exports = orderItemModel;