const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const idCurso = req.params.idCurso;
    const carpeta = path.join(__dirname, '..', 'assets', 'videos', idCurso);
    if (!fs.existsSync(carpeta)) {
      fs.mkdirSync(carpeta, { recursive: true });
    }
    cb(null, carpeta);
  },
  filename: (req, file, cb) => {
    // 🟢 Usamos el nombre original
    cb(null, file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  const tiposPermitidos = ['video/mp4', 'video/webm'];
  if (tiposPermitidos.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Formato de archivo no permitido.'), false);
  }
};

const uploadVideos = multer({
  storage,
  fileFilter,
  limits: { fileSize: 3 * 1024 * 1024 } // 3MB
});

module.exports = uploadVideos;
