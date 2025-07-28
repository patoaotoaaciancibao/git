const express = require("express");
const router = express.Router();
const db = require("../../db/conexion");

// Mostrar listado de asignaciones
router.get("/", (req, res) => {
  const query = `
    SELECT a.id_asignacion, u.nombre || ' ' || u.apellido AS profesor, c.nombre AS curso
    FROM asignaciones a
    JOIN usuarios u ON a.id_usuario = u.id_usuario
    JOIN cursos c ON a.id_curso = c.id_curso
  `;
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).send("Error al obtener asignaciones.");
    res.render("asignaciones/index", { asignaciones: rows });
  });
});

// Formulario de creación
router.get("/crear", (req, res) => {
  const queryUsuarios = `SELECT id_usuario, nombre || ' ' || apellido AS nombre FROM usuarios`;
  const queryCursos = `SELECT id_curso, nombre FROM cursos`;

  db.all(queryUsuarios, [], (errU, usuarios) => {
    if (errU) return res.status(500).send("Error usuarios");
    db.all(queryCursos, [], (errC, cursos) => {
      if (errC) return res.status(500).send("Error cursos");
      res.render("asignaciones/crear", { usuarios, cursos, error: null });
    });
  });
});

// Guardar nueva asignación
router.post("/crear", (req, res) => {
  const { id_usuario, id_curso } = req.body;

  const checkQuery = `SELECT * FROM asignaciones WHERE id_usuario = ? AND id_curso = ?`;
  db.get(checkQuery, [id_usuario, id_curso], (err, row) => {
    if (err) return res.status(500).send("Error de validación.");
    if (row) {
      const queryUsuarios = `SELECT id_usuario, nombre || ' ' || apellido AS nombre FROM usuarios`;
      const queryCursos = `SELECT id_curso, nombre FROM cursos`;
      db.all(queryUsuarios, [], (errU, usuarios) => {
        db.all(queryCursos, [], (errC, cursos) => {
          res.render("asignaciones/crear", {
            usuarios,
            cursos,
            error: "❌ El profesor ya está asignado a ese curso.",
          });
        });
      });
    } else {
      const insertQuery = `INSERT INTO asignaciones (id_usuario, id_curso) VALUES (?, ?)`;
      db.run(insertQuery, [id_usuario, id_curso], function (err) {
        if (err) return res.status(500).send("Error al guardar.");
        res.redirect("/asignaciones");
      });
    }
  });
});

module.exports = router;
