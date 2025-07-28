require('dotenv').config();
const nodemailer = require('nodemailer');
const path = require('path');
const ejs = require('ejs');

let transporter;

(async () => {
  transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT, 10),
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  });

  try {
    await transporter.verify();
    console.log('✅ Mailer listo conectado a Mailtrap');
  } catch (err) {
    console.error('✉️ Error conectando a Mailtrap:', err);
  }
})();

/**
 * Envía correo de inscripción a un curso
 * @param {Object} params
 * @param {Object} params.alumno     { id_usuario, nombre, apellido, email, foto_perfil }
 * @param {Object} params.curso      { id_curso, nombre, portada }
 * @param {Object} params.categoria  { nombre }
 * @param {string} params.urlCurso   URL absoluta al curso
 */
async function sendInscripcionMail({ alumno, curso, categoria, urlCurso }) {
  const templatePath = path.join(__dirname, '../views/emails/inscripcion-curso.ejs');

  const html = await ejs.renderFile(templatePath, {
    alumno,
    curso,
    categoria,
    urlCurso,
    baseUrl: process.env.BASE_URL
  });

  const attachments = [
    {
      filename: 'logo.png',
      path: path.join(__dirname, '../assets/img/logo.png'),
      cid: 'logo'
    },
    {
      filename: curso.imagen,
      path: path.join(__dirname, `../assets/cursos/${curso.imagen}`),
      cid: 'curso-portada'
    },
    {
      filename: alumno.foto_perfil || 'default-avatar.png',
      path: path.join(__dirname, `../assets/profile/${alumno.foto_perfil || 'default-avatar.png'}`),
      cid: alumno.foto_perfil || 'default-avatar'
    }
  ];

  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: alumno.email,
    subject: `🎓 Inscripción confirmada: ${curso.nombre}`,
    html,
    attachments
  });

  console.log('✅ Correo enviado a %s: %s', alumno.email, info.messageId);
}

module.exports = {
  sendInscripcionMail
};
