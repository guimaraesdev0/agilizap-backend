const connectToDatabase = require('../config/db.config');

async function getAllUsers() {
    try {
        const connection = await connectToDatabase();
        const [rows] = await connection.query('SELECT * FROM clientes');
        return rows;        
    } catch (error) {
        throw new Error(error);
    }

}


async function getUserById(id) {
    try {
        const connection = await connectToDatabase();
        const [rows] = await connection.query('SELECT * FROM clientes WHERE id = ?', [id]);
        return rows[0];   
    } catch (error) {
        throw new Error(error);
    }
}

async function getUserByEmail(email) {
    try {
        const connection = await connectToDatabase();
        const [rows] = await connection.query('SELECT * FROM clientes WHERE id = ?', [email]);
        return rows[0];   
    } catch (error) {
        throw new Error(error);
    }   
}

async function createUser(userData) {
    try {
        const connection = await connectToDatabase();
        const result = await connection.query('INSERT INTO clientes SET ?', userData);
        return result[0];        
    } catch (error) {
        throw new Error(error);
    }
}

async function getCupons() {
    try {
        const connection = await connectToDatabase();
        const result = await connection.query('SELECT * FROM cuponsusados');
        return result[0];        
    } catch (error) {
        throw new Error(error);
    }

}

async function changePasswordById(userId, newPass) {
    try {
        const connection = await connectToDatabase();
        const result = await connection.query('UPDATE clientes SET senha = ? WHERE id = ?', [newPass, userId]);
        return result[0];
    } catch (error) {
        throw new Error(error);
    }
}


async function verifyExistingUserbyEmail(userEmail, userPhone) {
    try {
        const connection = await connectToDatabase();
        const [rows] = await connection.query('SELECT email, telefone FROM clientes WHERE email = ? OR telefone = ?', [userEmail, userPhone]);
        return rows;
    } catch (error) {
        throw new Error(error);
    }
}


async function verifyExistingUserbyMobileNumber(userPhone) {
    try {
        const connection = await connectToDatabase();
        const [rows] = await connection.query('SELECT telefone, senha, id FROM clientes WHERE telefone = ?', [userPhone]);
        return rows;
    } catch (error) {
        throw new Error(error);
    }
}


module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    getCupons,
    verifyExistingUserbyEmail,
    verifyExistingUserbyMobileNumber,
    changePasswordById
};
