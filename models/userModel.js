const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');
const logger = require('../utils/logger');
const dbPath = path.resolve(__dirname, '../db/database.sqlite');
const db = new sqlite3.Database(dbPath);

/* -------------------- AUTENTICACIÓN Y ADMIN -------------------- */

function getUserByEmail(email) {
    const query = 'SELECT * FROM usuarios WHERE email = ?';
    return new Promise((resolve, reject) => {
        db.get(query, [email], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

function loginAdmin(email, password) {
    const query = 'SELECT * FROM usuarios WHERE email = ? AND es_admin = 1';
    return new Promise((resolve, reject) => {
        db.get(query, [email], async (err, row) => {
            if (err) {
                logger.error(`LOGIN ADMIN FALLIDO - Email: ${email} - Error BD: ${err.message}`);
                return reject({ type: "DB_ERROR", message: "Error de base de datos" });
            }
            if (!row) {
                logger.warn(`LOGIN ADMIN FALLIDO - Email: ${email} - Usuario no encontrado o no es admin`);
                return reject({ type: "LOGIN_ERROR", message: "Usuario no encontrado o no es admin" });
            }
            const match = await bcrypt.compare(password, row.contraseña);
            if (!match) {
                logger.warn(`LOGIN ADMIN FALLIDO - Email: ${email} - Contraseña incorrecta`);
                return reject({ type: "LOGIN_ERROR", message: "Contraseña incorrecta" });
            }
            logger.info(`LOGIN ADMIN EXITOSO - Email: ${email}`);
            resolve(row);
        });
    });
}

function esSuperAdmin(user) {
    return user && user.es_admin === 1;
}

/* -------------------- CRUD DE USUARIOS -------------------- */

async function crearUsuario(nombre, apellido, email, password, rol, es_admin) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const fechaCreacion = new Date().toISOString();
    const activo = 1;

    return new Promise((resolve, reject) => {
        const checkEmailQuery = 'SELECT COUNT(*) AS count FROM usuarios WHERE email = ?';
        db.get(checkEmailQuery, [email], (err, row) => {
            if (err) return reject(err);
            if (row.count > 0) return reject(new Error('El email ya está registrado.'));

            const insertUserQuery = `
                INSERT INTO usuarios (nombre, apellido, email, contraseña, rol, es_admin, activo, fecha_creacion)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
            db.run(insertUserQuery, [nombre, apellido, email, hashedPassword, rol, es_admin, activo, fechaCreacion], function (err) {
                if (err) return reject(err);
                resolve(true);
            });
        });
    });
}

async function actualizarUsuario(id_usuario, nombre, apellido, email, password, rol, es_admin) {
    let updatePasswordQuery = '';
    let hashedPassword = null;
    let queryParams = [];

    if (password) {
        hashedPassword = await bcrypt.hash(password, 10);
        updatePasswordQuery = ', contraseña = ?';
        queryParams.push(hashedPassword);
    }

    const query = `UPDATE usuarios SET nombre = ?, apellido = ?, email = ?, rol = ?, es_admin = ?${updatePasswordQuery} WHERE id_usuario = ?`;
    queryParams.unshift(nombre, apellido, email, rol, es_admin);
    queryParams.push(id_usuario);

    return new Promise((resolve, reject) => {
        const checkEmailQuery = 'SELECT id_usuario FROM usuarios WHERE email = ? AND id_usuario != ?';
        db.get(checkEmailQuery, [email, id_usuario], (err, row) => {
            if (err) return reject(err);
            if (row) return reject(new Error('El email ya está registrado por otro usuario.'));

            db.run(query, queryParams, function (err) {
                if (err) return reject(err);
                resolve(true);
            });
        });
    });
}

function actualizarContrasena(id, nuevaHash) {
    const query = 'UPDATE usuarios SET contraseña = ? WHERE id_usuario = ?';
    return new Promise((resolve, reject) => {
        db.run(query, [nuevaHash, id], function (err) {
            if (err) reject(err);
            else resolve();
        });
    });
}

// --- NUEVA FUNCIÓN AÑADIDA ---
function updateProfilePhoto(userId, filename) {
    const sql = 'UPDATE usuarios SET foto_perfil = ? WHERE id_usuario = ?';
    return new Promise((resolve, reject) => {
        db.run(sql, [filename, userId], function(err) {
            if (err) reject(err);
            else resolve();
        });
    });
}

function darDeBaja(id_usuario) {
    const query = 'UPDATE usuarios SET activo = 0 WHERE id_usuario = ?';
    return new Promise((resolve, reject) => {
        db.run(query, [id_usuario], function (err) {
            if (err) reject(err);
            else resolve();
        });
    });
}

/* -------------------- LISTAR Y OBTENER -------------------- */

function listar() {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM usuarios', (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function listarTodosLosUsuarios() {
    return new Promise((resolve, reject) => {
        db.all('SELECT id_usuario, nombre, apellido, email, rol, es_admin FROM usuarios', (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function obtenerUsuarioPorId(id) {
    const query = 'SELECT * FROM usuarios WHERE id_usuario = ?';
    return new Promise((resolve, reject) => {
        db.get(query, [id], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

function obtenerProfesores() {
    const query = `
        SELECT DISTINCT u.id_usuario, u.nombre, u.apellido, u.email
        FROM usuarios u
        INNER JOIN asignaciones a ON u.id_usuario = a.id_usuario
        INNER JOIN cursos c ON a.id_curso = c.id_curso
        WHERE u.rol = 'profesor' AND u.activo = 1 AND c.publicado = 1
    `;
    return new Promise((resolve, reject) => {
        db.all(query, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function obtenerProfesoresDisponibles() {
    const query = `
        SELECT u.id_usuario, u.nombre, u.apellido, u.email
        FROM usuarios u
        LEFT JOIN asignaciones a ON u.id_usuario = a.id_usuario
        WHERE u.rol = 'profesor' AND u.activo = 1 AND a.id_asignacion IS NULL
    `;
    return new Promise((resolve, reject) => {
        db.all(query, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function obtenerAlumnos() {
    return new Promise((resolve, reject) => {
        db.all(`SELECT id_usuario, nombre, apellido, email, rol FROM usuarios WHERE rol = 'alumno'`, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function obtenerTodosLosAlumnosSimples() {
    return new Promise((resolve, reject) => {
        db.all(`SELECT id_usuario, nombre, apellido FROM usuarios WHERE rol = 'alumno' ORDER BY nombre, apellido`, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

/* -------------------- CONTADORES -------------------- */

function contarCursosComoAlumno(idUsuario) {
    const query = 'SELECT COUNT(id_inscripcion) AS total_cursos_alumno FROM inscripciones WHERE id_usuario = ?';
    return new Promise((resolve, reject) => {
        db.get(query, [idUsuario], (err, row) => {
            if (err) reject(err);
            else resolve(row ? row.total_cursos_alumno : 0);
        });
    });
}

function contarCursosComoProfesor(idUsuario) {
    const query = 'SELECT COUNT(id_curso) AS total_cursos_profesor FROM asignaciones WHERE id_usuario = ?';
    return new Promise((resolve, reject) => {
        db.get(query, [idUsuario], (err, row) => {
            if (err) reject(err);
            else resolve(row ? row.total_cursos_profesor : 0);
        });
    });
}

function contarTotalAlumnos() {
    return new Promise((resolve, reject) => {
        db.get(`SELECT COUNT(id_usuario) AS total_alumnos FROM usuarios WHERE rol = 'alumno'`, (err, row) => {
            if (err) reject(err);
            else resolve(row ? row.total_alumnos : 0);
        });
    });
}

function contarTotalProfesores() {
    return new Promise((resolve, reject) => {
        db.get(`SELECT COUNT(id_usuario) AS total_profesores FROM usuarios WHERE rol = 'profesor'`, (err, row) => {
            if (err) reject(err);
            else resolve(row ? row.total_profesores : 0);
        });
    });
}


function actualizarDatosPersonales(idUsuario, nombre, apellido) {
  const sql = `UPDATE usuarios SET nombre = ?, apellido = ? WHERE id_usuario = ?`;
  return new Promise((resolve, reject) => {
    db.run(sql, [nombre, apellido, idUsuario], function(err) {
      if (err) reject(err);
      else resolve(this.changes);
    });
  });
}

/* -------------------- EXPORTACIONES -------------------- */

module.exports = {
    getUserByEmail,
    loginAdmin,
    esSuperAdmin,
    crearUsuario,
    actualizarUsuario,
    actualizarContrasena,
    darDeBaja,
    listar,
    listarTodosLosUsuarios,
    obtenerUsuarioPorId,
    obtenerProfesores,
    obtenerProfesoresAsignados: obtenerProfesores, // alias
    obtenerProfesoresDisponibles,
    obtenerAlumnos,
    obtenerTodosLosAlumnosSimples,
    contarCursosComoAlumno,
    contarCursosComoProfesor,
    contarTotalAlumnos,
    contarTotalProfesores,
    updateProfilePhoto,
    actualizarDatosPersonales
};
