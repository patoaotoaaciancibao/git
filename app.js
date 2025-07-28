const express = require('express');
const path = require('path');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const flash = require('connect-flash');

// --- Controladores y Rutas ---
const authController = require('./controllers/auth/auth.controller');
const adminRoutes = require('./routes/admin.routes');
const publicRoutes = require('./routes/public.routes');
const authRoutes = require('./routes/auth.routes');

// --- Middlewares ---
const userLogin = require('./middlewares/authMiddleware');
const esAdmin = require('./middlewares/adminMiddleware');

const app = express();

// --- Configuración de Sesiones ---
app.use(session({
    store: new SQLiteStore({
        db: 'database.sqlite',
        dir: path.join(__dirname, 'db')
    }),
    secret: 'group-orange', // Cambia esto por una clave secreta más segura
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 } // 1 hora de duración
}));

// Usamos el middleware de connect-flash para almacenar mensajes en las sesiones
app.use(flash());

// --- Middleware Global ---
// Pasa la información del usuario y los mensajes flash a todas las vistas
app.use((req, res, next) => {
    res.locals.usuario = req.session.usuario || null;
    res.locals.messages = req.flash();
    next();
});

// --- Configuración de Express (¡Aquí es donde debe ir el log!) ---
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// --- AÑADE ESTE BLOQUE TEMPORAL PARA DEBUG AQUÍ ---
app.use((req, res, next) => {
    if (req.method === 'POST' && req.path.includes('/calificaciones')) {
        console.log('DEBUG (app.js): req.body inmediatamente después del parseo:', JSON.stringify(req.body, null, 2));
    }
    next(); // ¡IMPORTANTE! Llama a next() para pasar el control al siguiente middleware/ruta
});
// --- FIN DEL BLOQUE TEMPORAL ---


// --- Servir Archivos Estáticos ---
app.use(express.static(path.join(__dirname, 'assets')));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/categorias', express.static(path.join(__dirname, 'assets/categorias')));
// Línea para servir las fotos de perfil
app.use('/profile', express.static(path.join(__dirname, 'assets/profile')));

// ** Agrega esta línea para servir los archivos de video **
app.use('/videos', express.static(path.join(__dirname, 'assets/videos')));

// --- Motor de Vistas ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


// --- Rutas Principales ---
// Rutas “auth” (profesores/alumnos autenticados), sin esAdmin
app.use('/auth', userLogin, authRoutes);

// Rutas administrativas (sólo para admins)
app.use('/admin', esAdmin, adminRoutes);
app.use('/', publicRoutes);

// --- Manejo de Errores (404 Not Found) ---
// Este middleware se ejecuta si ninguna de las rutas anteriores coincide
app.use((req, res, next) => {
    // Reutilizamos el manejador 404 del controlador para mantener la consistencia
    if (authController.show404Page) {
        authController.show404Page(req, res); // Corregido: show44Page en lugar de show404Page
    } else {
        // Si por alguna razón no existe, usamos una vista de respaldo
        res.status(404).render('404', { usuario: req.session.usuario });
    }
});

process.removeAllListeners('warning');

// --- Manejo de errores Multer (tamaño, tipo, etc.)
app.use((err, req, res, next) => {
    if (err.code === 'LIMIT_FILE_SIZE') {
        req.flash('error', 'El archivo es demasiado grande. El límite es 3MB.');
        return res.redirect('back');
    }

    if (err.name === 'MulterError') {
        req.flash('error', err.message || 'Error al subir el archivo.');
        return res.redirect('back');
    }

    // Errores generales
    next(err);
});

module.exports = app;