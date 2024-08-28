const CupomModel = require('../services/cupom.service');



async function getAllCupons(req, res) {
    try {
        const data = await CupomModel.getAllUsedCupons();
        res.status(200).json(data)
    } catch (error) {
        console.log({Error: error})
    }
}

async function getAllCuponsByUserId(req, res) {

    if (req.params.id === undefined) {
        res.status(404).json({error: "ID not defined"})
        return
    }

    try {
        const data = await CupomModel.getAllUsedCuponsByUserId(req.params.id)
        res.status(200).json(data)
    } catch (error) {
        console.log({Error: error})
    }
}


module.exports = {
    getAllCupons,
    getAllCuponsByUserId
}