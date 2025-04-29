import mssql from "mssql";

// --- Configuración de la base de datos ---
const config = {
    server: 'localhost',
    database: 'SocialMatchDB',
    user: 'sa',
    password: '1234',
    options: {
      encrypt: false,
      trustServerCertificate: true
    },
  };

// --- Función para conectar a la base de datos ---
export async function getConnection() {
    try {
        return await mssql.connect(connectionSettings);
        console.log('Conexión a la base de datos exitosa');
    } catch (error) {
        console.error('Error al conectar a la base de datos:', err);
    }
}
export {mssql};