// test-inscripcion.js
require('dotenv').config();
const { sendInscripcionMail } = require('./utils/mailer');

(async () => {
  try {
    await sendInscripcionMail({
      alumno: {
        nombre: 'Vero Demo',
        email: 'demo@freaks.com',
        foto_perfil: 'default-avatar.png' // debe existir en /assets/profile/
      },
      curso: {
        nombre: 'Introducción a JavaScript',
        imagen: 'default.png' // debe existir en /assets/cursos/
      },
      categoria: {
        nombre: 'Programación'
      },
      urlCurso: 'http://localhost:3000/public/cursos/1'
    });

    console.log('✅ Correo de inscripción enviado con éxito a MailTrap');
  } catch (err) {
    console.error('❌ Error al enviar correo de inscripción:', err);
  }
})();
