const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios'); // Importar o axios
const userRoutes = require('./routes/user.routes');
const cupomRoutes = require('./routes/cupom.routes');
const recoveryRoutes = require('./routes/recovery.routes');
const cadcode = require('./routes/cadcode.routes')
const connectToDatabase = require('./config/db.config');
const os = require('os');

const app = express();

connectToDatabase();

// Função para obter o endereço IP local
function getLocalIpAddress() {
    const interfaces = os.networkInterfaces();
    for (const interfaceName in interfaces) {
        const addresses = interfaces[interfaceName];
        for (const address of addresses) {
            if (address.family === 'IPv4' && !address.internal) {
                return address.address;
            }
        }
    }
    return 'IP não encontrado';
}

// Obter o IP local
const localIp = getLocalIpAddress();
console.log(`Servidor rodando na máquina com IP: ${localIp}`);

// Configuração do CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS;
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins === '*' || allowedOrigins.split(',').includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use('/api', userRoutes, cupomRoutes, recoveryRoutes, cadcode);

app.use((req, res, next) => {
    res.status(404).json({ message: 'Not Found' });
});

app.use((error, req, res, next) => {
    res.status(500).json({ message: error.message });
});


module.exports = app;
