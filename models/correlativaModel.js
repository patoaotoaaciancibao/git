// models/correlativaModel.js
const db = require('../db/conexion'); // Asegúrate de que la ruta sea correcta

const CORRELATIVA_MIN_NOTA_APROBACION = 5.5; // Definimos aquí la nota mínima de aprobación

const correlativaModel = {
    /**
     * Registra un curso como requisito para otro.
     * @param {number} id_curso El ID del curso que requiere el correlativo.
     * @param {number} id_curso_requisito El ID del curso que es el requisito previo.
     * @returns {Promise<boolean>} True si la correlativa se creó con éxito, false si ya existe.
     */
    crearCorrelativa: (id_curso, id_curso_requisito) => {
        const query = `INSERT INTO correlativas (id_curso, id_curso_requisito) VALUES (?, ?)`;
        return new Promise((resolve, reject) => {
            db.run(query, [id_curso, id_curso_requisito], function (err) {
                if (err) {
                    if (err.message.includes('SQLITE_CONSTRAINT_UNIQUE')) {
                        console.warn(`⚠️ Advertencia: La correlativa (Curso ${id_curso} requiere Curso ${id_curso_requisito}) ya existe.`);
                        return resolve(false); // Ya existe, no es un error fatal
                    }
                    console.error("Error al crear correlativa:", err);
                    return reject(err);
                }
                resolve(true); // Correlativa creada con éxito
            });
        });
    },

    /**
     * Elimina una relación de correlatividad.
     * @param {number} id_curso El ID del curso que tiene el requisito.
     * @param {number} id_curso_requisito El ID del curso que es el requisito previo.
     * @returns {Promise<boolean>} True si se eliminó con éxito, false si no se encontró.
     */
    eliminarCorrelativa: (id_curso, id_curso_requisito) => {
        const query = `DELETE FROM correlativas WHERE id_curso = ? AND id_curso_requisito = ?`;
        return new Promise((resolve, reject) => {
            db.run(query, [id_curso, id_curso_requisito], function (err) {
                if (err) {
                    console.error("Error al eliminar correlativa:", err);
                    return reject(err);
                }
                resolve(this.changes > 0); // Devuelve true si se eliminó al menos una fila
            });
        });
    },

    /**
     * Obtiene todos los cursos que son requisitos para un curso dado.
     * @param {number} id_curso El ID del curso del cual se quieren obtener los requisitos.
     * @returns {Promise<Array<Object>>} Un array de objetos con detalles de los cursos requisito.
     */
    obtenerCorrelativasDeCurso: (id_curso) => {
        const query = `
            SELECT
                c.id_curso_requisito,
                cu.nombre AS nombre_curso_requisito,
                cu.descripcion AS descripcion_curso_requisito
            FROM
                correlativas c
            JOIN
                cursos cu ON c.id_curso_requisito = cu.id_curso
            WHERE
                c.id_curso = ?
        `;
        return new Promise((resolve, reject) => {
            db.all(query, [id_curso], (err, rows) => {
                if (err) {
                    console.error("Error al obtener correlativas de curso:", err);
                    return reject(err);
                }
                resolve(rows);
            });
        });
    },

    /**
     * Obtiene todos los cursos que tienen correlativas definidas.
     * @returns {Promise<Array<Object>>} Un array de objetos con el id y nombre de los cursos que tienen requisitos.
     */
    obtenerCursosConCorrelativas: () => {
        const query = `
            SELECT
                c.id_curso,
                cu.nombre AS nombre_curso
            FROM
                correlativas c
            JOIN
                cursos cu ON c.id_curso = cu.id_curso
            GROUP BY
                c.id_curso, cu.nombre
            ORDER BY
                cu.nombre ASC
        `;
        return new Promise((resolve, reject) => {
            db.all(query, [], (err, rows) => {
                if (err) {
                    console.error("Error al obtener cursos con correlativas:", err);
                    return reject(err);
                }
                resolve(rows);
            });
        });
    },

    /**
     * Verifica si un alumno ha aprobado un curso específico.
     * Se considera "aprobado" si tiene una calificación igual o mayor a CORRELATIVA_MIN_NOTA_APROBACION.
     * @param {number} id_usuario El ID del alumno.
     * @param {number} id_curso El ID del curso a verificar.
     * @returns {Promise<boolean>} True si el alumno ha aprobado el curso, false en caso contrario.
     */
    haAprobadoCurso: (id_usuario, id_curso) => {
        const query = `
            SELECT calificacion
            FROM inscripciones
            WHERE id_usuario = ? AND id_curso = ? AND calificacion >= ?
        `;
        return new Promise((resolve, reject) => {
            db.get(query, [id_usuario, id_curso, CORRELATIVA_MIN_NOTA_APROBACION], (err, row) => {
                if (err) {
                    console.error("Error al verificar aprobación de curso:", err);
                    return reject(err);
                }
                resolve(!!row); // Devuelve true si encuentra una calificación que cumple, false si no
            });
        });
    }
};

module.exports = correlativaModel;