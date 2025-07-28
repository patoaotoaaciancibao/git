// controllers/seccion.controller.js
const fs = require('fs');
const path = require('path');
const db   = require('../db/conexion'); //

// ------------------------------------------------------------
// Helper: Obtener sección por su id_seccion
// ------------------------------------------------------------
function obtenerSeccionPorId(idSeccion) {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM secciones WHERE id_seccion = ?', //
      [idSeccion],
      (err, row) => err ? reject(err) : resolve(row)
    );
  });
}

// ------------------------------------------------------------
// Helper: Actualizar título y portada de sección
// ------------------------------------------------------------
function actualizarSeccion(idSeccion, titulo, portada) {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE secciones SET titulo = ?, portada = ? WHERE id_seccion = ?', //
      [titulo, portada, idSeccion],
      function(err) {
        err ? reject(err) : resolve(this.changes);
      }
    );
  });
}

exports.formEditarSeccion = async (req, res) => {
  // Puede venir de admin (/admin/secciones/:id/editar) o de profesor (/auth/curso/:idCurso/editar-seccion/:idSeccion)
  const idSeccion = req.params.idSeccion || req.params.id; //
  try {
    const seccion = await obtenerSeccionPorId(idSeccion); //
    if (!seccion) {
      req.flash('error', 'Sección no encontrada');
      const redirectTo = req.params.idCurso //
        ? `/auth/curso/${req.params.idCurso}`
        : '/admin/cursos';
      return res.redirect(redirectTo);
    }

    // ¿Estamos bajo /admin o bajo /auth?
    if (req.baseUrl.startsWith('/admin')) { //
      // Admin
      res.render('admin/secciones/editar', {
        seccion,
        messages: req.flash(),
        usuario: req.session.usuario
      });
    } else {
      // Profesor
      res.render('auth/editar-seccion', {
        seccion,
        messages: req.flash(),
        usuario: req.session.usuario,
        idCurso: req.params.idCurso
      });
    }

  } catch (err) {
    console.error('Error al cargar formulario de edición de sección:', err); //
    req.flash('error', 'No se pudo cargar la sección'); //
    const redirectTo = req.params.idCurso //
      ? `/auth/curso/${req.params.idCurso}`
      : '/admin/cursos';
    res.redirect(redirectTo);
  }
};

exports.editarSeccion = async (req, res) => {
  // POST /auth/curso/:idCurso/editar-seccion/:idSeccion
  const { idCurso, idSeccion } = req.params; //
  const { titulo } = req.body; //

  try {
    const seccion = await obtenerSeccionPorId(idSeccion); //
    if (!seccion) throw new Error('Sección no existe'); //

    let portada = seccion.portada; //
    if (req.file) { //
      // Borrar portada anterior
      if (portada) { //
        const antigua = path.join(__dirname, '../assets/secciones', portada); //
        if (fs.existsSync(antigua)) fs.unlinkSync(antigua); //
      }
      portada = req.file.filename; //
    }

    await actualizarSeccion(idSeccion, titulo, portada); //
    req.flash('success', 'Sección actualizada correctamente'); //

  } catch (err) {
    console.error('Error al editar sección:', err); //
    req.flash('error', 'No se pudo actualizar la sección'); //
  }

  res.redirect(`/auth/curso/${idCurso}`); //
};

exports.subirVideo = async (req, res) => {
  // POST /auth/curso/:idCurso/editar-seccion/:idSeccion/video   (profesor)
  // ó POST /admin/secciones/:id/video                           (admin)
  const idSeccion = req.params.idSeccion || req.params.id; //
  const idCurso   = req.params.idCurso; //

  // Validaciones básicas de multer ya deberían haber corrido:
  if (!req.file) { //
    req.flash('error', 'No se subió ningún vídeo'); //
    return _redir(); //
  }

  const video = req.file.filename; //
  db.run(
    'UPDATE secciones SET video = ? WHERE id_seccion = ?', //
    [video, idSeccion],
    err => {
      if (err) {
        console.error('Error al guardar video en DB:', err); //
        req.flash('error', 'Error al guardar el vídeo'); //
      } else {
        req.flash('success', 'Vídeo subido correctamente'); //
      }
      _redir(); //
    }
  );

  function _redir() {
    // redirige de vuelta al formulario correcto
    if (req.baseUrl.startsWith('/admin')) { //
      res.redirect(`/admin/secciones/${idSeccion}/editar`); //
    } else {
      res.redirect(`/auth/curso/${idCurso}/editar-seccion/${idSeccion}`); //
    }
  }
};

exports.eliminarVideo = async (req, res) => {
  // POST /auth/curso/:idCurso/editar-seccion/:idSeccion/video/eliminar
  // ó POST /admin/secciones/:id/video/eliminar
  const idSeccion = req.params.idSeccion || req.params.id; //
  const idCurso   = req.params.idCurso; //

  db.get(
    'SELECT video FROM secciones WHERE id_seccion = ?', //
    [idSeccion],
    (err, row) => {
      if (err || !row) { //
        console.error('Error al buscar vídeo:', err); //
        req.flash('error', 'No se encontró el vídeo'); //
        return _redir(); //
      }
      if (!row.video) { //
        req.flash('error', 'No hay vídeo para eliminar'); //
        return _redir(); //
      }

      const ruta = path.join(__dirname, '../assets/videos', String(idSeccion), row.video); //
      fs.unlink(ruta, unlinkErr => { //
        if (unlinkErr) {
          console.error('Error al borrar vídeo:', unlinkErr); //
          req.flash('error', 'No se pudo eliminar el vídeo'); //
          return _redir(); //
        }
        db.run(
          'UPDATE secciones SET video = NULL WHERE id_seccion = ?', //
          [idSeccion],
          dbErr => {
            if (dbErr) {
              console.error('Error al limpiar columna video:', dbErr); //
              req.flash('error', 'Error al actualizar la base de datos'); //
            } else {
              req.flash('success', 'Vídeo eliminado correctamente'); //
            }
            _redir(); //
          }
        );
      });
    }
  );

  function _redir() {
    if (req.baseUrl.startsWith('/admin')) { //
      res.redirect(`/admin/secciones/${idSeccion}/editar`); //
    } else {
      res.redirect(`/auth/curso/${idCurso}/editar-seccion/${idSeccion}`); //
    }
  }
};

// ------------------------------------------------------------
// Stream de vídeo (¡Esta es la función que te estaba dando problemas!)
// ------------------------------------------------------------
exports.streamVideo = async (req, res) => {
  const idSeccion = req.params.idSeccion || req.params.id; //
  const idCurso = req.params.idCurso; //

  // Para poder verificar permisos, necesitamos el ID del usuario logueado
  const idUsuario = req.session.usuario?.id_usuario;

  // --- Verificaciones de Permisos ---
  try {
    const { verificarInscripcion, verificarSiSoyProfesor } = require('../models/cursoModel');
    const estaInscripto = await verificarInscripcion(idUsuario, idCurso);
    const soyProfesor = await verificarSiSoyProfesor(idUsuario, idCurso);
    const esAdmin = req.session.usuario?.rol === 'admin'; // <--- ¡Nueva línea!

    // Condición de acceso: usuario logueado Y (es admin O está inscrito O es profesor)
    if (!idUsuario || (!esAdmin && !estaInscripto && !soyProfesor)) { // <--- ¡Condición modificada!
      console.log(`[streamVideo] Acceso denegado: Usuario ${idUsuario}, Admin: ${esAdmin}, Inscrito: ${estaInscripto}, Profesor: ${soyProfesor}`);
      return res.status(403).send('Acceso no autorizado al video.');
    }
  } catch (permErr) {
    console.error('[streamVideo] Error al verificar permisos:', permErr);
    return res.status(500).send('Error interno al verificar permisos.');
  }
  // --- Fin Verificaciones de Permisos ---

  db.get(
    'SELECT video FROM secciones WHERE id_seccion = ?', //
    [idSeccion],
    (err, row) => {
      if (err || !row || !row.video) {
        console.error('Error al buscar vídeo en DB o no se encontró:', err || 'Vídeo no encontrado en DB para seccion ' + idSeccion); //
        return res.status(404).send('Vídeo no encontrado o no disponible.');
      }

      const videoPath = path.join(__dirname, '../assets/videos', String(idSeccion), row.video); //

      fs.stat(videoPath, (statErr, stat) => { //
        if (statErr) {
          console.error('Error al obtener info del archivo:', statErr); //
          return res.status(404).send('Archivo de vídeo no disponible.');
        }

        const fileSize = stat.size; //
        const range = req.headers.range; //

        if (range) {
          const parts = range.replace(/bytes=/, "").split("-"); //
          const start = parseInt(parts[0], 10); //
          const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1; //
          const chunksize = (end - start) + 1; //
          const file = fs.createReadStream(videoPath, { start, end }); //
          const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`, //
            'Accept-Ranges': 'bytes', //
            'Content-Length': chunksize, //
            'Content-Type': 'video/mp4', // Puedes necesitar un tipo más genérico 'video/mp4' o ajustar según el mimetype del video
          };
          res.writeHead(206, head); //
          file.pipe(res); //
        } else {
          const head = {
            'Content-Length': fileSize, //
            'Content-Type': 'video/mp4', // Puedes necesitar un tipo más genérico 'video/mp4' o ajustar según el mimetype del video
          };
          res.writeHead(200, head); //
          fs.createReadStream(videoPath).pipe(res); //
        }
      });
    }
  );
};

// ------------------------------------------------------------
// Exportaciones de funciones
// ------------------------------------------------------------
module.exports = {
  obtenerSeccionPorId,
  actualizarSeccion,
  formEditarSeccion: exports.formEditarSeccion, //
  editarSeccion: exports.editarSeccion,         //
  subirVideo: exports.subirVideo,               //
  eliminarVideo: exports.eliminarVideo,         //
  streamVideo: exports.streamVideo              //
};