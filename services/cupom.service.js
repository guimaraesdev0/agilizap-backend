const connectToDatabase = require('../config/db.config');

async function getAllUsedCupons() {
    try {
        const connection = await connectToDatabase();
        const [rows] = await connection.query(`SELECT * FROM cuponsusados`)
        return rows;
    } catch (error) {
        throw new Error(error);
    }

}

async function getAllUsedCuponsByUserId(userId) {
    try {
        const connection = await connectToDatabase();
        const [rows] = await connection.query(`
            SELECT cuponsusados.*, restaurantes.nome AS nomeRestaurante
            FROM cuponsusados
            JOIN restaurantes ON cuponsusados.idrestaurante = restaurantes.id
            WHERE cuponsusados.idcliente = ?
        `, [userId]);
        return rows;
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = {
    getAllUsedCupons,
    getAllUsedCuponsByUserId
}
