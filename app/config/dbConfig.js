require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URL = process.env.MONGO_URL;

const DbConnection = async () => {
    try {

        const connection = await mongoose.connect(MONGO_URL);

        if (connection) {
            console.log('Database connection establish');
        }
        else {
            console.log('Database connection failed');
        }
    }
    catch (err) {
        console.log('Database connection failed');
    }
}

module.exports = DbConnection;