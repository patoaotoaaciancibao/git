const express           = require('express');
const router            = express.Router();
const authController    = require('../controllers/auth/auth.controller');
const bajaController    = require('../controllers/auth/baja.controller');
const authMiddleware    = require('../middlewares/authMiddleware');
const uploadProfile     = require('../middlewares/uploadProfile');
const uploadSecciones   = require('../middlewares/uploadSecciones');
const uploadVideos = require('../middlewares/uploadVideos');
const seccionController = require('../controllers/seccion.controller');


// Home / Panel
router.get('/home', (req, res, next) => {
  if (req.session.usuario?.rol === 'admin') {
    return res.redirect(
      `/admin/home${req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : ''}`
    );
  }
  return authController.home(req, res, next);
});

// Dar de baja
router.get('/dar-de-baja', bajaController.confirmarBaja);
router.post('/dar-de-baja', bajaController.procesarBaja);

// Mis cursos
router.get('/mis-cursos', authController.verMisCursos);

// Buscador
router.get('/buscar',      authController.buscarCursoView);
router.post('/buscar',     authController.buscarCursoPost);
router.post('/buscar/live',authController.buscarCursoLive);

// Ver curso y publicar
router.get('/curso/:idCurso', authController.verCurso);
router.post('/curso/:idCurso/publicar', authMiddleware, authController.publicarCurso);

// Inscripción
router.post('/curso/:idCurso/inscribir', authMiddleware, authController.inscribirCurso);

// Agregar sección
router.post('/curso/:idCurso/seccion', authController.agregarSeccion);

// ===============================
// ✅ VIDEO POR CURSO (ACTIVO)
// ===============================

// Subir video del curso (profesor)
// auth.routes.js
router.post(
  '/curso/:idCurso/subir-video',
  authMiddleware,
  authController.subirVideoCurso // SIN uploadVideos.single
);


// Eliminar video del curso (profesor)
router.post(
  '/curso/:idCurso/eliminar-video',
  authMiddleware,
  authController.eliminarVideoCurso
);

// Streaming del video (solo alumnos y profesores)
router.get(
  '/curso/:idCurso/stream/:nombre',
  authMiddleware,
  authController.verStreamCurso
);


// ===============================
// ⛔ VIDEO POR SECCIÓN (NO USAR AHORA, pero sin borrar todavía)
// ===============================
router.get(
  '/curso/:idCurso/editar-seccion/:idSeccion',
  authMiddleware,
  seccionController.formEditarSeccion
);
router.post(
  '/curso/:idCurso/editar-seccion/:idSeccion',
  authMiddleware,
  uploadSecciones.single('portada'),
  seccionController.editarSeccion
);
router.post(
  '/curso/:idCurso/editar-seccion/:idSeccion/video',
  authMiddleware,
  seccionController.subirVideo
);
router.post(
  '/curso/:idCurso/editar-seccion/:idSeccion/video/eliminar',
  authMiddleware,
  seccionController.eliminarVideo
);

// Stream por sección (no usamos ahora)
router.get('/stream-video/:idSeccion/:idCurso', seccionController.streamVideo);

// Calificaciones (profesor)
const cursoController = require('../controllers/admin/curso.controller');

// ** Ruta para ver el curso de un alumno **
// Ruta para que el alumno vea su calificación en el curso
router.get('/curso/:idCurso', async (req, res) => {
  const { idCurso } = req.params;
  const idUsuario = req.session.usuario?.id_usuario;

  try {
    const curso = await obtenerCursoPorId(idCurso);
    if (!curso) {
      return res.status(404).send('Curso no encontrado');
    }

    let calificacionAlumno = null;
    if (idUsuario) {
      calificacionAlumno = await obtenerCalificacionPorAlumno(idUsuario, idCurso);
    }

    res.render('auth/home/curso', {
      curso,
      calificacionAlumno, // Pasamos la calificación a la vista
      usuario: req.session.usuario
    });

  } catch (error) {
    console.error("Error al cargar el curso:", error);
    res.status(500).send("Error del servidor al cargar curso");
  }
});


router.get('/curso/:idCurso', authMiddleware, authController.verCurso);

// Página de profesores y cursos públicos
router.get('/profesores', authController.listarProfesoresView);
router.get('/courses', authController.showCoursesPage);

// Comentarios
router.post('/curso/:idCurso/comentarios', authController.comentarCurso);

// Perfil y datos personales
router.get('/perfil', authController.showProfilePage);
router.post('/perfil/upload', uploadProfile.single('foto'), authController.updateProfilePicture);
router.get('/mis-datos', authMiddleware, authController.showDatosPersonales);
router.post('/mis-datos', authMiddleware, authController.updateDatosPersonales);

// Contraseña
router.get('/cambiar-contrasena', authMiddleware, authController.mostrarFormularioCambio);
router.post('/cambiar-contrasena', authMiddleware, authController.cambiarContrasena);

// Logout
router.get('/logout', authMiddleware, (req, res) => {
  if (req.session.usuario) {
    console.log(
      `🚪 [LOGOUT] Id: ${req.session.usuario.id_usuario} ${req.session.usuario.nombre} (${req.session.usuario.email}) - ${new Date().toLocaleString()}`
    );
  }
  req.session.destroy(err => {
    if (err) {
      console.error('❌ Error al cerrar sesión:', err);
      return res.redirect('/auth/home?error=logout');
    }
    res.clearCookie('connect.sid');
    res.redirect('/public/home?msg=logged_out');
  });
});

module.exports = router;
