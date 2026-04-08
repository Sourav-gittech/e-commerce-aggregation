const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    city: {
        type: String,
        require: true
    },
    createdAt: {
        type: Date,
        default: new Date()
    }
})

const userModel = mongoose.model("user", userSchema);

module.exports = userModel;