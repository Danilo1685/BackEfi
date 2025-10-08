require('dotenv').config();
const { Usuario, TipoPropiedad, Propiedad, Cliente } = require('./models');

async function seed() {
  try {
    console.log('🌱 Iniciando seed de la base de datos...\n');

    // 🧹 LIMPIAR DATOS EXISTENTES (en orden correcto por dependencias)
    console.log('🧹 Limpiando datos existentes...');
    await Propiedad.destroy({ where: {}, force: true });
    await Cliente.destroy({ where: {}, force: true });
    await Usuario.destroy({ where: {}, force: true });
    await TipoPropiedad.destroy({ where: {}, force: true });
    console.log('✅ Datos anteriores eliminados\n');

    // 1. Crear usuarios (sin hashear manualmente - el hook lo hace)
    console.log('👤 Creando usuarios...');
    
    const admin = await Usuario.create({
      nombre: 'Alejo',
      email: 'a.velazquez@itecriocuarto.org.ar',
      edad: 25,  
      password: 'Alejo1234',  // ✅ Password sin hashear - el hook lo hará
      rol: 'admin',
      activo: true
    });
    console.log('✅ Admin creado:', admin.email);

    const agente = await Usuario.create({
      nombre: 'Juan Agente',
      email: 'agente@inmobiliaria.com',
      edad: 30,
      password: 'agente123',
      rol: 'agente',
      activo: true
    });
    console.log('✅ Agente creado:', agente.email);

    const clienteUser = await Usuario.create({
      nombre: 'María Cliente',
      email: 'cliente@inmobiliaria.com',
      edad: 28,
      password: 'cliente123',
      rol: 'cliente',
      activo: true
    });
    console.log('✅ Cliente creado:', clienteUser.email);

    // 2. Crear tipos de propiedad
    console.log('\n🏠 Creando tipos de propiedad...');
    const tipoCasa = await TipoPropiedad.create({
      nombre: 'Casa',
      activo: true
    });
    const tipoDepartamento = await TipoPropiedad.create({
      nombre: 'Departamento',
      activo: true
    });
    const tipoTerreno = await TipoPropiedad.create({
      nombre: 'Terreno',
      activo: true
    });
    console.log('✅ Tipos de propiedad creados');

    // 3. Crear registro de cliente
    console.log('\n👤 Creando perfil de cliente...');
    const cliente = await Cliente.create({
      documento_identidad: '12345678',
      telefono: '+54 358 123-4567',
      id_usuario: clienteUser.id,
      activo: true
    });
    console.log('✅ Perfil de cliente creado');

    // 4. Crear propiedades de ejemplo
    console.log('\n🏘️ Creando propiedades de ejemplo...');
    
    await Propiedad.create({
      direccion: 'Av. Libertador 1234, Río Cuarto',
      precio: 150000,
      estado: 'disponible',
      descripcion: 'Casa moderna de 3 dormitorios con jardín',
      tamaño: 120,
      tipo_id: tipoCasa.id,
      id_agente: agente.id,
      activo: true
    });

    await Propiedad.create({
      direccion: 'Calle San Martín 567, Centro',
      precio: 85000,
      estado: 'disponible',
      descripcion: 'Departamento céntrico de 2 dormitorios',
      tamaño: 65,
      tipo_id: tipoDepartamento.id,
      id_agente: agente.id,
      activo: true
    });

    await Propiedad.create({
      direccion: 'Barrio Alberdi, Lote 45',
      precio: 45000,
      estado: 'disponible',
      descripcion: 'Terreno de 300m² en zona residencial',
      tamaño: 300,
      tipo_id: tipoTerreno.id,
      id_agente: agente.id,
      activo: true
    });

    console.log('✅ Propiedades creadas');

    console.log('\n✨ Seed completado exitosamente!\n');
    console.log('📋 Credenciales de acceso:');
    console.log('   👑 Admin:');
    console.log('      Email: a.velazquez@itecriocuarto.org.ar');
    console.log('      Password: Alejo1234\n');
    console.log('   👔 Agente:');
    console.log('      Email: agente@inmobiliaria.com');
    console.log('      Password: agente123\n');
    console.log('   👤 Cliente:');
    console.log('      Email: cliente@inmobiliaria.com');
    console.log('      Password: cliente123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error en el seed:', error.message);
    console.error('\n💡 Posibles soluciones:');
    console.error('   1. Verifica que las tablas existan: node crearTablas.js');
    console.error('   2. Verifica la conexión a la BD en config/config.json');
    console.error('   3. Si el error persiste, elimina y recrea la BD\n');
    process.exit(1);
  }
}

seed();