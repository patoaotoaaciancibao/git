// controllers/auth/auth.controller.js
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const { sendInscripcionMail } = require('../../utils/mailer');
const CursoModel = require('../../models/cursoModel');
const uploadVideos = require('../../middlewares/uploadVideos');
const extensionesPermitidas = ['.mp4', '.webm']; // Las que declarás en tu doc
//const db = require('../../db/conexion'); // o la ruta correcta a tu archivo de conexión
const { setNombreVideoCurso } = require('../../models/cursoModel');


// --- Models ---
const {
    getUserByEmail,
    listar,
    obtenerProfesores,
    actualizarContrasena,
    obtenerUsuarioPorId,
    crearUsuario,
    updateProfilePhoto,
    actualizarDatosPersonales
} = require('../../models/userModel');

const {
    obtenerCursoPorId,
    obtenerSeccionesCurso,
    verificarInscripcion,
    verificarSiSoyProfesor,
    insertarSeccionEnCurso,
    obtenerCursosPorProfesor,
    obtenerCursosComoAlumno,
    obtenerComentariosDelCurso,
    buscarCursosPublicadosPorNombre,
    agregarComentario,
    obtenerCursos,
    obtenerUltimosComentarios,
    obtenerPromedioEstrellasDelCurso,
    publicarCurso
} = require('../../models/cursoModel');

const {
  obtenerAlumnosPorCurso,
  obtenerAlumnosConCalificaciones,
  agregarCalificacion,
  crearInscripcion,
  obtenerCalificacionPorAlumno // <-- ¡Esta es la importación clave!
} = require('../../models/inscripcionModel');

// --- Utils ---
const logger = require('../../utils/logger');
const homeLogger = require('../../utils/home-logger');

const correlativaModel = require('../../models/correlativaModel');

const authController = {
    // ==========================================================
    // === VISTAS PÚBLICAS Y GENERALES (SIN LOGIN)
    // ==========================================================
    showHomePage: async (req, res) => {
        homeLogger.debug('Acceso a /public/home (Visitante anónimo).');
        try {
            const ultimosComentarios = await obtenerUltimosComentarios(10);
            res.render('public/home', { ultimosComentarios, usuario: req.session.usuario });
        } catch (error) {
            console.error("Error al cargar home:", error);
            res.status(500).send("Error al cargar la página de inicio.");
        }
    },
    accesoView: (req, res) => {
        res.render('public/login/acceso', { query: req.query, usuario: null });
    },
    showCoursesPage: async (req, res) => {
        try {
            const allCourses = await obtenerCursos();
            res.render('public/courses', { courses: allCourses, usuario: req.session.usuario });
        } catch (error) {
            console.error("Error al cargar la página de cursos:", error);
            res.status(500).send("Error al cargar la página de cursos.");
        }
    },
    listarProfesoresView: async (req, res) => {
        try {
            const profesores = await obtenerProfesores();
            res.render('public/profesores', { profesores, usuario: req.session.usuario });
        } catch (error) {
            console.error("Error al listar profesores:", error);
            res.status(500).send("Error al cargar la página de profesores");
        }
    },
    showAboutPage: (req, res) => res.render('public/about', { usuario: req.session.usuario }),
    showContactPage: (req, res) => res.render('public/contact', { usuario: req.session.usuario }),
    showTestimonialPage: (req, res) => res.render('public/testimonial', { usuario: req.session.usuario }),
    showPrivacyPolicyPage: (req, res) => res.render('public/privacy-policy', { usuario: req.session.usuario }),
    showTermsAndConditionsPage: (req, res) => res.render('public/terms-conditions', { usuario: req.session.usuario }),
    showFaqsHelpPage: (req, res) => res.render('public/faqs-help', { usuario: req.session.usuario }),

    // ==========================================================
    // === PROCESO DE REGISTRO, LOGIN Y LOGOUT
    // ==========================================================
    showLoginForm: (req, res) => {
        res.render('public/login/star-user', { query: req.query });
    },
    formRegistroUsuario: (req, res) => {
        if (req.session.usuario) return res.redirect('/auth/home');
        res.render('public/registro', { error: null, success: null, datos: {}, usuario: null });
    },
    registrarNuevoUsuario: async (req, res) => {
        const { nombre, apellido, email, password, confirmar } = req.body;
        const datos = { nombre, apellido, email };
        if (!nombre || !apellido || !email || !password || !confirmar) {
            return res.render('public/registro', { error: 'Todos los campos son obligatorios', success: null, datos, usuario: null });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.render('public/registro', { error: 'Correo electrónico inválido', success: null, datos, usuario: null });
        }
        if (password.length < 6) {
            return res.render('public/registro', { error: 'La contraseña debe tener al menos 6 caracteres', success: null, datos, usuario: null });
        }
        if (password !== confirmar) {
            return res.render('public/registro', { error: 'Las contraseñas no coinciden', success: null, datos, usuario: null });
        }
        try {
            const existente = await getUserByEmail(email);
            if (existente) {
                return res.render('public/registro', { error: 'Ya existe un usuario con ese correo', success: null, datos, usuario: null });
            }
            await crearUsuario(nombre, apellido, email, password, 'alumno', 0);
            return res.render('public/registro', { error: null, success: 'Usuario creado exitosamente. Ahora podés iniciar sesión.', datos: {}, usuario: null });
        } catch (err) {
            console.error("❌ Error al registrar usuario:", err);
            return res.render('public/registro', { error: 'Hubo un error al registrar el usuario', success: null, datos, usuario: null });
        }
    },
    tryLogin: async (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.redirect('/login?error=user');
        }

        try {
            const user = await getUserByEmail(email);

           if (!user || user.activo === 0) {
    logger.info(`❌ Login fallido (no user/inactivo): ${email}`);
    return res.redirect('/login?error=user');
}

            const match = await bcrypt.compare(password, user.contraseña);
            if (!match) {
                logger.info(`❌ Login fallido (pass incorrecta): ${email}`);
                return res.redirect('/login?error=user');
            }

            req.session.usuario = {
                id_usuario:   user.id_usuario,
                nombre:       user.nombre,
                apellido:     user.apellido,
                email:        user.email,
                rol:          user.rol,
                foto_perfil:  user.foto_perfil
            };
            logger.info(`✅ Login exitoso: ${user.email}`);
            return res.redirect('/auth/home');

        } catch (err) {
            logger.error(`❌ Error en tryLogin: ${err.message}`);
            return res.status(500).send('Error del servidor');
        }
    },
    logout: (req, res) => {
        const usuarioEmail = req.session.usuario ? req.session.usuario.email : 'desconocido';
        req.session.destroy(err => {
            if (err) {
                logger.error(`Error al cerrar sesión para ${usuarioEmail}: ${err.message}`);
                return res.status(500).send('Error al cerrar sesión');
            }
            logger.info(`Sesión cerrada para el usuario ${usuarioEmail}`);
            res.redirect('/acceso');
        });
    },

    // ==========================================================
    // === ÁREA DE USUARIO LOGUEADO (/auth)
    // ==========================================================
    home: async (req, res) => {
        const usuario = req.session.usuario;
        homeLogger.debug(`Acceso a /auth/home - ID: ${usuario.id_usuario}, Email: ${usuario.email}`);
        try {
            let cursosProfesor = [], cursosAlumno = [];
            if (usuario.rol === 'profesor') {
                cursosProfesor = await obtenerCursosPorProfesor(usuario.id_usuario);
            }
            if (usuario.rol === 'alumno') {
                cursosAlumno = await obtenerCursosComoAlumno(usuario.id_usuario);
            }
            res.render("public/login/vista", {
                usuario,
                rol: usuario.rol,
                cursos: cursosProfesor,
                cursosAlumno
            });
        } catch (error) {
            console.error("❌ Error al obtener cursos del usuario:", error);
            res.status(500).send("Error en el servidor");
        }
    },
    buscarCursoView: (req, res) => {
        res.render('public/login/buscar-curso', {
            cursos: null,
            query: null,
            nombreUsuario: req.session.usuario.nombre,
            usuario: req.session.usuario
        });
    },
    buscarCursoPost: async (req, res) => {
        const { nombre } = req.body;
        try {
            const cursos = await buscarCursosPublicadosPorNombre(nombre);
            res.render('public/login/buscar-curso', {
                cursos,
                query: nombre,
                nombreUsuario: req.session.usuario.nombre,
                usuario: req.session.usuario
            });
        } catch (error) {
            console.error('❌ Error al buscar cursos:', error);
            res.status(500).send('Error interno');
        }
    },
    buscarCursoLive: async (req, res) => {
        const { nombre } = req.body;
        try {
            const cursos = await buscarCursosPublicadosPorNombre(nombre);
            res.json(cursos);
        } catch (error) {
            console.error("❌ Error en búsqueda en vivo:", error);
            res.status(500).json({ error: "Error del servidor" });
        }
    },

    verMisCursos: async (req, res) => {
        const { id_usuario, rol } = req.session.usuario;
        try {
            let cursos = [];

            if (rol === 'alumno') {
                cursos = await CursoModel.obtenerCursosComoAlumno(id_usuario);
            } else if (rol === 'profesor') {
                cursos = await CursoModel.obtenerCursosPorProfesor(id_usuario);
            }

            res.render('auth/mis-cursos', {
                usuario: req.session.usuario,
                cursos
            });
        } catch (error) {
            console.error('Error al obtener cursos relacionados:', error);
            res.redirect('/auth/home');
        }
    },

    verCurso: async (req, res) => {
    const { idCurso } = req.params;
    const idUsuario = req.session.usuario?.id_usuario || null;

    try {
        const curso = await obtenerCursoPorId(idCurso);

        if (!curso) {
            return res.status(404).send('Curso no encontrado.');
        }

        let estaInscripto = false;
        let soyProfesor = false;
        let calificacionAlumno = null;

        if (idUsuario) {
            estaInscripto = await verificarInscripcion(idUsuario, idCurso);
            soyProfesor = await verificarSiSoyProfesor(idUsuario, idCurso);
        }

        if (Number(curso.publicado) !== 1 && req.session.usuario.rol !== 'admin' && !soyProfesor) {
            return res.status(404).send('Curso no publicado y no tienes permisos para verlo.');
        }

        if (estaInscripto && !soyProfesor) {
            calificacionAlumno = await obtenerCalificacionPorAlumno(idUsuario, idCurso);
        }

        const secciones = await obtenerSeccionesCurso(idCurso);
        const comentariosCurso = await obtenerComentariosDelCurso(idCurso);
        const promedioEstrellas = await obtenerPromedioEstrellasDelCurso(idCurso);

        // 🆕 Buscar video si existe
        const rutaVideoCurso = path.join(__dirname, '../../assets/videos', String(idCurso));
        let videoNombre = null;

        if (fs.existsSync(rutaVideoCurso)) {
            const archivos = fs.readdirSync(rutaVideoCurso);
            const encontrado = archivos.find(nombre => extensionesPermitidas.includes(path.extname(nombre).toLowerCase()));
            if (encontrado) {
                videoNombre = encontrado;
            }
        }

        const vistaPrivada = soyProfesor || estaInscripto;
        const vista = vistaPrivada ? 'auth/home/curso' : 'public/curso/ver';

        res.render(vista, {
            curso,
            secciones,
            estaInscripto,
            soyProfesor,
            publicado: Number(curso.publicado) === 1,
            comentariosCurso,
            promedioEstrellas,
            calificacionAlumno,
            usuario: req.session.usuario,
            videoNombre // 🆕 se lo pasamos a la vista
        });

    } catch (error) {
        console.error("❌ Error al cargar curso:", error);
        res.status(500).send("Error del servidor al cargar curso");
    }
    },

    comentarCurso: async (req, res) => {
        const { idCurso } = req.params;
        const idUsuario = req.session.usuario.id_usuario;
        const { comentario, estrellas } = req.body;
        try {
            const inscripto = await verificarInscripcion(idUsuario, idCurso);
            if (!inscripto) return res.redirect(`/auth/curso/${idCurso}?error=no_inscripto`);
            await agregarComentario(idUsuario, idCurso, comentario, estrellas);
            return res.redirect(`/auth/curso/${idCurso}?msg=comentario_ok`);
        } catch (err) {
            console.error("❌ Error al comentar:", err);
            return res.redirect(`/auth/curso/${idCurso}?error=comentario_fail`);
        }
    },
    agregarSeccion: async (req, res) => {
        const { idCurso } = req.params;
        const { titulo, descripcion } = req.body;
        const idUsuario = req.session.usuario.id_usuario;
        try {
            const curso = await obtenerCursoPorId(idCurso);
            if (!curso) return res.status(404).send('Curso no encontrado.');
            if (curso.publicado) return res.status(403).send('No se pueden agregar secciones a un curso publicado.');
            const soyProfesor = await verificarSiSoyProfesor(idUsuario, idCurso);
            if (!soyProfesor) return res.status(403).send('No tenés permisos para modificar este curso.');
            await insertarSeccionEnCurso(idCurso, titulo, descripcion);
            res.redirect(`/auth/curso/${idCurso}`);
        } catch (error) {
            console.error('Error al agregar sección:', error.message);
            res.status(500).send('Error del servidor');
        }
    },

    //video - f2

subirVideoCurso: async (req, res) => {
    const { idCurso } = req.params;
    const idUsuario = req.session.usuario.id_usuario;

    const soyProfesor = await verificarSiSoyProfesor(idUsuario, idCurso);
    if (!soyProfesor) {
        req.flash('error', 'No tenés permisos para modificar este curso.');
        return res.redirect(`/auth/curso/${idCurso}`);
    }

    uploadVideos.single('video')(req, res, async function (err) {
        if (err) {
            req.flash('error', err.message);
            return res.redirect(`/auth/curso/${idCurso}`);
        }

        if (req.fileValidationError) {
            req.flash('error', req.fileValidationError);
            return res.redirect(`/auth/curso/${idCurso}`);
        }

        if (!req.file) {
            req.flash('error', 'Debes subir un archivo válido.');
            return res.redirect(`/auth/curso/${idCurso}`);
        }

        try {
            // 🧼 Verificar si ya había un video anterior
            const curso = await obtenerCursoPorId(idCurso);
            if (curso && curso.video) {
                const rutaViejo = path.join(__dirname, '../../assets/videos', String(idCurso), curso.video);
                if (fs.existsSync(rutaViejo)) {
                    fs.unlinkSync(rutaViejo);
                }
            }

            // 💾 Guardar el nuevo video
            await setNombreVideoCurso(idCurso, req.file.filename);

            req.flash('success', 'Video subido exitosamente.');
            return res.redirect(`/auth/curso/${idCurso}`);
        } catch (error) {
            console.error('Error al guardar el video en DB:', error);
            req.flash('error', 'Error al guardar el video.');
            return res.redirect(`/auth/curso/${idCurso}`);
        }
    });
},

 eliminarVideoCurso: async (req, res) => {
    const { idCurso } = req.params;
    const idUsuario = req.session.usuario.id_usuario;

    const soyProfesor = await verificarSiSoyProfesor(idUsuario, idCurso);
    if (!soyProfesor) {
        req.flash('error', 'No tenés permisos para eliminar el video.');
        return res.redirect(`/auth/curso/${idCurso}`);
    }

    try {
        const curso = await obtenerCursoPorId(idCurso);

        if (!curso || !curso.video) {
            req.flash('error', 'No hay video para eliminar.');
            return res.redirect(`/auth/curso/${idCurso}`);
        }

        const ruta = path.join(__dirname, '../../assets/videos', String(idCurso), curso.video);
        if (fs.existsSync(ruta)) {
            fs.unlinkSync(ruta);
        }

        // Limpiar la columna en la base de datos
        await setNombreVideoCurso(idCurso, null);

        req.flash('success', 'Video eliminado correctamente.');
        res.redirect(`/auth/curso/${idCurso}`);
    } catch (error) {
        console.error('Error al eliminar video:', error);
        req.flash('error', 'Error al eliminar el video.');
        res.redirect(`/auth/curso/${idCurso}`);
    }
},

verStreamCurso: async (req, res) => {
  const { idCurso, nombre } = req.params;
  const videoPath = path.join(__dirname, '..', '..', 'assets', 'videos', idCurso, nombre);

  if (!fs.existsSync(videoPath)) {
    return res.status(404).send('Video no encontrado');
  }

  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    const chunksize = end - start + 1;
    const file = fs.createReadStream(videoPath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    };

    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    };
    res.writeHead(200, head);
    fs.createReadStream(videoPath).pipe(res);
  }
},



    // ==========================================================
    // === GESTIÓN DE PERFIL, CONTRASEÑA, ETC.
    // ==========================================================
    showProfilePage: (req, res) => {
        res.render('auth/perfil', {
            usuario: req.session.usuario,
            success: req.query.success,
            error: req.query.error
        });
    },
    updateProfilePicture: async (req, res) => {
        try {
            const userId = req.session.usuario.id_usuario;
            if (!req.file) return res.redirect('/auth/perfil?error=No se subió un archivo válido.');
            const newFilename = req.file.filename;
            const user = await obtenerUsuarioPorId(userId);
            if (!user) return res.status(404).send('Usuario no encontrado');
            const oldPhoto = user.foto_perfil;
            await updateProfilePhoto(userId, newFilename);
            if (oldPhoto && oldPhoto !== 'default-avatar.png') {
                const oldPath = path.join(__dirname, '../../assets/profile', oldPhoto);
                fs.unlink(oldPath, err => { if (err) console.error("Error al eliminar foto anterior:", err); });
            }
            req.session.usuario.foto_perfil = newFilename;
            req.session.save(() => res.redirect('/auth/perfil?success=true'));
        } catch (error) {
            console.error('Error al actualizar la foto de perfil:', error);
            res.status(500).send('Error del servidor');
        }
    },
    mostrarFormularioCambio: (req, res) => {
        res.render('auth/cambiar-contrasena', {
            error: null,
            success: null,
            usuario: req.session.usuario
        });
    },
    cambiarContrasena: async (req, res) => {
        const { actual, nueva, repetir } = req.body;
        const userId = req.session.usuario.id_usuario;
        if (!actual || !nueva || !repetir) {
            return res.render('auth/cambiar-contrasena', {
                error: 'Completa todos los campos',
                success: null,
                usuario: req.session.usuario
            });
        }
        if (nueva.length < 6) {
            return res.render('auth/cambiar-contrasena', {
                error: 'La nueva contraseña debe tener al menos 6 caracteres',
                success: null,
                usuario: req.session.usuario
            });
        }
        if (nueva !== repetir) {
            return res.render('auth/cambiar-contrasena', {
                error: 'Las nuevas contraseñas no coinciden',
                success: null,
                usuario: req.session.usuario
            });
        }
        try {
            const usuario = await obtenerUsuarioPorId(userId);
            if (!usuario) {
                return res.render('auth/cambiar-contrasena', {
                    error: 'Usuario no encontrado',
                    success: null,
                    usuario: req.session.usuario
                });
            }
            const coincide = await bcrypt.compare(actual, usuario.contraseña);
            if (!coincide) {
                return res.render('auth/cambiar-contrasena', {
                    error: 'Contraseña actual incorrecta',
                    success: null,
                    usuario: req.session.usuario
                });
            }
            const hash = await bcrypt.hash(nueva, 10);
            await actualizarContrasena(userId, hash);
            res.render('auth/cambiar-contrasena', {
                error: null,
                success: 'Contraseña cambiada exitosamente',
                usuario: req.session.usuario
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Error del servidor');
        }
    },

    // === Mis Datos Personales ===
    showDatosPersonales: (req, res) => {
        // Si usas flash:
        const error   = req.flash('error')[0]   || null;
        const success = req.flash('success')[0] || null;
        res.render('auth/mis-datos', {
            usuario: req.session.usuario,
            error,
            success
        });
    },

    updateDatosPersonales: async (req, res) => {
        const { nombre, apellido } = req.body;
        const userId = req.session.usuario.id_usuario;

        // Validaciones básicas
        if (!nombre.trim() || !apellido.trim()) {
            req.flash('error', 'Nombre y apellido no pueden quedar vacíos.');
            return res.redirect('/auth/mis-datos');
        }

        try {
            await require('../../models/userModel')
                .actualizarDatosPersonales(userId, nombre.trim(), apellido.trim());

            req.session.usuario.nombre   = nombre.trim();
            req.session.usuario.apellido = apellido.trim();

            req.flash('success', 'Datos actualizados correctamente.');
            res.redirect('/auth/mis-datos');
        } catch (err) {
            console.error('Error al actualizar datos personales:', err);
            req.flash('error', 'Hubo un error al guardar los cambios.');
            res.redirect('/auth/mis-datos');
        }
    },

    publicarCurso: async (req, res) => {
        const { idCurso } = req.params;
        const idUsuario = req.session.usuario.id_usuario;
        // Importa las funciones necesarias directamente para evitar redefinirlas
        const { verificarSiSoyProfesor, obtenerCursoPorId, publicarCurso } = require('../../models/cursoModel');
        try {
            const soyProfesor = await verificarSiSoyProfesor(idUsuario, idCurso);
            const curso = await obtenerCursoPorId(idCurso);
            if (!soyProfesor || !curso || Number(curso.publicado) === 1) {
                return res.redirect(`/auth/curso/${idCurso}?error=forbidden`);
            }
            const actualizado = await publicarCurso(idCurso);
            if (actualizado > 0) {
                return res.redirect(`/auth/curso/${idCurso}?msg=publicado`);
            }
            return res.redirect(`/auth/curso/${idCurso}?error=already`);
        } catch (err) {
            console.error("❌ Error al publicar curso:", err);
            return res.status(500).send("Error del servidor");
        }
    },

    inscribirCurso: async (req, res) => {
        const { idCurso } = req.params;
        const idUsuario = req.session.usuario.id_usuario;

        try {
            // 1) Validar correlativas
            const correlativas = await correlativaModel.obtenerCorrelativasDeCurso(idCurso);
            const faltantes = [];
            for (const reqCurso of correlativas) {
                const aprobado = await correlativaModel.haAprobadoCurso(
                    idUsuario,
                    reqCurso.id_curso_requisito
                );
                if (!aprobado) faltantes.push(reqCurso.nombre_curso_requisito);
            }
            if (faltantes.length) {
                req.flash('error', `No cumples los requisitos: ${faltantes.join(', ')}`);
                return res.redirect(`/cursos/${idCurso}`);
            }

            // 2) Crear inscripción
            await crearInscripcion(idUsuario, idCurso);

            // 3) Preparar datos para el correo
            const curso = await obtenerCursoPorId(idCurso);
            const categoriaModel = require('../../models/categoriaModel');
            const categoria = await categoriaModel.buscarCategoriaPorCurso(idCurso);

            const alumno = {
                ...req.session.usuario,
                foto_perfil: req.session.usuario.foto_perfil || 'user-default.png'
            };

            const urlCurso = `${process.env.BASE_URL}/auth/curso/${idCurso}`;

            // 4) Enviar correo (sin bloquear)
            sendInscripcionMail({
                alumno,
                curso,
                categoria,
                urlCurso
            }).catch(console.error);

            // 5) Mensaje de éxito
            req.flash('success', 'Inscripción realizada exitosamente. Te enviamos un correo de confirmación.');

        } catch (err) {
            console.error('❌ [Inscripción] Error en el proceso de inscripción:', err);
            req.flash('error', 'No se pudo inscribir al curso. Intenta de nuevo más tarde.');
        }

        // 6) Redireccionar a la vista del curso
        return res.redirect(`/cursos/${idCurso}`);
    },

    // Esta es la función verCalificacionesForm del authController, que renderiza la vista para que el PROFESOR califique.
    // Es diferente a la de cursoController que está en /admin.
    verCalificacionesForm: async (req, res) => {
        const { idCurso } = req.params;
        try {
            const curso = await obtenerCursoPorId(idCurso);
            if (!curso) return res.status(404).render('404', { usuario: req.session.usuario });

            const alumnos = await obtenerAlumnosConCalificaciones(idCurso); // Asume que esta función existe en inscripcionModel
            
            const messages = {
                success: req.flash('success')[0],
                error:   req.flash('error')[0]
            };

            res.render('profesor/editar-calificaciones', { curso, alumnos, messages, usuario: req.session.usuario });
        } catch (err) {
            console.error('❌ Error al cargar calificaciones (profesor):', err);
            res.status(500).send('Error interno al cargar las calificaciones');
        }
    },

    // Esta es la función actualizarCalificaciones del authController
    // Es diferente a la de cursoController
    actualizarCalificaciones: async (req, res) => {
        console.log('--- req.body COMPLETO al inicio de actualizarCalificaciones (authController) ---');
        console.log(req.body);
        console.log('------------------------------------------------------------');
        
        const { idCurso } = req.params;
        const { calificaciones } = req.body; // 'calificaciones' debería ser un objeto con IDs de usuario como claves

        console.log('--- Datos recibidos en actualizarCalificaciones (authController) ---');
        console.log('ID del Curso:', idCurso);
        console.log('Calificaciones recibidas:', calificaciones);
        console.log('--------------------------------------------------');

        try {
            // Asume que calificaciones es un objeto como { 'id_alumno1': 'nota1', 'id_alumno2': 'nota2' }
            // Esto es para el caso cuando el frontend envía el formato correcto.
            for (let idUsuario in calificaciones) {
                const nota = calificaciones[idUsuario] || null;
                console.log(`Intentando guardar (authController): Usuario ID ${idUsuario}, Curso ID ${idCurso}, Nota: ${nota}`);
                await agregarCalificacion(parseInt(idUsuario), idCurso, nota); // Asegúrate de parseInt aquí también
            }
            req.flash('success', 'Calificaciones guardadas correctamente');
            return res.redirect(`/auth/curso/${idCurso}/calificar`); // Redireccionar a la vista de calificar
        } catch (err) {
            console.error('❌ Error al actualizar calificaciones (authController):', err);
            req.flash('error', 'No se pudieron guardar las calificaciones');
            return res.redirect(`/auth/curso/${idCurso}/calificar`); // Redireccionar con error
        }
    },

    // ==========================================================
    // === PÁGINA DE ERROR
    // ==========================================================
    show404Page: (req, res) => {
        res.status(404).render('404', { usuario: req.session.usuario });
    }
};

module.exports = authController;