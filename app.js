const express = require("express");

const DbConnection = require('./app/config/dbConfig');
const indexRoute = require('./app/routes/indexRoute');

const port = 4000;

const app = express();

DbConnection();

app.use(express.json());

app.use(indexRoute);

app.listen(port, (err) => {
    if (err) {
        console.log('Server crashed');
    }
    else {
        console.log('Server is running on port', port);
    }
})