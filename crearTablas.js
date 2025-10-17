const mysql = require('mysql2/promise');
const db = require('./models');

// 1️⃣ Crear la base de datos si no existe
const crearBaseDeDatos = async () => {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: ''  // ✅ Usar la contraseña correcta de config.json
        });

        await connection.query('CREATE DATABASE IF NOT EXISTS efiJs');
        console.log("✅ Base de datos 'efiJs' verificada/creada exitosamente");
        await connection.end();
    } catch (error) {
        console.error("❌ Error creando la base de datos:", error.message);
        throw error;
    }
};

// 2️⃣ Inicializar Sequelize y crear las tablas
const inicializarTablas = async () => {
    try {
        // Conectar Sequelize a la base de datos
        await db.sequelize.authenticate();
        console.log("✅ Conexión a la base de datos exitosa");

        // 🔥 IMPORTANTE: Usar force: true para recrear las tablas desde cero
        // Esto elimina las tablas existentes y las vuelve a crear
        await db.sequelize.sync({ force: true });
        console.log("✅ Tablas creadas correctamente");
        console.log("\n⚠️  NOTA: Las tablas fueron recreadas. Ejecuta 'node seed.js' para poblar datos.\n");
    } catch (error) {
        console.error("❌ Error creando las tablas:", error.message);
        throw error;
    }
};

// 3️⃣ Ejecutar todo
const init = async () => {
    try {
        console.log("🚀 Iniciando creación de base de datos y tablas...\n");
        await crearBaseDeDatos();
        await inicializarTablas();
        console.log("✨ Proceso completado exitosamente!");
        process.exit(0);
    } catch (error) {
        console.error("\n❌ Error en el proceso:", error.message);
        process.exit(1);
    }
};

init();