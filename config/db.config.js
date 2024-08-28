// config/db.config.js
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
};


let connection;

async function connectToDatabase() {
    if (!connection) {
        connection = await mysql.createPool({
            ...dbConfig,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
    }
    return connection;
}

module.exports = connectToDatabase;
