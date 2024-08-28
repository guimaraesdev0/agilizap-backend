const recoveryModel = require('../services/recovery.service');
const UserModel = require('../services/user.service');
const { body, param, validationResult } = require('express-validator');
const md5 = require('md5')
const accountSid = process.env.AccountSID;
const authToken = process.env.AuthTokenTwilio;
const clientTwilio = require('twilio')(accountSid, authToken);
const bcrypt = require('bcrypt');



async function createRecovery(req, res) {
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
    try {
        const recoveryCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Envia código SMS
        await clientTwilio.messages.create({
            body: `*Yan-Card*\n\nSeu código de recuperação de senha é: *${recoveryCode}*\n\nCaso você não tenha solicitado, por favor ignore esta mensagem.`,
            to: `+55${req.body.telefone}`,
            from: process.env.TwilioPhone,
        });

        const data = {
            token: recoveryCode,
            idusuario: user.id,
            data: new Date().toISOString().slice(0, 19).replace('T', ' '), // Formatação para MySQL DATETIME
            usado: 0
        };
        await recoveryModel.createRecovery(data);

        return res.status(200).json({ success: 'Código de recuperação criado com sucesso' });
    } catch (error) {
        console.log({ error: error });
        return res.status(500).json({ error: 'Erro ao criar código de recuperação' });
    }
}



async function changePassword(req, res) {
    await body('codigo').isString().run(req);
    await body('newPassword').isString().run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const recoveryData = await recoveryModel.findRecoveryByCode(req.body.codigo);
        if (!recoveryData) {
            return res.status(404).json({ error: 'Código de recuperação inválido' });
        }

        if (recoveryData.usado === 1) {
            return res.status(400).json({ error: 'Código de recuperação já utilizado' });
        }
        const saltRounds = 10;
        const newpass = await bcrypt.hash(req.body.newPassword, saltRounds);
        await UserModel.changePasswordById(recoveryData.idusuario, newpass);
        await recoveryModel.changePassword(req.body.codigo);

        return res.status(200).json({ success: 'Senha alterada com sucesso!' });
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao alterar a senha: ' + error.message });
    }
}


async function verifyRecoveryCode(req, res) {
    await body('Code').isString().run(req);

    try {
        const recoveryData = await recoveryModel.findRecoveryByCode(req.body.Code);
        if (!recoveryData) {
            return res.status(404).json({ error: 'Código de recuperação inválido' });
        }

        if (recoveryData.usado === 1) {
            return res.status(400).json({ error: 'Código de recuperação já foi utlizado.' });
        }

        return res.status(200).json( { success: 'O Código é válido' } );
    } catch (error) {
        return res.status(400).json( { error: error } )
    }

}


module.exports = {
    createRecovery,
    changePassword,
    verifyRecoveryCode
}
