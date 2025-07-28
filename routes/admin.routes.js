// routes/admin.routes.js
const express = require('express');
const router = express.Router();

// Controladores
const cursoController = require('../controllers/admin/curso.controller');
const adminController = require('../controllers/admin/admin.controller');
const categoriaController = require('../controllers/admin/categoria.controller');
const seccionController = require('../controllers/seccion.controller');
const correlativaController = require('../controllers/admin/correlativaController');
const authController = require('../controllers/auth/auth.controller'); // Asegúrate de que esta ruta sea correcta

// Modelos
const categoriaModel = require('../models/categoriaModel');
const CursoModel = require('../models/cursoModel');
const { obtenerCalificacionPorAlumno } = require('../models/inscripcionModel');  // Asegúrate de que la ruta sea correcta

// Middlewares
const upload = require('../middlewares/uploadCategorias');
const uploadCursos = require('../middlewares/uploadCursos');
const uploadVideos = require('../middlewares/uploadVideos');
const userLogin = require('../middlewares/authMiddleware');
const esProfesor = require('../middlewares/profesorMiddleware'); // Importa el middleware de profesor


// Rutas de administración principal
router.get('/home', adminController.mostrarHomeAdmin);

// **Categorías**
router.get('/categorias', async (req, res) => {
    try {
        const categorias = await categoriaModel.listarCategoriasConCursos();
        res.render('admin/categorias/listado', { categorias });
    } catch (error) {
        console.error('Error al listar categorías:', error);
        res.status(500).send('Error al cargar categorías');
    }
});
router.get('/categorias/crear', categoriaController.formCrearCategoria);
router.post('/categorias/crear', (req, res) => {
    upload.single('imagen')(req, res, err => {
        if (err) return res.render('admin/categorias/crear_cat', { errors: [err.message] });
        categoriaController.crearCategoria(req, res);
    });
});
router.get('/categorias/editar/:id', categoriaController.formEditarCategoria);
router.post('/categorias/editar/:id', (req, res) => {
    upload.single('imagen')(req, res, err => {
        if (err) {
            categoriaModel.buscarCategoriaPorId(req.params.id)
                .then(categoria => res.render('admin/categorias/editar_cat', { categoria, errors: [err.message] }))
                .catch(error => res.status(500).send('Error al cargar la categoría'));
        } else {
            categoriaController.editarCategoria(req, res);
        }
    });
});

// **Correlativas**
router.get('/correlativas', correlativaController.listarCorrelativasView);
router.get('/correlativas/curso/:id', correlativaController.verCorrelativasPorCursoView);
router.post('/correlativas/crear', correlativaController.crearCorrelativa);
router.post('/correlativas/eliminar', correlativaController.eliminarCorrelativa);

// **Cursos**
// Importa la función desde el modelo de cursos
const { obtenerCursoPorId } = require('../models/cursoModel');  // Asegúrate de que la ruta sea correcta

router.get('/cursos/crear', cursoController.crearCursoForm);
router.post('/cursos/crear', uploadCursos.single('imagen'), cursoController.crearCurso);
router.get('/cursos', cursoController.listarCursos);
router.get('/cursos/:id', cursoController.verCursoAdmin);
router.get('/cursos/:id/personas', cursoController.verPersonasPorCurso);
router.get('/cursos/:id/editar', cursoController.mostrarFormularioEditar);
router.post('/cursos/:id/editar', uploadCursos.single('imagen'), async (req, res) => {
    const { nombre, descripcion, publicado } = req.body;
    const id = req.params.id;

    try {
        const imagen = req.file ? req.file.filename : req.body.imagen_actual;
        const estadoPublicado = publicado === 'on';
        await CursoModel.editarCurso(id, nombre, descripcion, imagen, estadoPublicado);
        req.flash('success', 'Curso actualizado correctamente');
        res.redirect(`/admin/cursos/${id}/editar?msg=actualizado`);
    } catch (error) {
        console.error('❌ Error al editar curso:', error);
        req.flash('error', 'No se pudo actualizar el curso');
        res.redirect(`/admin/cursos/${id}/editar`);
    }
});

// **Secciones – manejo de video**
router.get('/secciones/:id/editar', seccionController.formEditarSeccion);
router.post('/secciones/:id/video', uploadVideos.single('video'), seccionController.subirVideo);
router.post('/secciones/:id/video/eliminar', seccionController.eliminarVideo);

// **Asignaciones**
router.get('/asignar-profesor', adminController.verAsignacion);
router.post('/asignar-profesor', adminController.asignarProfesor);
router.get('/listado-profesores', adminController.listarAsignacionesProfesores);
router.get('/asignaciones/eliminar/:id', adminController.eliminarAsignacion);

// **Usuarios**
router.get('/usuarios', adminController.listarUsuariosAdmin);
router.get('/usuarios/crear', adminController.mostrarFormCrearUsuario);
router.post('/usuarios/crear', adminController.crearUsuario);
router.get('/usuarios/editar/:id', adminController.mostrarFormEditarUsuario);
router.post('/usuarios/editar/:id', adminController.editarUsuario);

// **Inscripciones**
router.get('/inscripciones', adminController.listarInscripcionesAdmin);
router.get('/inscripciones/inscribir', adminController.mostrarFormInscribirAlumno);
router.post('/inscripciones/inscribir', adminController.inscribirAlumno);
router.post('/inscripciones/borrar/:id', adminController.desinscribirAlumno);

// **Estadísticas**
router.get('/estadisticas', adminController.mostrarEstadisticasAdmin || ((_, res) => res.send('En construcción')));
// ** Rutas de Calificación del Profesor **
// Ruta para ver las calificaciones del curso (solo para el profesor)

// Ruta para que el profesor vea y edite las calificaciones
router.get('/curso/:idCurso/calificaciones', cursoController.verCalificacionesCurso);
router.get('/curso/:idCurso/calificar', esProfesor, cursoController.verCalificacionesForm);
router.post('/curso/:idCurso/calificar', esProfesor, cursoController.actualizarCalificaciones);



// Ver curso y publicar
router.get('/curso/:idCurso', authController.verCurso);
router.post('/curso/:idCurso/publicar', userLogin, authController.publicarCurso);

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

    res.render('admin/cursos/ver', { // La vista debe ser de admin
      curso,
      calificacionAlumno, // Pasamos la calificación a la vista
      usuario: req.session.usuario
    });

  } catch (error) {
    console.error("Error al cargar el curso:", error);
    res.status(500).send("Error del servidor al cargar curso");
  }
});


// **Logout**
router.get('/logout', (req, res) => {
    if (req.session.usuario) {
        const tipoUsuario = req.session.usuario.es_admin ? 'Administrador' : 'Usuario';
        console.log(`🚪 Cierre de sesión: ${tipoUsuario} - ${req.session.usuario.nombre} ${req.session.usuario.apellido} (${req.session.usuario.email})`);
    }
    req.session.destroy(err => {
        if (err) {
            console.error('❌ Error al cerrar sesión del admin:', err);
            return res.redirect('/admin/home');
        }
        res.clearCookie('connect.sid');
        res.redirect('/public/home');
    });
});

module.exports = router;
