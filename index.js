const app = require('./app');
const serverLogger = require('./utils/server-logger');

const PORT = 3000;
// Escucharemos en '0.0.0.0' para asegurar la accesibilidad desde localhost, 127.0.0.1, y la IP de la red local.
const HOST = '0.0.0.0'; 

const server = app.listen(PORT, HOST, () => {
    // Para la URL de acceso, seguimos usando 'localhost' que es más amigable.
    const accessUrl = `http://localhost:${PORT}`;
    const message = `Servidor corriendo en: ${accessUrl}`;
    
    // Registra el inicio en el log
    serverLogger.info(message);
    
    // Muestra el mensaje en la consola
    console.log(`\n\x1b[32m${message}\x1b[0m`);
    console.log(`\x1b[36mPresiona Ctrl + Click en la URL para abrir en el navegador: ${accessUrl}\x1b[0m`);
});

/**
 * @function
 * @description Maneja la señal de interrupción (Ctrl+C) para finalizar el servidor de forma elegante.
 * Registra el evento de finalización en el archivo de log antes de cerrar el proceso.
 */
process.on('SIGINT', () => {
  serverLogger.info('Servidor finalizado por el usuario (Ctrl+C)');
  server.close(() => {
    console.log('\nServidor cerrado.');
    process.exit(0);
  });
});
