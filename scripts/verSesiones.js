/**
 * Script: verSesiones.js
 * Descripción: Muestra todas las sesiones activas guardadas en sessions.sqlite,
 *              incluyendo si son usuarios comunes o administradores.
 * Uso: node scripts/verSesiones.js
 * Autor: Gaby 💛
 * Fecha: [Actualizá con fecha de entrega]
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '..', 'db', 'sessions.sqlite');
const db = new sqlite3.Database(dbPath);

// Obtener la fecha actual en formato timestamp (milisegundos)
const now = Date.now();

db.all("SELECT sid, sess, expired FROM sessions WHERE expired > ?", [now], (err, rows) => {
    if (err) {
        console.error('❌ Error consultando sesiones:', err.message);
        return;
    }

    if (rows.length === 0) {
        console.log('🚫 No hay sesiones activas (todas expiradas o vacías).');
    } else {
        console.log('📦 Sesiones activas:\n');

        rows.forEach((row, index) => {
            try {
                const datosSesion = JSON.parse(row.sess);
                const usuario = datosSesion.usuario;

                console.log(`🆔 Sesión #${index + 1}`);
                console.log(`🔑 SID: ${row.sid}`);
                console.log(`📆 Expira: ${new Date(row.expired).toLocaleString()}`);

                if (usuario) {
                    console.log(`👤 Usuario: ${usuario.nombre} ${usuario.apellido}`);
                    console.log(`📧 Email: ${usuario.email}`);
                    console.log(`🛡️ Es admin: ${usuario.es_admin ? 'Sí' : 'No'}`);
                } else {
                    console.log(`⚠️ No hay datos de usuario guardados en esta sesión.`);
                }

                console.log('---');
            } catch (parseError) {
                console.error(`⚠️ Error al interpretar la sesión ${row.sid}:`, parseError.message);
            }
        });
    }

    db.close();
});
