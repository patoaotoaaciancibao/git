// uploadProfile.js
// Middleware de Multer para subir foto de perfil

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Directorio donde se guardarán las fotos de perfil
const profileDir = path.join(__dirname, '../assets/profile');

// Asegurarse de que el directorio exista
if (!fs.existsSync(profileDir)) {
    fs.mkdirSync(profileDir, { recursive: true });
}

// Configuración de almacenamiento de Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, profileDir);
    },
    filename: (req, file, cb) => {
        // Usar el ID del usuario y un timestamp para el nombre del archivo, asegurando un nombre único
        const userId = req.session.usuario.id;
        const extension = path.extname(file.originalname);
        // El timestamp previene problemas de caché en el navegador
        const newFilename = `${userId}${Date.now()}${extension}`;
        cb(null, newFilename);
    }
});

// Filtro para aceptar solo imágenes
const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
        return cb(null, true);
    }
    // Si el archivo no es una imagen, rechazarlo.
    cb(new Error('¡Solo se admiten archivos de imagen!'));
};

const uploadProfile = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 }, // Límite de 5MB
    fileFilter: fileFilter
});

module.exports = uploadProfile;
