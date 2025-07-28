// middlewares/uploadSecciones.js
const multer  = require('multer');
const path    = require('path');

// Directorio donde se guardan las imágenes de sección
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../assets/secciones'));
  },
  filename: (req, file, cb) => {
    const { idSeccion } = req.params;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${idSeccion}${ext}`);
  }
});

// Solo permitir imágenes
function fileFilter(req, file, cb) {
  const allowed = ['.png', '.jpg', '.jpeg', '.gif'];
  const ext = path.extname(file.originalname).toLowerCase();
  cb(null, allowed.includes(ext));
}

module.exports = multer({ storage, fileFilter });
