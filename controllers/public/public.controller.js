const CursoModel = require('../../models/cursoModel');
const { sendInscripcionMail } = require('../../utils/mailer');

async function verCursoPublico(req, res) {
    const idCurso = req.params.id;

    try {
        const curso = await CursoModel.obtenerCursoPorId(idCurso);
        if (!curso || curso.publicado !== 1) {
            return res.status(404).render('404');
        }

        const comentariosCurso = await CursoModel.obtenerComentarios(idCurso);
        const promedioEstrellas = await CursoModel.obtenerPromedioEstrellas(idCurso);

        res.render('public/curso/ver', {
            curso,
            comentariosCurso,
            promedioEstrellas
        });

    } catch (error) {
        console.error('[ERROR] al mostrar curso público:', error);
        res.status(500).render('500');
    }
}

module.exports = {
    verCursoPublico
};















