const { connect } = require('../app');
const connectToDatabase = require('../config/db.config');

async function createRecovery(recoveryData) {
    try {
        const connection = await connectToDatabase();
        await connection.query(`INSERT INTO recuperarsenha SET ?`, recoveryData);
        return true;
    } catch (error) {
        throw new Error(error)
    }
}

async function changePassword(token) {
    try {
        const connection = await connectToDatabase();
        await connection.query('UPDATE recuperarsenha SET usado = 1 WHERE token = ?', [token])
        return true;
    } catch (error) {
        throw new Error(error)
    }
}

async function findRecoveryByCode(code) {
    try {
        const connection = await connectToDatabase();
        const [rows] = await connection.query('SELECT * FROM recuperarsenha WHERE token = ?', [code]);
        return rows[0];
    } catch (error) {
        throw new Error(error)
    }
}


module.exports = {
    createRecovery,
    changePassword,
    findRecoveryByCode
}