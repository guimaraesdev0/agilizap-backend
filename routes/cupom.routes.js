const express = require('express');
const router = express.Router();
const CupomModel = require('../controllers/cupom.controller');
const authenticateToken = require('../middleware/Auth');

router.get('/getAll', CupomModel.getAllCupons);
router.get('/getcupons/:id', CupomModel.getAllCuponsByUserId)




module.exports = router;
