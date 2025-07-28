const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Directorio donde se guardarán los logs
const logDir = 'logs';

// Asegurarse de que el directorio exista
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

/**
 * @constant {winston.Logger} homeLogger
 * @description Crea una instancia de Winston para registrar las visitas a las páginas de inicio (home).
 * Los logs se guardan en `logs/home.log`.
 * - Nivel de log: 'debug'.
 * - Formato: Timestamp, nivel de log en mayúsculas y mensaje.
 * - Transporte: Archivo ('home.log').
 */
const homeLogger = winston.createLogger({
  level: 'debug', // Nivel de log 'debug' solicitado
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.printf(info => `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}`)
  ),
  transports: [
    new winston.transports.File({ filename: path.join(logDir, 'home.log') })
  ]
});

module.exports = homeLogger;
