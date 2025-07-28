const { createLogger, format, transports } = require('winston');
const path = require('path');
const fs = require('fs');

// Crear carpeta logs si no existe
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);

const inscripcionLogger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // ⏰ Formato limpio
        format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level.toUpperCase()}] ${message}`;
        })
    ),
    transports: [
        new transports.File({ filename: path.join(logsDir, 'inscripciones.log') })
    ]
});

module.exports = inscripcionLogger;
