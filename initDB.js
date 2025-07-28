const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

// Ruta de la base de datos
const dbPath = path.join(__dirname, 'db', 'database.sqlite');

// Si existe, eliminarla
if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log('✅ Base de datos anterior eliminada.');
}

// Crear conexión
const db = new sqlite3.Database(dbPath);

// Leer scripts SQL
const crebasSQL = fs.readFileSync(path.join(__dirname, 'db', 'crebas.sql'), 'utf8');
const insertsSQL = fs.readFileSync(path.join(__dirname, 'db', 'inserts.sql'), 'utf8');

// Contraseña común
const contraseñaComun = '123456';

// Lista de usuarios
const usuarios = [
    { nombre: 'Gabriela', apellido: 'Gonzalez', email: 'gaby.gonza@gmail.com', es_admin: 1 },
    { nombre: 'Katherine', apellido: 'Mereles', email: 'kath.mere@gmail.com', es_admin: 0 },
    { nombre: 'Verónica', apellido: 'Vallejos', email: 'vero.vallej@gmail.com', es_admin: 0 },
    { nombre: 'Victor', apellido: 'Ruiz Diaz', email: 'vic.ruizdiaz@gmail.com', es_admin: 1 },
    { nombre: 'Yenifer', apellido: 'Aguilera', email: 'yen.agui@gmail.com', es_admin: 0 },
    { nombre: 'Carlos', apellido: 'Sánchez', email: 'carlos.sanchez@email.com', es_admin: 0 },
    { nombre: 'Laura', apellido: 'Martínez', email: 'laura.martinez@email.com', es_admin: 0 },
    { nombre: 'Ana', apellido: 'Perez', email: 'ana.perez@email.com', es_admin: 0 },
    { nombre: 'Diego', apellido: 'Rodriguez', email: 'diego.rodriguez@email.com', es_admin: 0 }
];

// Ejecutar el proceso completo
db.exec(crebasSQL, async (err) => {
    if (err) return console.error('❌ Error creando tablas:', err.message);
    console.log('✅ Tablas creadas.');

    // Encriptar la contraseña común
    const hash = await bcrypt.hash(contraseñaComun, 10);

    // Insertar usuarios
    for (const u of usuarios) {
        db.run(
            `INSERT INTO usuarios (nombre, apellido, email, contraseña, es_admin) VALUES (?, ?, ?, ?, ?)`,
            [u.nombre, u.apellido, u.email, hash, u.es_admin],
            (err) => {
                if (err) console.error(`❌ Error insertando usuario ${u.email}:`, err.message);
            }
        );
    }

    console.log('✅ Usuarios insertados con contraseña encriptada.');

    // Ejecutar inserts de cursos, inscripciones, asignaciones
    db.exec(insertsSQL, (err) => {
        if (err) return console.error('❌ Error insertando inscripciones o asignaciones:', err.message);
        console.log('✅ Inscripciones y asignaciones insertadas.');
        db.close(() => {
            console.log('🎉 Base de datos lista y usuarios con clave "123456" encriptada.');
        });
    });
});
