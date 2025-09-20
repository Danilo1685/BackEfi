const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');
const modelDefiners = require('./models'); // si exportaste todos los modelos
const db = modelDefiners;

// 1️⃣ Crear la base de datos si no existe
const crearBaseDeDatos = async () => {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'root1234'
        });

        await connection.query('CREATE DATABASE IF NOT EXISTS efiJs'); // Asegúrate de que el nombre coincida con config.json
        console.log("Base de datos creada exitosamente");
        await connection.end();
    } catch (error) {
        console.error("Error creando la base de datos:", error.message);
    }
};

// 2️⃣ Inicializar Sequelize y crear las tablas
const inicializarTablas = async () => {
    try {
        // Conectar Sequelize a la base de datos creada
        await db.sequelize.authenticate();
        console.log("Conexión a la base de datos exitosa");

        // Sincronizar todos los modelos
        await db.sequelize.sync({ alter: true }); // o { force: true } si quieres recrear tablas
        console.log("Tablas creadas o actualizadas correctamente");
    } catch (error) {
        console.error("Error creando las tablas:", error.message);
    }
};

// 3️⃣ Ejecutar todo
const init = async () => {
    await crearBaseDeDatos();

    // Ajustar la conexión de Sequelize a la base de datos creada
    db.sequelize.config.database = 'efiJs';

    await inicializarTablas();
};

init();