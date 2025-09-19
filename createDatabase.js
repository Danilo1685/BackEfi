const mysql = require('mysql2/promise')

const crearBaseDeDatos = async () => {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'root1234'
        })

        await connection.query('CREATE DATABASE IF NOT EXISTS crud_db')
        console.log("base de datos creada exitosamente")
        await connection.end()
    } catch (error) {
        console.error("Error creando la base de datos", error.message)
    }
}

crearBaseDeDatos()