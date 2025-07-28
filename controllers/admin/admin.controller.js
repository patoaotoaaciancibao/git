// controllers/admin/admin.controller.js
const bcrypt              = require('bcrypt');
const { format }          = require('date-fns');
const { es }              = require('date-fns/locale');
const path                = require('path');
const ejs                 = require('ejs');
const transporter         = require('../../utils/mailer');
const logger              = require('../../utils/logger');
const homeLogger          = require('../../utils/home-logger');

const userModel           = require('../../models/userModel');
const CursoModel          = require('../../models/cursoModel');
const InscripcionModel    = require('../../models/inscripcionModel');
const AsignacionModel     = require('../../models/asignacionModel');
const estadisticaModel    = require('../../models/estadisticaModel');

const adminController = {
  showLoginForm: (req, res) => {
    res.render('admin/login/admin-login', {
      layout: false,
      error: req.query.error
    });
  },

  tryLogin: async (req, res) => {
    const { email, password } = req.body;
    try {
      const admin = await userModel.loginAdmin(email, password);
      req.session.usuario = {
        id_usuario: admin.id_usuario,
        nombre:     admin.nombre,
        email:      admin.email,
        rol:        'admin',
        es_admin:   1,
        foto_perfil: admin.foto_perfil
      };
      res.redirect('/admin/home');
    } catch {
      res.redirect('/admin-login?error=1');
    }
  },

  logout: (req, res) => {
    const adminEmail = req.session.usuario?.email || 'desconocido';
    req.session.destroy(err => {
      if (err) {
        logger.error(`Error al cerrar sesión de admin ${adminEmail}: ${err.message}`);
        return res.status(500).send('Error al cerrar sesión');
      }
      logger.info(`Sesión de admin cerrada para ${adminEmail}`);
      res.redirect('/admin-login');
    });
  },

  mostrarHomeAdmin: async (req, res) => {
    const usuario = req.session.usuario;
    homeLogger.debug(`Acceso a /admin/home - Admin ID: ${usuario.id_usuario}`);
    try {
      const cursos  = await CursoModel.obtenerCursos();
      const usuarios = await userModel.listarTodosLosUsuarios()
      res.render('admin/home', {
        usuario,
        query: req.query || {},
        cursos,
        usuarios     
      });
    } catch (error) {
      console.error('❌ Error al cargar home admin:', error);
      res.status(500).send('Error al cargar el panel de administración');
    }
  },


  listarUsuariosAdmin: async (req, res) => {
    try {
      const usuarios = await userModel.listarTodosLosUsuarios();
      const usuariosConConteo = await Promise.all(
        usuarios.map(async u => {
          const ca = await userModel.contarCursosComoAlumno(u.id_usuario);
          const cp = await userModel.contarCursosComoProfesor(u.id_usuario);
          return { ...u, totalCursosAlumno: ca, totalCursosProfesor: cp };
        })
      );
      res.render('admin/usuarios', { usuarios: usuariosConConteo, adminUser: req.session.usuario });
    } catch (error) {
      console.error('❌ Error al listar usuarios en admin:', error);
      res.status(500).send('Error al cargar el listado de usuarios.');
    }
  },

  mostrarFormCrearUsuario: (req, res) => {
    res.render('admin/crear-usuario', { error: null, msg: null });
  },

  crearUsuario: async (req, res) => {
    const { nombre, apellido, email, password, rol, es_admin } = req.body;
    try {
      await userModel.crearUsuario(
        nombre, apellido, email, password, rol, parseInt(es_admin, 10)
      );
      res.redirect('/admin/usuarios?msg=usuario-creado');
    } catch (error) {
      console.error('❌ Error al crear usuario:', error);
      const msg = error.message === 'El email ya está registrado.'
        ? error.message
        : 'Error al crear usuario.';
      res.render('admin/crear-usuario', { error: msg, msg: null });
    }
  },

  mostrarFormEditarUsuario: async (req, res) => {
    const id = req.params.id;
    try {
      const usuario = await userModel.obtenerUsuarioPorId(id);
      if (!usuario) return res.status(404).send('Usuario no encontrado.');
      res.render('admin/editar-usuario', { usuario, error: null, msg: null });
    } catch (error) {
      console.error('❌ Error al mostrar formulario de edición de usuario:', error);
      res.status(500).send('Error al cargar el formulario de edición.');
    }
  },

  editarUsuario: async (req, res) => {
    const id = req.params.id;
    const { nombre, apellido, email, password, rol, es_admin } = req.body;
    try {
      await userModel.actualizarUsuario(
        id, nombre, apellido, email, password, rol, parseInt(es_admin, 10)
      );
      res.redirect('/admin/usuarios?msg=usuario-actualizado');
    } catch (error) {
      console.error('❌ Error al editar usuario:', error);
      const msg = error.message === 'El email ya está registrado por otro usuario.'
        ? error.message
        : 'Error al actualizar usuario.';
      const usuario = await userModel.obtenerUsuarioPorId(id);
      res.render('admin/editar-usuario', { usuario, error: msg });
    }
  },

  verAsignacion: async (req, res) => {
    try {
      const cursos   = await CursoModel.obtenerCursos();
      const usuarios = await userModel.listarTodosLosUsuarios();
      res.render('admin/asignar-profesor', {
        cursos,
        usuarios,     
        query: req.query || {}
      });
    } catch (error) {
      console.error('❌ Error en verAsignacion:', error);
      req.flash('error', 'Ocurrió un error al intentar cargar los datos.');
      res.redirect('/admin');
    }
  },

  asignarProfesor: async (req, res) => {
    const { id_curso, id_usuario } = req.body;
    const cursoId  = parseInt(id_curso, 10);
    const profId   = parseInt(id_usuario, 10);
    if (isNaN(cursoId) || isNaN(profId)) {
      return res.redirect('/admin/asignar-profesor?msg=error-interno');
    }
    try {
      if (await AsignacionModel.existeAsignacion(cursoId, profId)) {
        return res.redirect('/admin/asignar-profesor?msg=asignacion-existe');
      }
      await AsignacionModel.asignarProfesorACurso(cursoId, profId);
      res.redirect('/admin/asignar-profesor?msg=profesor-asignado');
    } catch {
      console.error('❌ Error al asignar profesor:', error);
      res.redirect('/admin/asignar-profesor?msg=error-interno');
    }
  },

  listarAsignacionesProfesores: async (req, res) => {
    try {
      const asignaciones = await AsignacionModel.obtenerAsignacionesConDetalle();
      res.render('admin/listado-profesores', { asignaciones, query: req.query || {} });
    } catch (error) {
      console.error('❌ ERROR AL OBTENER ASIGNACIONES:', error);
      res.status(500).send('Error al cargar datos');
    }
  },

  eliminarAsignacion: async (req, res) => {
    const idAsignacion = req.params.id;
    try {
      const eliminado = await AsignacionModel.eliminarAsignacion(idAsignacion);
      if (!eliminado) {
        return res.redirect('/admin/listado-profesores?error=no-encontrado');
      }
      res.redirect('/admin/listado-profesores?msg=asignacion-eliminada');
    } catch (error) {
      console.error('❌ Error al eliminar asignación:', error);
      res.redirect('/admin/listado-profesores?error=error-interno');
    }
  },

  listarInscripcionesAdmin: async (req, res) => {
    try {
      const inscripciones = await InscripcionModel.listarInscripcionesConDetalle();
      res.render('admin/inscripciones-admin', { inscripciones });
    } catch (error) {
      console.error('❌ Error al listar inscripciones:', error);
      res.status(500).send('Error al cargar inscripciones.');
    }
  },

  mostrarFormInscribirAlumno: async (req, res) => {
    try {
      const alumnos = await userModel.obtenerAlumnos();
      const cursos = await CursoModel.obtenerCursosPublicados();

      res.render('admin/inscribir-alumno', {
        alumnos, // ✅ ahora sí
        cursos,
        error: null,
        msg: null
      });

    } catch (error) {
      console.error('❌ Error al mostrar formulario de inscripción:', error);
      res.status(500).send('Error al cargar formulario.');
    }
  },

  inscribirAlumno: async (req, res) => {
    const { id_usuario, id_curso } = req.body;
    if (!id_usuario || !id_curso) {
      return res.redirect('/admin/inscripciones/inscribir?error=faltan-datos');
    }
    try {
      const yaInscripto = await InscripcionModel.verificarInscripcionPorUsuarioCurso(id_usuario, id_curso);
      if (yaInscripto) {
        return res.redirect('/admin/inscripciones/inscribir?error=ya-inscripto');
      }
      await InscripcionModel.crearInscripcion(id_usuario, id_curso);
      res.redirect('/admin/inscripciones?msg=inscripcion-ok');
    } catch (error) {
      console.error('❌ Error al inscribir alumno:', error);
      res.redirect('/admin/inscripciones/inscribir?error=error-interno');
    }
  },

  desinscribirAlumno: async (req, res) => {
    const idInscripcion = req.params.id;
    try {
      const eliminado = await InscripcionModel.borrarInscripcion(idInscripcion);
      if (!eliminado) {
        return res.redirect('/admin/inscripciones?error=no-encontrado');
      }
      res.redirect('/admin/inscripciones?msg=inscripcion-borrada');
    } catch (error) {
      console.error('❌ Error al eliminar inscripción:', error);
      res.redirect('/admin/inscripciones?error=error-interno');
    }
  }
};

module.exports = adminController;

