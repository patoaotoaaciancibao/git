const fs = require('fs');
const path = require('path');
const { createLogger, format, transports } = require('winston');

// Crear carpeta /logs si no existe
const logDir = path.resolve(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

// Crear logger principal
const logger = createLogger({
    level: 'debug',
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf(info => `${info.timestamp} [${info.level.toUpperCase()}] ${info.message}`)
    ),
    transports: [
        // Registro general de autenticación
        new transports.File({ filename: path.join(logDir, 'auth.log'), level: 'info' }),

        // Registro exclusivo para acciones administrativas
        new transports.File({ filename: path.join(logDir, 'admin.log'), level: 'debug' }),

        // También mostrar en consola
        new transports.Console()
    ]
});

logger.on('error', (err) => {
    console.error('Error en logger:', err);
});

// Prueba de funcionamiento
logger.info('Logger funcionando correctamente');

module.exports = logger;
