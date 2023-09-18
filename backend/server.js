console.log('Inicio del script');

require('dotenv').config({ path: './.env' });

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const mysql2 = require('mysql2'); // Cambiamos la importación a mysql2
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
console.log(JWT_SECRET);

const app = express();

const connection = mysql2.createConnection({
    host: 'localhost',
    user: 'peluqueria',
    password: '/Ballenita69/',
    database: 'peluqueria'
});

connection.connect(err => {
    if (err) {
        console.error('Error conectando a la base de datos:', err.stack);
        return;
    }
    console.log('Conexión a la base de datos establecida con el ID ' + connection.threadId);
});

app.use(express.json());
app.use(cors());

function authenticateJWT(req, res, next) {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                console.log('userId extraído del token JWT:', userId); // Agrega este registro

                return res.sendStatus(403);
            }

            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
}

app.get('/', (req, res) => {
    res.send('Backend funcionando');
});

app.post('/register', async (req, res) => {
    console.log('Petición recibida en /register');
    console.log('Cuerpo de la petición:', req.body);

    const { nombre, apellido, telefono, email, password } = req.body;

    if (!nombre || !apellido || !telefono || !email || !password) {
        return res.status(400).send({ message: 'Todos los campos son obligatorios.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    connection.query('INSERT INTO clientes (nombre, apellido, telefono, email, password) VALUES (?, ?, ?, ?, ?)', 
    [nombre, apellido, telefono, email, hashedPassword], 
    (err, results) => {
        if (err) {
            return res.status(500).send(err.message);
        }
        res.status(201).send({ message: 'Usuario registrado exitosamente' });
    });
});

app.post('/login', (req, res) => {
    console.log("Solicitud recibida en el endpoint /login"); 

    const { email, password } = req.body;

    connection.query('SELECT cliente_id, nombre, apellido, email, password FROM clientes WHERE email = ?', [email], async (err, results) => {
        if (err) {
            return res.status(500).send(err.message);
        }

        if (results.length === 0) {
            return res.status(404).send({ message: 'Usuario no encontrado' });
        }

        console.log("Usuario encontrado:", results[0]); // Agregado para verificar el objeto user

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Usuario completo:', user);

        if (!isMatch) {
            return res.status(400).send({ message: 'Contraseña incorrecta' });
        }

        try {
            const token = jwt.sign({ id: user.cliente_id }, JWT_SECRET, { expiresIn: '2h' }); 

            console.log('Token JWT generado:', token);            
            console.log('ID del cliente:', user.cliente_id); // Agregado para verificar el ID del cliente
            res.status(200).send({ message: 'Inicio de sesión exitoso', cliente_id: user.cliente_id, token }); 
        } catch (error) {
            console.error('Error creando el token JWT:', error);
            res.status(500).send({ message: 'Error interno del servidor al crear el token JWT' });
        }
    });
});

// Nueva ruta para obtener las citas del usuario
// Ruta para obtener citas del cliente
app.get('/appointments/:clienteId', authenticateJWT, async (req, res) => {
    try {
        const clienteId = req.params.clienteId; // Obtén el clienteId de la URL
        console.log('clienteId capturado desde req.params:', clienteId); // Agrega este registro

        const userId = req.user.id; // Suponiendo que guardas el ID del usuario en el token JWT

        if (clienteId != userId) {
            return res.status(403).json({ message: 'No tienes permiso para acceder a estas citas.' });
        }

        // Utiliza la función get_user_appointments_from_database para obtener las citas
        const appointments = await get_user_appointments_from_database(clienteId);

        res.json(appointments);
    } catch (error) {
        console.error('Error al obtener las citas del cliente:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Función para obtener las citas del cliente desde la base de datos
async function get_user_appointments_from_database(clienteId) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT citas.cita_id, citas.fecha, citas.hora_inicio, servicios.nombre AS servicio, empleados.nombre AS peluquero
            FROM citas
            INNER JOIN servicios ON citas.servicio_id = servicios.servicio_id
            INNER JOIN empleados ON citas.empleado_id = empleados.empleado_id
            WHERE citas.cliente_id = ?;
        `;

        connection.query(query, [clienteId], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
}


// Resto de tus rutas...

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

// Función para obtener las citas del usuario desde la base de datos
async function get_user_appointments_from_database(clienteId) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT citas.cita_id, citas.fecha, citas.hora_inicio, servicios.nombre AS servicio, empleados.nombre AS peluquero
            FROM citas
            INNER JOIN servicios ON citas.servicio_id = servicios.servicio_id
            INNER JOIN empleados ON citas.empleado_id = empleados.empleado_id
            WHERE citas.cliente_id = ?;
        `;

        connection.query(query, [clienteId], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
}





