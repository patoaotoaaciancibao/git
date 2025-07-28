// models/seccionmodel.js
const db = require('../db/conexion');

/**
 * Trae las últimas secciones creadas, junto al nombre de su curso.
 * @param {number} limit Cantidad máxima de secciones a devolver (por defecto 6)
 * @returns {Promise<Array<{ id_seccion, nombre, portada, curso_id, nombre_curso }>>}
 */
function obtenerUltimasSecciones(limit = 6) {
  const sql = `
    SELECT
      s.id_seccion,
      s.titulo    AS nombre,
      s.portada,
      s.curso_id,
      c.nombre    AS nombre_curso
    FROM secciones s
    JOIN cursos c ON s.curso_id = c.id_curso
    ORDER BY s.id_seccion DESC
    LIMIT ?
  `;
  return new Promise((resolve, reject) => {
    db.all(sql, [limit], (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

/**
 * Trae una sección por su ID.
 * @param {number} idSeccion
 * @returns {Promise<{ id_seccion, nombre, portada, curso_id }>}
 */
function obtenerSeccionPorId(idSeccion) {
  const sql = `
    SELECT
      id_seccion,
      titulo    AS nombre,
      portada,
      curso_id
    FROM secciones
    WHERE id_seccion = ?
  `;
  return new Promise((resolve, reject) => {
    db.get(sql, [idSeccion], (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

/**
 * Actualiza el título y la portada de una sección.
 * @param {number} idSeccion
 * @param {string} nombre
 * @param {string|null} portada  Nombre de archivo de la portada (o null para no cambiar)
 * @returns {Promise<RunResult>}
 */
function actualizarSeccion(idSeccion, nombre, portada) {
  const sql = `
    UPDATE secciones
    SET titulo = ?, portada = ?
    WHERE id_seccion = ?
  `;
  return new Promise((resolve, reject) => {
    db.run(sql, [nombre, portada, idSeccion], function(err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

module.exports = {
  obtenerUltimasSecciones,
  obtenerSeccionPorId,
  actualizarSeccion
};
