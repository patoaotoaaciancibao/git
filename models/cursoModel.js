// models/cursoModel.js
const db = require('../db/conexion');

/* ========================
📥 INSERCIONES
======================== */
function insertarCurso(nombre, descripcion, imagen = null) {
    const sql = `INSERT INTO cursos (nombre, descripcion, imagen, publicado) VALUES (?, ?, ?, 0)`;
    return new Promise((resolve, reject) => {
        db.run(sql, [nombre, descripcion, imagen], function (err) {
            if (err) reject(err);
            else resolve({
                id: this.lastID,
                nombre,
                descripcion,
                imagen,
                publicado: false
            });
        });
    });
}

function actualizarCurso(id, nombre, descripcion, imagen) {
    const query = `
        UPDATE cursos
        SET nombre = ?, descripcion = ?, imagen = ?
        WHERE id_curso = ?
    `;
    return new Promise((resolve, reject) => {
        db.run(query, [nombre, descripcion, imagen, id], function (err) {
            if (err) reject(err);
            else resolve(this.changes);
        });
    });
}

function insertarSeccionEnCurso(cursoId, titulo, descripcion) {
    const query = `INSERT INTO secciones (curso_id, titulo, descripcion) VALUES (?, ?, ?)`;
    return new Promise((resolve, reject) => {
        db.run(query, [cursoId, titulo, descripcion], function (err) {
            if (err) reject(err);
            else resolve(this.lastID);
        });
    });
}

function setNombreVideoCurso(idCurso, nombreArchivo) {
    return new Promise((resolve, reject) => {
        const query = `UPDATE cursos SET video = ? WHERE id_curso = ?`;
        db.run(query, [nombreArchivo, idCurso], function (err) {
            if (err) reject(err);
            else resolve(this.changes);
        });
    });
}




function agregarComentario(id_usuario, id_curso, comentario, estrellas) {
    const query = `INSERT INTO comentarios (id_usuario, id_curso, comentario, estrellas) VALUES (?, ?, ?, ?)`;
    return new Promise((resolve, reject) => {
        db.run(query, [id_usuario, id_curso, comentario, estrellas], function (err) {
            if (err) reject(err);
            else resolve(this.lastID);
        });
    });
}

/* ========================
📤 CONSULTAS GENERALES
======================== */
function obtenerCursos() {
    const query = `
        SELECT c.id_curso AS id, c.nombre, c.descripcion, c.publicado,
               cat.nombre AS nombre_categoria, c.imagen,
               COUNT(ins.id_inscripcion) AS cantidad_inscriptos
        FROM cursos c
        LEFT JOIN categorias cat ON c.id_categoria = cat.id_categoria
        LEFT JOIN inscripciones ins ON ins.id_curso = c.id_curso
        GROUP BY c.id_curso, c.nombre, c.descripcion, c.publicado, cat.nombre
        ORDER BY c.nombre ASC
    `;
    return new Promise((resolve, reject) => {
        db.all(query, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function obtenerCursoPorId(idCurso) {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM cursos WHERE id_curso = ?`;
        db.get(query, [idCurso], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

function obtenerSeccionesCurso(idCurso) {
    const query = `SELECT id_seccion, titulo, descripcion, video, curso_id FROM secciones WHERE curso_id = ?`;
    return new Promise((resolve, reject) => {
        db.all(query, [idCurso], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function buscarCursosPublicadosPorNombre(nombre) {
    const query = `SELECT * FROM cursos WHERE publicado = 1 AND LOWER(nombre) LIKE LOWER(?)`;
    return new Promise((resolve, reject) => {
        db.all(query, [`%${nombre}%`], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

/* ========================
📢 PUBLICACIÓN
======================== */
function publicarCurso(idCurso) {
    const query = `UPDATE cursos SET publicado = 1 WHERE id_curso = ? AND publicado = 0`;
    return new Promise((resolve, reject) => {
        db.run(query, [idCurso], function (err) {
            if (err) reject(err);
            else resolve(this.changes);
        });
    });
}

/* ========================
📊 CONTADORES Y POPULARES
======================== */
function contarCursosPublicados() {
    const query = 'SELECT COUNT(id_curso) AS total_publicados FROM cursos WHERE publicado = 1';
    return new Promise((resolve, reject) => {
        db.get(query, [], (err, row) => {
            if (err) reject(err);
            else resolve(row ? row.total_publicados : 0);
        });
    });
}

function contarCursosNoPublicados() {
    const query = 'SELECT COUNT(id_curso) AS total_no_publicados FROM cursos WHERE publicado = 0';
    return new Promise((resolve, reject) => {
        db.get(query, [], (err, row) => {
            if (err) reject(err);
            else resolve(row ? row.total_no_publicados : 0);
        });
    });
}

function obtenerCursosPopulares(limite = 8) {
    const query = `
        SELECT c.id_curso, c.nombre AS nombre_curso, c.descripcion, c.publicado,
               COUNT(i.id_inscripcion) AS cantidad_inscriptos
        FROM cursos c
        LEFT JOIN inscripciones i ON c.id_curso = i.id_curso
        WHERE c.publicado = 1
        GROUP BY c.id_curso, c.nombre, c.descripcion, c.publicado
        ORDER BY cantidad_inscriptos DESC, c.nombre ASC
        LIMIT ?
    `;
    return new Promise((resolve, reject) => {
        db.all(query, [limite], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

/* ========================
📋 LISTADOS ESPECIALES
======================== */
function obtenerTodosLosCursosSimples() {
    const query = 'SELECT id_curso, nombre FROM cursos WHERE publicado = 1 ORDER BY nombre';
    return new Promise((resolve, reject) => {
        db.all(query, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function obtenerCursosPublicados() {
    const query = `
        SELECT id_curso, nombre, descripcion, imagen
        FROM cursos
        WHERE publicado = 1
        ORDER BY nombre
    `;
    return new Promise((resolve, reject) => {
        db.all(query, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function obtenerCursosPublicadosNoAsignados() {
    const query = `
        SELECT c.id_curso, c.nombre
        FROM cursos c
        WHERE c.publicado = 1
        AND c.id_curso NOT IN (SELECT id_curso FROM asignaciones)
    `;
    return new Promise((resolve, reject) => {
        db.all(query, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

/* ========================
👥 RELACIONES USUARIO-CURSO
======================== */
function obtenerCursosPorProfesor(idProfesor) {
    const query = `
        SELECT c.id_curso, c.nombre, c.descripcion
        FROM cursos c
        INNER JOIN asignaciones a ON c.id_curso = a.id_curso
        WHERE a.id_usuario = ?
    `;
    return new Promise((resolve, reject) => {
        db.all(query, [idProfesor], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function obtenerCursosComoAlumno(idUsuario) {
    const query = `
        SELECT c.id_curso, c.nombre, c.descripcion, cal.calificacion
        FROM cursos c
        INNER JOIN inscripciones i ON c.id_curso = i.id_curso
        LEFT JOIN calificaciones cal ON c.id_curso = cal.id_curso AND i.id_usuario = cal.id_usuario
        WHERE i.id_usuario = ?
    `;
    return new Promise((resolve, reject) => {
        db.all(query, [idUsuario], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}


function verificarInscripcion(idUsuario, idCurso) {
    const query = `SELECT 1 FROM inscripciones WHERE id_usuario = ? AND id_curso = ?`;
    return new Promise((resolve, reject) => {
        db.get(query, [idUsuario, idCurso], (err, row) => {
            if (err) reject(err);
            else resolve(!!row);
        });
    });
}

function verificarSiSoyProfesor(idUsuario, idCurso) {
    const query = `SELECT 1 FROM asignaciones WHERE id_usuario = ? AND id_curso = ?`;
    return new Promise((resolve, reject) => {
        db.get(query, [idUsuario, idCurso], (err, row) => {
            if (err) reject(err);
            else resolve(!!row);
        });
    });
}

/* ========================
⭐ COMENTARIOS
======================== */
function obtenerComentariosDelCurso(idCurso) {
    const query = `
        SELECT c.comentario, c.estrellas, u.nombre AS nombre_usuario
        FROM comentarios c
        JOIN usuarios u ON c.id_usuario = u.id_usuario
        WHERE c.id_curso = ?
        ORDER BY c.id DESC
    `;
    return new Promise((resolve, reject) => {
        db.all(query, [idCurso], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function obtenerUltimosComentarios(limit = 10) {
    const query = `
        SELECT com.comentario, com.estrellas,
               u.nombre AS nombre_usuario,
               c.nombre AS nombre_curso
        FROM comentarios com
        JOIN usuarios u ON com.id_usuario = u.id_usuario
        JOIN cursos c ON com.id_curso = c.id_curso
        ORDER BY com.id DESC
        LIMIT ?
    `;
    return new Promise((resolve, reject) => {
        db.all(query, [limit], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function obtenerPromedioEstrellasDelCurso(idCurso) {
    const query = `SELECT AVG(estrellas) AS promedio FROM comentarios WHERE id_curso = ?`;
    return new Promise((resolve, reject) => {
        db.get(query, [idCurso], (err, row) => {
            if (err) reject(err);
            else resolve(row?.promedio !== null ? parseFloat(row.promedio).toFixed(1) : null);
        });
    });
}

/* ========================
📚 NUEVA FUNCIÓN CATEGORÍA
======================== */
function obtenerNombreCategoriaPorCurso(idCurso) {
    const query = `
        SELECT cat.id_categoria,
               cat.nombre AS nombre_categoria
        FROM cursos c
        LEFT JOIN categorias cat ON c.id_categoria = cat.id_categoria
        WHERE c.id_curso = ?
    `;
    return new Promise((resolve, reject) => {
        db.get(query, [idCurso], (err, row) => {
            if (err) reject(err);
            else resolve(row || { id_categoria: null, nombre_categoria: 'Sin categoría' });
        });
    });
}

function editarCurso(id, nombre, descripcion, imagen, publicado) {
  return new Promise((resolve, reject) => {
    // Asegúrate de que 'publicado' sea un valor de tipo entero (1 para verdadero, 0 para falso)
    const publicadoStatus = publicado ? 1 : 0;

    const query = `
      UPDATE cursos 
      SET nombre = ?, descripcion = ?, imagen = ?, publicado = ? 
      WHERE id_curso = ?
    `;

    db.run(query, [nombre, descripcion, imagen, publicadoStatus, id], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.changes); // Devuelve el número de filas afectadas
      }
    });
  });
}

/* ========================
📦 EXPORTACIÓN
======================== */
module.exports = {
    insertarCurso,
    actualizarCurso,
    insertarSeccionEnCurso,
    agregarComentario,
    setNombreVideoCurso,
    obtenerCursos,
    obtenerCursoPorId,
    obtenerSeccionesCurso,
    buscarCursosPublicadosPorNombre,
    publicarCurso,
    contarCursosPublicados,
    contarCursosNoPublicados,
    obtenerCursosPopulares,
    obtenerTodosLosCursosSimples,
    obtenerCursosPublicados,
    obtenerCursosPublicadosNoAsignados,
    obtenerCursosPorProfesor,
    obtenerCursosComoAlumno,
    verificarInscripcion,
    verificarSiSoyProfesor,
    obtenerComentariosDelCurso,
    obtenerUltimosComentarios,
    obtenerPromedioEstrellasDelCurso,
    obtenerNombreCategoriaPorCurso,
    editarCurso
};
