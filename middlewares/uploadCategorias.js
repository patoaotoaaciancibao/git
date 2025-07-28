const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuración del almacenamiento
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './assets/categorias/');
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname).toLowerCase();
        const idCategoria = req.params.id || 'temp'; // En crear usamos 'temp'
        cb(null, `${idCategoria}${ext}`);
    }
});

// Filtro para validar tipos de archivos
const fileFilter = (req, file, cb) => {
    const allowedExt = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (!allowedExt.includes(ext)) {
        //Importante: esto no lanza throw, sino pasa el error a Multer
        return cb(new Error('Formato no permitido. Solo JPG, PNG o WEBP.'), false);
    }

    cb(null, true);
};

// Middleware de subida con límite de tamaño
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB
    }
});

module.exports = upload;
