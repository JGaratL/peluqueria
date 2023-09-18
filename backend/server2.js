console.log('Inicio del script');

require('dotenv').config({ path: './.env' });

const JWT_SECRET = process.env.JWT_SECRET;
console.log('JWT_SECRET:', JWT_SECRET);

const express = require('express');

const app = express();

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
