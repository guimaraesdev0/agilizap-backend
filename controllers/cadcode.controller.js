const CodeModel = require('../services/cad_code.service');
const { body, param, validationResult } = require('express-validator');
const UserModel = require('../services/user.service');
const accountSid = process.env.AccountSID;
const authToken = process.env.AuthTokenTwilio;
const clientTwilio = require('twilio')(accountSid, authToken);


async function sendCode(req, res) {
    try {
        await body('telefone').isMobilePhone().run(req);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const existingUser = await UserModel.verifyExistingUserbyMobileNumber(req.body.telefone);
        if (existingUser.length === 0) {
            return res.status(404).json({ error: 'Número não encontrado' });
        }
        const user = existingUser[0];

        // Verifica o último código enviado
        const lastCode = await CodeModel.getLastCodeByUserId(user.id);
        if (lastCode) {
            const timeDifference = Math.floor((new Date() - new Date(lastCode.create_date)) / 1000); // em segundos
            const timeLeft = 300 - timeDifference; // 5 minutos = 300 segundos

            if (timeLeft > 0) {
                return res.status(400).json({ error: `Aguarde ${Math.ceil(timeLeft / 60)} minutos para solicitar uma nova senha.` });
            }
        }

        try {
            const newPass = Math.floor(100000 + Math.random() * 900000).toString();
            
            const hashedPass = await bcrypt.hash(newPass, 10);

            await UserModel.changePasswordById(user.id, hashedPass);

            await clientTwilio.messages.create({
                body: `*Yan-Card*\n\nSua nova senha de login é: *${newPass}*\n\nPor favor, não compartilhe esta senha com ninguém.`,
                to: `+55${req.body.telefone}`,
                from: process.env.TwilioPhone,
            }); 

            return res.status(200).json({ success: 'Nova senha criada e enviada com sucesso' });
        } catch (error) {
            console.log({ error: error });
            return res.status(500).json({ error: 'Erro ao criar e enviar a nova senha' });
        }

    } catch (error) {
        res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
    }
}



async function useCode(req, res) {
    await body('codigo').isString().run(req);
    await body('telefone').isString().run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const existingUser = await UserModel.verifyExistingUserbyMobileNumber(req.body.telefone);
    if (existingUser.length === 0) {
        return res.status(404).json({ error: 'Número não encontrado' });
    }
    const user = existingUser[0];

    try {
        const response = await CodeModel.useCode(req.body.codigo, user.id)
        if (response == false) {
            return res.status(400).json({"error":"Código inválido ou expirado!"})          
        }
        return res.status(200).json({'success': true})
    } catch (error) {
        return res.status(400).json({"error":"Código inválido ou expirado!"})
    }
}

module.exports = {
    sendCode,
    useCode
}