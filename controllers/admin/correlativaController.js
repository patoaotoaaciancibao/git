// controllers/admin/correlativaController.js
const correlativaModel = require('../../models/correlativaModel');
const cursoModel       = require('../../models/cursoModel');
const logger           = require('../../utils/logger');

/**
 * Controlador para la gestión de correlativas en el panel de Admin
 */
const correlativaController = {
  /**
   * GET /admin/correlativas
   * Muestra todos los cursos que tienen correlativas y el formulario para crear nuevas
   */
  listarCorrelativasView: async (req, res) => {
    try {
      const cursosConCorrelativas = await correlativaModel.obtenerCursosConCorrelativas();
      const todosLosCursos         = await cursoModel.obtenerCursos();
      const messages = {
        success: req.flash('success')[0],
        error:   req.flash('error')[0]
      };

      res.render('admin/correlativas/index', {
        cursosConCorrelativas,
        todosLosCursos,
        messages,
        usuario: req.session.usuario
      });
    } catch (error) {
      logger.error(`❌ Error al listar correlativas: ${error.message}`);
      req.flash('error', 'Error interno al cargar la gestión de correlativas.');
      res.redirect('/admin');
    }
  },

  /**
   * GET /admin/correlativas/curso/:id
   * Muestra la gestión de correlativas de un curso específico
   */
  verCorrelativasPorCursoView: async (req, res) => {
    const idCurso = req.params.id;
    try {
      const cursoPrincipal = await cursoModel.obtenerCursoPorId(idCurso);
      if (!cursoPrincipal) {
        req.flash('error', 'Curso no encontrado');
        return res.redirect('/admin/correlativas');
      }
      const correlativas   = await correlativaModel.obtenerCorrelativasDeCurso(idCurso);
      const todosLosCursos = await cursoModel.obtenerCursos();
      const messages = {
        success: req.flash('success')[0],
        error:   req.flash('error')[0]
      };

      res.render('admin/correlativas/ver_curso', {
        cursoPrincipal,
        correlativas,
        todosLosCursos,
        messages,
        usuario: req.session.usuario
      });
    } catch (error) {
      logger.error(`❌ Error al cargar correlativas del curso ${idCurso}: ${error.message}`);
      req.flash('error', 'Error interno al cargar correlativas del curso.');
      res.redirect('/admin/correlativas');
    }
  },

  /**
   * POST /admin/correlativas/crear
   * Crea una nueva correlativa
   */
  crearCorrelativa: async (req, res) => {
    // Debug de entrada
    logger.debug('REQ.BODY:', req.body);
    const id_curso            = req.body.id_curso;
    const id_curso_requisito  = req.body.id_curso_requisito;
    logger.debug(`Parsed id_curso=${id_curso}, id_curso_requisito=${id_curso_requisito}`);

    // Validaciones
    if (!id_curso || !id_curso_requisito) {
      req.flash('error', 'Debes seleccionar curso y requisito.');
      return res.redirect('/admin/correlativas');
    }
    if (Number(id_curso) === Number(id_curso_requisito)) {
      req.flash('error', 'Un curso no puede ser correlativo de sí mismo.');
      return res.redirect(`/admin/correlativas/curso/${id_curso}`);
    }

    try {
      const existentes = await correlativaModel.obtenerCorrelativasDeCurso(id_curso);
      if (existentes.some(c => c.id_correlativa === Number(id_curso_requisito))) {
        req.flash('error', 'Esta correlativa ya existe para el curso.');
        return res.redirect(`/admin/correlativas/curso/${id_curso}`);
      }

      await correlativaModel.crearCorrelativa(id_curso, id_curso_requisito);
      req.flash('success', 'Correlativa agregada correctamente.');
    } catch (error) {
      logger.error(`❌ Error al crear correlativa: ${error.message}`);
      req.flash('error', 'Error interno al crear la correlativa.');
    }
    res.redirect(`/admin/correlativas/curso/${id_curso}`);
  },

  /**
   * POST /admin/correlativas/eliminar
   * Elimina una correlativa existente
   */
  eliminarCorrelativa: async (req, res) => {
    logger.debug('Eliminar REQ.BODY:', req.body);
    const id_curso           = req.body.id_curso;
    const id_curso_requisito = req.body.id_curso_requisito;

    if (!id_curso || !id_curso_requisito) {
      req.flash('error', 'IDs de correlativa incompletos.');
      return res.redirect('/admin/correlativas');
    }

    try {
      const resultado = await correlativaModel.eliminarCorrelativa(id_curso, id_curso_requisito);
      if (resultado.changes > 0) {
        req.flash('success', 'Correlativa eliminada correctamente.');
      } else {
        req.flash('error', 'No se encontró la correlativa para eliminar.');
      }
    } catch (error) {
      logger.error(`❌ Error al eliminar correlativa: ${error.message}`);
      req.flash('error', 'Error interno al eliminar la correlativa.');
    }
    res.redirect(`/admin/correlativas/curso/${id_curso}`);
  }
};

module.exports = correlativaController;