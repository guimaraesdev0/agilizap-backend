//cad_code.service.js

const connectToDatabase = require('../config/db.config');

async function createCode(code, userid) {
    try {
        const connection = await connectToDatabase();
        const result = await connection.query('INSERT INTO cad_codes (code, userid) VALUES (?, ?)', [code, userid]);
        return result[0];        
    } catch (error) {
        throw new Error(error);
    }
}

async function getLastCodeByUserId(userid) {
    try {
        const connection = await connectToDatabase();
        const [rows] = await connection.query('SELECT * FROM cad_codes WHERE userid = ? ORDER BY create_date DESC LIMIT 1', [userid]);
        return rows[0];        
    } catch (error) {
        throw new Error(error);
    }
}

async function updateCodeIfExists(code, userid) {
    try {
        const connection = await connectToDatabase();
        const currentTime = new Date();
        const [rows] = await connection.query('SELECT * FROM cad_codes WHERE code = ? AND userid = ? AND TIMESTAMPDIFF(MINUTE, create_date, ?) <= 30 ORDER BY create_date DESC LIMIT 1', [code, userid, currentTime]);
        
        if (rows.length > 0) {
            const result = await connection.query('UPDATE cad_codes SET create_date = ? WHERE id = ?', [currentTime, rows[0].id]);
            return result[0];
        } else {
            return null;  
        }
    } catch (error) {
        throw new Error(error);
    }
}

async function useCode(code, userid) {
    try {
        const connection = await connectToDatabase();
        const [codeRow] = await connection.query(
            'SELECT * FROM cad_codes WHERE code = ? AND userid = ? AND used = 0 AND TIMESTAMPDIFF(MINUTE, create_date, NOW()) <= 30 ORDER BY create_date DESC LIMIT 1',
            [code, userid]
        );

        if (codeRow.length > 0) {
            await connection.query('UPDATE clientes SET verified = 1 WHERE id = ?', [userid]);
            await connection.query('UPDATE cad_codes SET used = 1 WHERE id = ?', [codeRow[0].id]);
            return true;  
        } else {
            return false;  
        }
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = {
    createCode,
    getLastCodeByUserId,
    updateCodeIfExists,
    useCode
};
