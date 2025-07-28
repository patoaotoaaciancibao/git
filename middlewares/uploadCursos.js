const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storageCursos = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../assets/cursos');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    // Si es creación, usar timestamp para nombre único
    if (!req.params.id) {
      const uniqueName = Date.now() + ext;
      cb(null, uniqueName);
    } else {
      // Si es edición, usar id para el nombre
      cb(null, `${req.params.id}${ext}`);
    }
  }
});

const uploadCursos = multer({ storage: storageCursos });

module.exports = uploadCursos;
