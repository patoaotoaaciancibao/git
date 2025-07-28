// controllers/admin/curso.controller.js
const { insertarCurso, obtenerCursos, obtenerCursoPorId, actualizarCurso,
    obtenerComentariosDelCurso, obtenerPromedioEstrellasDelCurso,
    verificarInscripcion, verificarSiSoyProfesor, obtenerSeccionesCurso,
    editarCurso // Asegúrate de que editarCurso esté importado si lo usas
} = require('../../models/cursoModel');
const { obtenerProfesoresPorCurso } = require('../../models/asignacionModel');
const {
  obtenerAlumnosPorCurso, // Asegúrate de que esta función está importada correctamente desde inscripcionModel
  agregarCalificacion
} = require('../../models/inscripcionModel'); // Solo necesitamos agregarCalificacion para el loop
const logger = require('../../utils/logger');
const path = require('path');
const fs = require('fs');

const cursoController = {
  // Mostrar formulario para crear curso
  crearCursoForm: (req, res) => {
    res.render('admin/cursos/crear', { query: req.query || {} });
  },

  // Crear nuevo curso
  crearCurso: async (req, res) => {
    const { nombre, descripcion } = req.body;
    if (!nombre || !descripcion) {
      return res.redirect('/admin/home?msg=campos-obligatorios');
    }
    try {
      let nombreImagen = 'default.png';
      if (req.file) {
        const ext = path.extname(req.file.originalname).toLowerCase();
        nombreImagen = Date.now() + ext;
        fs.renameSync(req.file.path, path.join(__dirname, '../../assets/cursos', nombreImagen));
      }
      const nuevoCurso = await insertarCurso(nombre, descripcion, nombreImagen);
      logger.debug(`Curso creado - ID: ${nuevoCurso.id}`);
      res.redirect('/admin/home?msg=curso-creado');
    } catch (error) {
      console.error("Error al crear curso:", error);
      res.status(500).send("Error al crear el curso.");
    }
  },

  // Listar todos los cursos
  listarCursos: async (req, res) => {
    try {
      const cursos = await obtenerCursos();
      res.render('admin/cursos/vista', { cursos, query: req.query || {} });
    } catch (error) {
      console.error("Error al obtener cursos:", error);
      res.status(500).send("Error al obtener cursos.");
    }
  },

  // Mostrar el formulario de calificaciones (para profesores o administradores)
// Mostrar el formulario de calificaciones (para profesores o administradores)
  verCalificacionesForm: async (req, res) => {
  const { idCurso } = req.params;
  const idProfesor = req.session.usuario.id_usuario; // Obtener el ID del profesor logueado

  try {
    // Verificar si el usuario es profesor del curso
    const soyProfesor = await verificarSiSoyProfesor(idProfesor, idCurso);
    if (!soyProfesor) {
      req.flash('error', 'No tienes permisos para editar las calificaciones.');
      return res.redirect('/admin-login?error=sinpermiso'); // Redirigir al login si no es profesor
    }

    // Obtener la lista de alumnos inscritos en el curso (y sus calificaciones)
    const alumnos = await obtenerAlumnosPorCurso(idCurso);
    
    // Renderizar la vista y pasar la información de los alumnos y el curso
    res.render('admin/cursos/calificar', { alumnos, idCurso });

  } catch (error) {
    console.error('[ERROR] al cargar el formulario de calificaciones del curso:', error);
    res.status(500).render('500');
  }
},


actualizarCalificaciones: async (req, res) => {
  const idCurso = req.params.idCurso;
  console.log('ID del curso recibido:', idCurso); // Verifica si el ID está correcto

  const calificacionesRecibidas = req.body.calificaciones || [];
  console.log('Calificaciones recibidas:', calificacionesRecibidas);  // Verifica las calificaciones recibidas

  try {
    const alumnosDelCurso = await obtenerAlumnosPorCurso(idCurso);

    // Verificar si el número de calificaciones coincide con el número de alumnos
    if (alumnosDelCurso.length !== calificacionesRecibidas.length) {
      console.warn('⚠️ Advertencia: El número de calificaciones no coincide con el número de alumnos.');
    }
      console.log("Alumnos del curso:", alumnosDelCurso);  // Verifica que los datos sean correctos

      for (let i = 0; i < alumnosDelCurso.length; i++) {
        const alumno = alumnosDelCurso[i];
        console.log("ID del alumno:", alumno.id);  // Verifica que el ID sea correcto
        const alumnoId = alumno.id;  // Aquí debería estar el ID del alumno
        const nota = calificacionesRecibidas[i];  // La calificación del alumno correspondiente

        if (nota !== undefined && nota !== null) {
          console.log(`Actualizando calificación para el alumno ${alumnoId} con la nota ${nota}`);
          await agregarCalificacion(parseInt(alumnoId), idCurso, nota);  // Actualizar la calificación
        }
      }

    req.flash('success', 'Calificaciones guardadas correctamente');
    return res.redirect(`/admin/curso/${idCurso}`);  // Redirigir correctamente
  } catch (err) {
    console.error('❌ Error al actualizar calificaciones:', err);
    req.flash('error', 'Error al actualizar las calificaciones');
    return res.redirect(`/admin/curso/${idCurso}/calificar`);
  }
},



verCalificacionesCurso: async (req, res) => {
    const idCurso = req.params.idCurso;
    const idProfesor = req.session.usuario.id_usuario;  // Obtener el ID del profesor logueado

    // Log para verificar si el ID del curso es correcto
    console.log('ID del curso recibido:', idCurso);

    try {
       

        // Verificar si el usuario es profesor del curso
        const soyProfesor = await verificarSiSoyProfesor(idProfesor, idCurso); 
        if (!soyProfesor) {
            req.flash('error', 'No tenés permisos para ver o modificar las calificaciones de este curso.');
            return res.redirect('/auth/home');
        }

        // Obtener la lista de alumnos inscritos en el curso
        const alumnos = await obtenerAlumnosPorCurso(idCurso);

        // Log para verificar que los alumnos fueron obtenidos correctamente
        console.log('Alumnos obtenidos para el curso:', alumnos);

        // Renderizar la vista de calificaciones para el profesor
        res.render('admin/cursos/calificaciones', { alumnos, idCurso });

    } catch (error) {
        console.error('[ERROR] al cargar las calificaciones del curso:', error);
        res.status(500).render('500');
    }
},



  // Ver detalle de un curso en admin
  verCursoAdmin: async (req, res) => {
    const { id } = req.params;
    try {
      const curso = await obtenerCursoPorId(id);
      if (!curso) return res.status(404).render('404');

      res.render('admin/cursos/ver', { curso,   publicado: Number(curso.publicado) === 1,

 // Asegúrate de pasar el campo `publicado` aquí
});
    } catch (error) {
      console.error("Error al ver curso admin:", error);
      res.status(500).send("Error al cargar el curso");
    }
  },

  // Ver curso público con comentarios y secciones
  verCursoPublico: async (req, res) => {
    const idCurso = req.params.id;
    const idUsuario = req.session.usuario?.id_usuario || null;
    try {
      const curso = await obtenerCursoPorId(idCurso);
      if (!curso || !curso.publicado) {
        return res.status(404).send('Curso no encontrado o no publicado');
      }

      const comentariosCurso = await obtenerComentariosDelCurso(idCurso);
      const promedioEstrellas = await obtenerPromedioEstrellasDelCurso(idCurso);
      const secciones = await obtenerSeccionesCurso(idCurso);

      let estaInscripto = false;
      let soyProfesor = false;
      if (idUsuario) {
        estaInscripto = await verificarInscripcion(idUsuario, idCurso);
        soyProfesor = await verificarSiSoyProfesor(idUsuario, idCurso);
      }

      res.render('public/ver-curso', {
        curso,
        secciones,
        comentariosCurso,
        promedioEstrellas,
        estaInscripto,
        soyProfesor,
        usuario: req.session.usuario || null
      });
    } catch (error) {
      console.error('❌ Error al cargar curso público:', error);
      res.status(500).send('Error interno del servidor');
    }
  },

  // Ver profesores y alumnos por curso
  verPersonasPorCurso: async (req, res) => {
    const { id } = req.params;
    try {
      const curso = await obtenerCursoPorId(id);
      if (!curso) return res.status(404).send('Curso no encontrado');

      const profesores = await obtenerProfesoresPorCurso(id);
      const alumnos = await obtenerAlumnosPorCurso(id);

      res.render('admin/cursos/personas-cursos', { curso, profesores, alumnos });
    } catch (error) {
      console.error("Error al cargar personas por curso:", error);
      res.status(500).send("Error al cargar personas por curso.");
    }
  },

  // Mostrar formulario de edición de curso
  mostrarFormularioEditar: async (req, res) => {
    const id = req.params.id;
    try {
      const curso = await obtenerCursoPorId(id);
      if (!curso) {
        return res.status(404).send('Curso no encontrado');
      }

      res.render('admin/cursos/editar', {
        curso,
        msg: req.query.msg || null
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Error al cargar el formulario de edición');
    }
  },


};

module.exports = cursoController;