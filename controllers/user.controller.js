const { body, validationResult } = require('express-validator');
const UserModel = require('../services/user.service');
const md5 = require('md5');
const JWT = require('jsonwebtoken');
const { createCode } = require('../services/cad_code.service');
const bcrypt = require('bcrypt');


const JWT_SECRET = process.env.JWT_SECRET;

async function getAllUsers(req, res) {
    try {
        const users = await UserModel.getAllUsers();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}

async function getUserById(req, res) {
    try {
        const user = await UserModel.getUserById(req.params.id);
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}

async function login(req, res) {
    await body('telefone').isMobilePhone().run(req);
    await body('senha').isString().run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const existingUser = await UserModel.verifyExistingUserbyMobileNumber(req.body.telefone);

        if (existingUser.length === 0) {
            return res.status(404).json({ error: 'Número não encontrado' });
        }

        const user = existingUser[0];
        const isPasswordValid = await bcrypt.compare(req.body.senha, user.senha);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Senha inválida' });
        }

        const userData = await UserModel.getUserById(user.id);
        const token = JWT.sign({ id: userData.id }, JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ user: userData, token });
    } catch (error) {
        res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
    }
}

async function createUser(req, res) {
    await body('nome').isString().isLength({ min: 3 }).trim().escape().run(req);
    await body('telefone').isMobilePhone().run(req);
    await body('nascimento').isString().run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Todos os campos devem ser preenchidos' });
    }

    try {
        const existingUser = await UserModel.verifyExistingUserbyEmail(req.body.email, req.body.telefone);

        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'Email or Number already exists', existingUser });
        }

        const newUser = {
            nome: req.body.nome,
            email: req.body.email,
            telefone: req.body.telefone,
            nascimento: req.body.nascimento
        };


        const createdUser = await UserModel.createUser(newUser);
        const token = JWT.sign({ id: createdUser.id }, JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ user: createdUser, token });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}

async function getCupons(req, res) {
    try {
        const cupons = await UserModel.getCupons();
        res.status(200).json(cupons);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    getCupons,
    login
};
