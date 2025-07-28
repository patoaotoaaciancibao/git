// models/inscripcionModel.js
const db = require('../db/conexion'); // Asegúrate de que la ruta sea correcta

// ✅ Crear inscripción
function crearInscripcion(id_usuario, id_curso, fecha_inscripcion = null) {
    const obtenerSoloFecha = () => {
        const ahora = new Date();
        const año = ahora.getFullYear();
        const mes = String(ahora.getMonth() + 1).padStart(2, '0');
        const dia = String(ahora.getDate()).padStart(2, '0');
        return `${año}-${mes}-${dia}`;
    };

    const fechaFinal = fecha_inscripcion || obtenerSoloFecha();

    const query = `INSERT INTO inscripciones (id_usuario, id_curso, fecha_inscripcion) VALUES (?, ?, ?)`;

    return new Promise((resolve, reject) => {
        db.run(query, [id_usuario, id_curso, fechaFinal], function (err) {
            if (err) {
                console.error("Error al insertar inscripción:", err);
                return reject(err);
            }
            resolve(true);
        });
    });
}

// ✅ Verificar si un usuario ya está inscripto en un curso
function verificarInscripcionPorUsuarioCurso(id_usuario, id_curso) {
    const query = `SELECT 1 FROM inscripciones WHERE id_usuario = ? AND id_curso = ?`;
    return new Promise((resolve, reject) => {
        db.get(query, [id_usuario, id_curso], (err, row) => {
            if (err) return reject(err);
            resolve(!!row);
        });
    });
}

// ✅ Listar inscripciones con detalle de curso y alumno
function listarInscripcionesConDetalle() {
    const query = `
        SELECT
            i.id_inscripcion,
            i.fecha_inscripcion,
            c.id_curso,
            c.nombre AS nombre_curso,
            u.id_usuario,
            u.nombre AS nombre_alumno,
            u.apellido AS apellido_alumno
        FROM
            inscripciones i
        JOIN
            cursos c ON i.id_curso = c.id_curso
        JOIN
            usuarios u ON i.id_usuario = u.id_usuario
        ORDER BY
            i.fecha_inscripcion DESC
    `;
    return new Promise((resolve, reject) => {
        db.all(query, [], (err, rows) => {
            if (err) {
                console.error("Error al listar inscripciones con detalle:", err);
                return reject(err);
            }
            resolve(rows);
        });
    });
}

// ✅ Obtener alumnos por curso (la nueva función que necesitas)
function obtenerAlumnosPorCurso(idCurso) {
    const query = `
        SELECT u.id_usuario, u.nombre, u.apellido, i.calificacion
        FROM usuarios u
        LEFT JOIN inscripciones i ON u.id_usuario = i.id_usuario
        WHERE i.id_curso = ?
    `;
    return new Promise((resolve, reject) => {
        db.all(query, [idCurso], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}


// ✅ Borrar inscripción
function borrarInscripcion(idInscripcion) {
    const query = `DELETE FROM inscripciones WHERE id_inscripcion = ?`;
    return new Promise((resolve, reject) => {
        db.run(query, [idInscripcion], function (err) {
            if (err) {
                console.error("Error al borrar inscripción:", err);
                return reject(err);
            }
            resolve(this.changes > 0);
        });
    });
}

// Agregar o actualizar la calificación de un alumno en un curso
function agregarCalificacion(idAlumno, idCurso, calificacion) {
  console.log("Agregando calificación:", idAlumno, idCurso, calificacion);  // Verifica los parámetros

  const query = `UPDATE inscripciones SET calificacion = ? WHERE id_usuario = ? AND id_curso = ?`;
  return new Promise((resolve, reject) => {
    db.run(query, [calificacion, idAlumno, idCurso], function(err) {
      if (err) reject(err);
      else resolve(this.changes);  // Asegúrate de que this.changes sea > 0
    });
  });
}




// Obtener la calificación de un alumno en un curso específico
function obtenerCalificacionPorAlumno(id_usuario, id_curso) {
    const query = `SELECT calificacion FROM inscripciones WHERE id_usuario = ? AND id_curso = ?`;
    return new Promise((resolve, reject) => {
        db.get(query, [id_usuario, id_curso], (err, row) => {
            if (err) reject(err);
            else resolve(row ? row.calificacion : null);  // Si no tiene calificación, devuelve null
        });
    });
}

// Obtener todos los alumnos con sus calificaciones en un curso
function obtenerAlumnosConCalificaciones(idCurso) {
    const query = `
    SELECT u.id_usuario, u.nombre, u.apellido, i.calificacion
    FROM inscripciones i
    INNER JOIN usuarios u ON i.id_usuario = u.id_usuario
    WHERE i.id_curso = ?
  `;
    return new Promise((resolve, reject) => {
        db.all(query, [idCurso], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

// Obtener inscripción por alumno y curso
function obtenerInscripcionPorAlumno(idAlumno, idCurso) {
  const query = `SELECT * FROM inscripciones WHERE id_usuario = ? AND id_curso = ?`;
  return new Promise((resolve, reject) => {
    db.get(query, [idAlumno, idCurso], (err, row) => {
      if (err) return reject(err);
      resolve(row); // Devuelve la inscripción, que contiene la calificación
    });
  });
}

// ✅ Exportar funciones
module.exports = {
    crearInscripcion,
    verificarInscripcionPorUsuarioCurso,
    listarInscripcionesConDetalle,
    obtenerAlumnosPorCurso,
    borrarInscripcion,
    agregarCalificacion,
    obtenerCalificacionPorAlumno,
    obtenerAlumnosConCalificaciones,
    obtenerInscripcionPorAlumno //
};
