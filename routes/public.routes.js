// routes/public.routes.js
const express = require('express');
const router = express.Router();
const { loginAdmin, esSuperAdmin, obtenerProfesoresAsignados, obtenerUsuarioPorId, obtenerAlumnos } = require('../models/userModel');
const authController = require("../controllers/auth/auth.controller");
const CursoModel = require('../models/cursoModel');
const InscripcionModel = require('../models/inscripcionModel');
const categoriaModel = require('../models/categoriaModel');
const correlativaModel = require('../models/correlativaModel'); // ¡IMPORTAR correlativaModel!
const { listarCategoriasConCursosPublicados } = require('../models/categoriaModel');
const { sendInscripcionMail } = require('../utils/mailer');
const publicController = require('../controllers/public/public.controller');

// Vista principal (pantalla con botones de acceso)
router.get('/acceso', authController.accesoView);

// Registro de usuario
router.get('/registro', authController.formRegistroUsuario);
router.post('/registro/guardar', authController.registrarNuevoUsuario);

// Login usuario
router.get('/login', authController.showLoginForm);
router.post('/login/try', authController.tryLogin);

// Páginas públicas
router.get('/team', (req, res) => res.render('public/team'));
router.get('/cursos', async (req, res) => {
  try {
    const cursos = await CursoModel.obtenerCursosPublicados();
    res.render('public/cursos', { cursos });
  } catch (error) {
    console.error('Error al listar cursos:', error);
    res.status(500).send('Error al cargar cursos.');
  }
});
router.get('/categorias', async (req, res) => {
  try {
    const categorias = await listarCategoriasConCursosPublicados();
    res.render('public/categorias', { categorias });
  } catch (error) {
    console.error('Error al mostrar categorías:', error);
    res.status(500).send('Error al cargar categorías.');
  }
});
router.get('/profesores', async (req, res) => {
  try {
    const profesores = await obtenerProfesoresAsignados();
    res.render('public/profesores', { profesores });
  } catch (error) {
    console.error('Error al mostrar profesores:', error);
    res.status(500).send('Error al cargar la página de profesores.');
  }
});
router.get('/about', authController.showAboutPage);
router.get('/contact', authController.showContactPage);
router.get('/privacy-policy', authController.showPrivacyPolicyPage);
router.get('/terms-conditions', authController.showTermsAndConditionsPage);
router.get('/faqs-help', authController.showFaqsHelpPage);
router.get('/testimonial', authController.showTestimonialPage);

// Home público
router.get('/public/home', async (req, res) => {
  try {
    const categoriasPopulares = await categoriaModel.obtenerTopCategoriasConCursos();
    const profesores = await obtenerProfesoresAsignados();
    const cursosPopulares = await CursoModel.obtenerCursosPopulares(8);
    const alumnos = await obtenerAlumnos();
    const ultimosComentarios = await CursoModel.obtenerUltimosComentarios();
    res.render('public/home', {
      categoriasPopulares,
      profesores,
      cursosPopulares,
      alumnos,
      ultimosComentarios
    });
  } catch (error) {
    console.error('Error al cargar home público:', error);
    res.status(500).send('Error al cargar la página');
  }
});

// Cursos por categoría
router.get('/categoria/:idCategoria', async (req, res) => {
  const { idCategoria } = req.params;
  try {
    const categoria = await categoriaModel.buscarCategoriaPorId(idCategoria);
    const cursos = await categoriaModel.obtenerCursosPorCategoria(idCategoria);
    res.render('public/categoria', {
      categoria: categoria?.nombre_categoria || 'Categoría no encontrada',
      cursos,
      totalCursos: cursos.length
    });
  } catch (error) {
    console.error('Error al cargar categoría:', error);
    res.status(500).send('Error al cargar los cursos de la categoría.');
  }
});

// Ver curso público
router.get('/cursos/:id', publicController.verCursoPublico);


// Redirección raíz
router.get('/', (req, res) => res.redirect('/public/home'));

// Login administrador
router.get('/admin-login', (req, res) => res.render('public/admin-login/form', { query: req.query }));
router.post('/admin-login/try', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password || password.length < 6 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.redirect('/admin/login?error=credenciales');
  }
  try {
    const user = await loginAdmin(email, password);
    if (!esSuperAdmin(user)) {
      return res.redirect('/admin/login?error=credenciales');
    }
    req.session.usuario = {
      id_usuario: user.id_usuario,
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      rol: user.rol,
      es_admin: true
    };
    console.log(`✅ Inicio de sesión: ${user.id_usuario} ${user.nombre} (${user.email})`);
    res.redirect('/admin/home');
  } catch (error) {
    console.error('Error login admin:', error);
    res.redirect('/admin/login?error=credenciales');
  }
});

// Inscripción a curso + envío de correo
router.post('/cursos/:cursoId/inscribir', async (req, res) => {
  const { cursoId } = req.params;
  const usuarioId = req.session.usuario?.id_usuario;

  console.log(`[Inscripción] Iniciando proceso para Usuario ID: ${usuarioId}, Curso ID: ${cursoId}`);

  try {
    // Validaciones iniciales (ya existentes)
    console.log('[Inscripción] Verificando si ya está inscrito...');
    if (await InscripcionModel.verificarInscripcionPorUsuarioCurso(usuarioId, cursoId)) {
      console.log('[Inscripción] Usuario ya inscrito como alumno.');
      req.flash('error', 'Ya estás inscrito en este curso como alumno.');
      return res.redirect(`/auth/curso/${cursoId}`);
    }
    console.log('[Inscripción] Verificando si es profesor...');
    if (await CursoModel.verificarSiSoyProfesor(usuarioId, cursoId)) {
      console.log('[Inscripción] Usuario ya inscrito como profesor.');
      req.flash('error', 'Ya estás inscrito en este curso como profesor.');
      return res.redirect(`/auth/curso/${cursoId}`);
    }
    console.log('[Inscripción] Obteniendo datos del usuario...');
    const usuario = await obtenerUsuarioPorId(usuarioId);
    if (usuario.es_admin === 1) {
      console.log('[Inscripción] Usuario es administrador, no puede inscribirse.');
      req.flash('error', 'Los administradores no pueden inscribirse como alumnos.');
      return res.redirect(`/auth/curso/${cursoId}`);
    }

    // --- NUEVA LÓGICA DE VALIDACIÓN DE CORRELATIVAS ---
    console.log('[Inscripción] Verificando correlativas...');
    const correlativasRequeridas = await correlativaModel.obtenerCorrelativasDeCurso(cursoId);
    const correlativasIncumplidas = [];

    if (correlativasRequeridas.length > 0) {
      for (const correlativa of correlativasRequeridas) {
        const inscripcionCorrelativa = await InscripcionModel.obtenerInscripcionPorAlumno(
          usuarioId,
          correlativa.id_curso_requisito // Asegúrate que este sea el ID del curso correlativo
        );

        // Si no hay inscripción O la calificación no es "APROBADO"
        if (!inscripcionCorrelativa || inscripcionCorrelativa.calificacion !== 'APROBADO') {
          correlativasIncumplidas.push(correlativa.nombre_curso_requisito); // Añade el nombre del curso correlativo no aprobado
        }
      }
    }

    if (correlativasIncumplidas.length > 0) {
      const mensajeError = `No puedes inscribirte. Debes aprobar los siguientes cursos correlativos: ${correlativasIncumplidas.join(', ')}.`;
      console.log(`[Inscripción] Error de correlativas: ${mensajeError}`);
      req.flash('error', mensajeError);
      return res.redirect(`/auth/curso/${cursoId}`);
    }
    console.log('[Inscripción] Todas las correlativas aprobadas o no hay correlativas.');
    // --- FIN NUEVA LÓGICA DE VALIDACIÓN DE CORRELATIVAS ---

    // Crear inscripción
    console.log('[Inscripción] Creando inscripción...');
    const ok = await InscripcionModel.crearInscripcion(usuarioId, cursoId, new Date());
    if (!ok) {
      console.error('[Inscripción] Error: No se pudo crear la inscripción (InscripcionModel.crearInscripcion devolvió false).');
      req.flash('error', 'No se pudo completar la inscripción. Inténtalo de nuevo.');
      return res.redirect(`/auth/curso/${cursoId}`);
    }
    console.log('[Inscripción] Inscripción creada con éxito.');

    // Datos del curso y categoría
    console.log('[Inscripción] Obteniendo datos del curso...');
    const curso = await CursoModel.obtenerCursoPorId(cursoId);
    if (!curso) {
      console.error('[Inscripción] Error: Curso no encontrado después de la inscripción.');
      req.flash('error', 'Curso no encontrado después de la inscripción. Contacta a soporte.');
      return res.redirect(`/cursos`);
    }
    console.log('[Inscripción] Obteniendo datos de la categoría...');
    const categoria = await categoriaModel.buscarCategoriaPorId(curso.id_categoria);
    if (!categoria) {
      console.warn(`[Inscripción] Advertencia: Categoría para el curso ${curso.id_curso} no encontrada.`);
    }
    const urlCurso = `${process.env.BASE_URL}/auth/curso/${cursoId}`;
    console.log(`[Inscripción] URL del curso (para mailer): ${urlCurso}`);

    // Enviar correo
    console.log('[Inscripción] Preparando envío de correo de confirmación...');
    await sendInscripcionMail({
      alumno: usuario,
      curso: {
        id_curso: cursoId,
        nombre: curso.nombre,
        imagen: curso.imagen || 'default.png'
      },
      categoria: {
        nombre: categoria?.nombre_categoria || 'Sin categoría'
      },
      urlCurso
    });
    console.log('[Inscripción] Correo de confirmación enviado.');

    req.flash('success', '¡Inscripción exitosa! Te enviamos un correo de confirmación.');
    res.redirect(`/auth/curso/${cursoId}`);
  } catch (error) {
    console.error('❌ [Inscripción] Error en el proceso de inscripción:', error);
    req.flash('error', 'Error en el servidor al procesar la inscripción. Inténtalo de nuevo más tarde.');
    res.redirect(`/auth/curso/${cursoId}`);
  }
});

module.exports = router;