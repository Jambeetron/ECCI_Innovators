// server.js

const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const sql = require('mssql');
const path = require('path');
const bcrypt = require('bcryptjs'); // Importar bcrypt
const app = express();
const port = 3000;

// --- Configuración de la base de datos ---
const config = {
    user: 'sa',
    password: '1234',
    server: 'SIONICKI',
    options: {
        port: 1433,
        database: 'SocialMatchDB',
        encrypt: false, // <-- falso para entornos locales
        trustServerCertificate: true
    }
};

// --- Middleware global ---
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'mysecret',
    resave: false,
    saveUninitialized: true
}));

// Middleware para archivos estáticos (assets)
app.use('/assets', express.static(path.join(__dirname, 'assets'), {
    setHeaders: (res, path, stat) => {
      if (path.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css');
      }
    },
}));

// --- Función para conectar a la base de datos ---
async function connectDB() {
    try {
        await sql.connect(config);
        console.log('Conexión a la base de datos exitosa');
    } catch (err) {
        console.error('Error al conectar a la base de datos:', err.code);
        switch (err.code) {
            case 'ETIMEOUT':
                console.error('Diagnóstico: Tiempo de espera agotado.');
                break;
            case 'ESOCKET':
                console.error('Diagnóstico: Error de conexión (socket/firewall).');
                break;
            case 'ELOGIN':
                console.error('Diagnóstico: Usuario o contraseña incorrectos.');
                break;
            case 'EINSTLOOKUP':
                console.error('Diagnóstico: Instancia SQL no encontrada.');
                break;
            default:
                console.error('Diagnóstico: Error desconocido.');
        }
    }
}

connectDB();

// --- Función de autenticación simulada ---
function isAuthenticated(req) {
    return req.session && req.session.user;
}

// --- Rutas ---

// Ruta para API de prueba
app.get('/api/data', (req, res) => {
    res.json({ message: '¡Hola desde el servidor Node.js!' });
});

// Ruta raíz - mostrar login si no está autenticado
app.get('/', (req, res) => {
    if (!isAuthenticated(req)) {
        return res.redirect('/login.html');
    }
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Ruta para mostrar el formulario de login
app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// Ruta para mostrar el formulario de registro
app.get('/register.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'register.html'));
});

// Ruta para manejar el login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await sql.query`SELECT * FROM Usuarios WHERE Correo = ${email}`;

        if (result.recordset.length > 0) {
            const user = result.recordset[0];

            const match = await bcrypt.compare(password, user.Contrasena);
            if (match) {
                req.session.user = user;
                res.redirect('/');
            } else {
                res.send('Contraseña incorrecta');
            }
        } else {
            res.send('Usuario no encontrado');
        }
    } catch (err) {
        console.error('Error al verificar las credenciales:', err);
        res.send('Hubo un error al procesar tu solicitud');
    }
});

// Ruta para manejar el registro de nuevos usuarios
app.post('/register', async (req, res) => {
    const { username, email, password, tipoUsuario } = req.body;

    try {
        // Primero, verificar si el usuario ya existe
        const result = await sql.query`SELECT * FROM Usuarios WHERE Correo = ${email}`;

        if (result.recordset.length > 0) {
            return res.send('El usuario ya existe. Por favor, elige otro correo.');
        }        

        // Encriptar la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insertar el nuevo usuario
        await sql.query`
            INSERT INTO Usuarios (Nombre, Correo, Contrasena, TipoUsuario)
            VALUES (${username}, ${email}, ${hashedPassword}, ${tipoUsuario})
        `;    

        res.send('¡Registro exitoso! Ahora puedes iniciar sesión.');
    } catch (err) {
        console.error('Error al registrar usuario:', err);
        res.send('Hubo un error al registrar el usuario');
    }
});

// Ruta para cerrar sesión
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login.html');
});

// --- Iniciar el servidor ---
app.listen(port, () => {
    console.log(`Servidor ejecutándose en http://localhost:${port}`);
});
