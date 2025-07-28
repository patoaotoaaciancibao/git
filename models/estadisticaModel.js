const db = require('../db/conexion');

// ✅ Curso con más inscriptos
function obtenerCursoConMasInscriptos() {
    const query = `
        SELECT c.id_curso, c.nombre AS nombre_curso, COUNT(*) AS total
        FROM inscripciones i
        JOIN cursos c ON i.id_curso = c.id_curso
        GROUP BY c.id_curso
        ORDER BY total DESC
        LIMIT 1;
    `;
    return new Promise((resolve, reject) => {
        db.get(query, [], (err, row) => {
            if (err) {
                console.error("Error al obtener curso con más inscriptos:", err);
                return reject(err);
            }
            resolve(row);
        });
    });
}

// ✅ Curso con más secciones
function obtenerCursoConMasSecciones() {
    const query = `
        SELECT c.id_curso, c.nombre AS nombre_curso, COUNT(*) AS total
        FROM secciones s
        JOIN cursos c ON s.curso_id = c.id_curso
        GROUP BY c.id_curso
        ORDER BY total DESC
        LIMIT 1;
    `;
    return new Promise((resolve, reject) => {
        db.get(query, [], (err, row) => {
            if (err) {
                console.error("Error al obtener curso con más secciones:", err);
                return reject(err);
            }
            resolve(row);
        });
    });
}

// ✅ Último alumno inscripto a un curso
function obtenerUltimaInscripcion() {
    const query = `
        SELECT
            u.id_usuario,
            u.nombre AS nombre_alumno,
            u.email,
            c.id_curso,
            c.nombre AS nombre_curso,
            i.fecha_inscripcion
        FROM inscripciones i
                 JOIN usuarios u ON i.id_usuario = u.id_usuario
                 JOIN cursos c ON i.id_curso = c.id_curso
        ORDER BY i.id_inscripcion DESC
        LIMIT 1;
    `;
    return new Promise((resolve, reject) => {
        db.get(query, [], (err, row) => {
            if (err) {
                console.error("Error al obtener última inscripción:", err);
                return reject(err);
            }
            resolve(row);
        });
    });
}

// ✅ Usuario con más cursos inscriptos
function obtenerUsuarioConMasCursos() {
    const query = `
        SELECT u.id_usuario, u.nombre AS nombre_alumno, COUNT(*) AS total
        FROM inscripciones i
        JOIN usuarios u ON i.id_usuario = u.id_usuario
        GROUP BY u.id_usuario
        ORDER BY total DESC
        LIMIT 1;
    `;
    return new Promise((resolve, reject) => {
        db.get(query, [], (err, row) => {
            if (err) {
                console.error("Error al obtener usuario con más cursos:", err);
                return reject(err);
            }
            resolve(row);
        });
    });
}

// ✅ Último usuario creado
function obtenerUltimoUsuarioCreado() {
    const query = `
        SELECT id_usuario, nombre, email, fecha_creacion
        FROM usuarios
        ORDER BY fecha_creacion DESC
        LIMIT 1;
    `;
    return new Promise((resolve, reject) => {
        db.get(query, [], (err, row) => {
            if (err) {
                console.error("Error al obtener último usuario creado:", err);
                return reject(err);
            }
            resolve(row);
        });
    });
}

// ✅ Exportar funciones
module.exports = {
    obtenerCursoConMasInscriptos,
    obtenerCursoConMasSecciones,
    obtenerUltimaInscripcion,
    obtenerUsuarioConMasCursos,
    obtenerUltimoUsuarioCreado
};
