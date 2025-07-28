//asignacionModel.js
const db = require('../db/conexion');

// Obtener la lista de profesores
// Obtener la lista completa de profesores activos (independiente de asignaciones)
function obtenerProfesores() {
    const query = `
        SELECT id_usuario AS id, nombre, apellido, email
        FROM usuarios
        WHERE rol = 'profesor' AND activo = 1
    `;
    return new Promise((resolve, reject) => {
        db.all(query, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

// Obtener la lista de cursos publicados (para el formulario)
function obtenerCursosPublicados() {
    const query = `SELECT id_curso AS id, nombre FROM cursos WHERE publicado = 1`;
    return new Promise((resolve, reject) => {
        db.all(query, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

// Verificar si un profesor ya está asignado a un curso
function existeAsignacion(id_curso, id_usuario) {
    const query = `SELECT * FROM asignaciones WHERE id_curso = ? AND id_usuario = ?`;
    return new Promise((resolve, reject) => {
        db.get(query, [id_curso, id_usuario], (err, row) => {
            if (err) {
                console.error("❌ Error en la consulta de existencia:", err);
                reject(err);
            } else {
                console.log("🔍 Verificando existencia:", { id_curso, id_usuario, resultado: row });
                resolve(row);
            }
        });
    });
}


// Insertar una nueva asignación (profesor-curso)
function asignarProfesorACurso(id_curso, id_usuario) {
    const query = `INSERT INTO asignaciones (id_curso, id_usuario) VALUES (?, ?)`;
    return new Promise((resolve, reject) => {
        console.log("📥 Ejecutando INSERT con:", id_curso, id_usuario); // <-- AGREGÁ ESTO
        db.run(query, [id_curso, id_usuario], function (err) {
            if (err) {
                console.error("❌ Error en INSERT:", err); // <-- AGREGÁ ESTO
                reject(err);
            } else {
                resolve(true);
            }
        });
    });
}


// Obtener todas las asignaciones con detalles (profesor + curso)
function obtenerAsignacionesConDetalle() {
    const query = `
        SELECT
            a.id_asignacion,
            a.id_usuario,
            a.id_curso,
            u.nombre AS nombre_profesor,
            c.nombre AS titulo_curso,
            c.publicado
        FROM asignaciones a
                 JOIN usuarios u ON a.id_usuario = u.id_usuario
                 JOIN cursos c ON a.id_curso = c.id_curso
    `;
    return new Promise((resolve, reject) => {
        db.all(query, [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function obtenerProfesoresPorCurso(idCurso) {
    const query = `
        SELECT u.id_usuario AS id, u.nombre, u.apellido, u.email
        FROM asignaciones a
                 JOIN usuarios u ON a.id_usuario = u.id_usuario
        WHERE a.id_curso = ? AND u.rol = 'profesor'
    `;
    return new Promise((resolve, reject) => {
        db.all(query, [idCurso], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function eliminarAsignacion(idAsignacion) {
    return new Promise((resolve, reject) => {
        const query = `DELETE FROM asignaciones WHERE id_asignacion = ?`;
        db.run(query, [idAsignacion], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.changes > 0); // true si se eliminó algo
            }
        });
    });
}

module.exports = {
    obtenerProfesores,
    obtenerCursosPublicados,
    existeAsignacion,
    asignarProfesorACurso,
    obtenerAsignacionesConDetalle,
    obtenerProfesoresPorCurso,
    eliminarAsignacion
};
