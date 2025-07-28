const db = require('../db/conexion');
// Obtener las 4 categorías con más cursos publicados
function obtenerTopCategoriasConCursos() {
    const query = `
        SELECT c.id_categoria, c.nombre AS nombre_categoria,c.imagen, COUNT(*) AS cantidad_cursos
        FROM cursos cu
                 JOIN categorias c ON cu.id_categoria = c.id_categoria
        WHERE cu.publicado = 1
          AND LOWER(c.nombre) NOT LIKE '%prueba%'  -- Excluye categorías con "prueba"
          AND cu.id_categoria != 99                -- Evita categorías dummy o sin uso real
        GROUP BY c.id_categoria
        ORDER BY cantidad_cursos DESC
        LIMIT 4
    `;
    return new Promise((resolve, reject) => {
        db.all(query, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}
function obtenerTodasLasCategorias() {
    const query = `SELECT id_categoria, nombre AS nombre_categoria, imagen FROM categorias ORDER BY nombre`;

    return new Promise((resolve, reject) => {
        db.all(query, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}
function listarCategoriasConCursos() {
    const query = `
        SELECT c.id_categoria, c.nombre AS nombre_categoria, c.imagen, cu.id_curso, cu.nombre AS nombre_curso
        FROM categorias c
                 LEFT JOIN cursos cu ON cu.id_categoria = c.id_categoria
        ORDER BY c.nombre, cu.nombre;
    `;

    return new Promise((resolve, reject) => {
        db.all(query, (err, rows) => {
            if (err) return reject(err);

            // Agrupar cursos por categoría
            const agrupado = [];

            rows.forEach(row => {
                let cat = agrupado.find(c => c.id_categoria === row.id_categoria);

                if (!cat) {
                    cat = {
                        id_categoria: row.id_categoria,
                        nombre_categoria: row.nombre_categoria,
                        imagen: row.imagen, // 🛠️ AÑADIMOS ESTO
                        cursos: []
                    };
                    agrupado.push(cat);
                }

                if (row.id_curso) {
                    cat.cursos.push({
                        id: row.id_curso,
                        nombre: row.nombre_curso
                    });
                }
            });

            // Agregar cantidad de cursos por categoría
            agrupado.forEach(cat => {
                cat.cantidad_cursos = cat.cursos.length;
            });

            resolve(agrupado);
        });
    });
}
function listarCategoriasConCursosPublicados() {
    const query = `
        SELECT c.id_categoria, c.nombre AS nombre_categoria, c.imagen,
               cu.id_curso, cu.nombre AS nombre_curso
        FROM categorias c
        LEFT JOIN cursos cu ON cu.id_categoria = c.id_categoria AND cu.publicado = 1
        ORDER BY c.nombre, cu.nombre;
    `;

    return new Promise((resolve, reject) => {
        db.all(query, (err, rows) => {
            if (err) return reject(err);

            const agrupado = [];

            rows.forEach(row => {
                let cat = agrupado.find(c => c.id_categoria === row.id_categoria);

                if (!cat) {
                    cat = {
                        id_categoria: row.id_categoria,
                        nombre_categoria: row.nombre_categoria,
                        imagen: row.imagen,
                        cursos: []
                    };
                    agrupado.push(cat);
                }

                if (row.id_curso) {
                    cat.cursos.push({
                        id: row.id_curso,
                        nombre: row.nombre_curso
                    });
                }
            });

            agrupado.forEach(cat => {
                cat.cantidad_cursos = cat.cursos.length;
            });

            resolve(agrupado);
        });
    });
}
// Crear nueva categoría
function crearCategoria(nombre) {
    const sql = `INSERT INTO categorias (nombre) VALUES (?)`;
    return new Promise((resolve, reject) => {
        db.run(sql, [nombre], function(err) {
            if (err) return reject(err);
            resolve({
                id: this.lastID,
                nombre
            });
        });
    });
}
function buscarCategoriaPorId(id) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT id_categoria, nombre AS nombre_categoria, imagen FROM categorias WHERE id_categoria = ?`;
        db.get(sql, [id], (err, row) => {
            if (err) return reject(err);
            resolve(row);
        });
    });
}


function buscarCategoriaPorCurso(idCurso) {
    return new Promise((resolve, reject) => {
        const sql = `
      SELECT c.id_categoria, c.nombre AS nombre_categoria, c.imagen
      FROM categorias c
      INNER JOIN cursos cu ON cu.id_categoria = c.id_categoria
      WHERE cu.id_curso = ?
    `;
        db.get(sql, [idCurso], (err, row) => {
            if (err) return reject(err);
            resolve(row);
        });
    });
}


function obtenerCursosPorCategoria(idCategoria) {
    const sql = `
        SELECT
            cu.*,
            u.nombre AS nombre_profesor,
            u.apellido AS apellido_profesor,
            COUNT(i.id_inscripcion) AS cantidad_inscriptos
        FROM cursos cu
                 LEFT JOIN asignaciones a ON cu.id_curso = a.id_curso
                 LEFT JOIN usuarios u ON a.id_usuario = u.id_usuario AND u.rol = 'profesor'
                 LEFT JOIN inscripciones i ON cu.id_curso = i.id_curso
        WHERE cu.id_categoria = ?
          AND cu.publicado = 1  -- ⚠️ Solo cursos públicos
        GROUP BY cu.id_curso
    `;
    return new Promise((resolve, reject) => {
        db.all(sql, [idCategoria], (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
}

function editarCategoria(id, nombre, nombreImagen = null) {
    return new Promise((resolve, reject) => {
        let sql, params;

        if (nombreImagen) {
            sql = `UPDATE categorias SET nombre = ?, imagen = ? WHERE id_categoria = ?`;
            params = [nombre, nombreImagen, id];
        } else {
            sql = `UPDATE categorias SET nombre = ? WHERE id_categoria = ?`;
            params = [nombre, id];
        }

        db.run(sql, params, function(err) {
            if (err) return reject(err);
            resolve(this);
        });
    });
}
function guardarImagenCategoria(id, nombreImagen) {
    return new Promise((resolve, reject) => {
        const sql = `UPDATE categorias SET imagen = ? WHERE id_categoria = ?`;
        db.run(sql, [nombreImagen, id], function(err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}


module.exports = {
    obtenerTopCategoriasConCursos,
    obtenerTodasLasCategorias,
    listarCategoriasConCursos,
    crearCategoria,
    buscarCategoriaPorId,
    buscarCategoriaPorCurso,
    obtenerCursosPorCategoria,
    listarCategoriasConCursosPublicados,
    editarCategoria,
    guardarImagenCategoria
}