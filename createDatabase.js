const mysql = require('mysql2/promise');

const crearBaseDeDatos = async () => {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: ''
        });

        await connection.query('CREATE DATABASE IF NOT EXISTS efijs CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;');
        console.log("✅ Base de datos 'efijs' creada exitosamente");

        await connection.end();
    } catch (error) {
        console.error("❌ Error creando la base de datos:", error.message);
    }
};

crearBaseDeDatos();


