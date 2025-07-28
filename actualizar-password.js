const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Ruta a la base de datos
const dbPath = path.join(__dirname, 'db', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

(async () => {
  try {
    const nuevaContraseña = '123456'; // Valor para pruebas
    const hash = await bcrypt.hash(nuevaContraseña, 10);

    console.log('🔐 Hash generado:', hash); // ✅ Mostramos el hash
    // Actualizar usuarios comunes
    db.run(
      "UPDATE usuarios SET contraseña = ? WHERE es_admin = 0",
      [hash],
      function (err) {
        if (err) return console.error('❌ Error actualizando usuarios comunes:', err);
        console.log(`✅ ${this.changes} usuarios comunes actualizados.`);
      }
    );

    // Actualizar admin específico
    db.run(
      "UPDATE usuarios SET contraseña = ? WHERE email = 'gabriela@example.com'",
      [hash],
      function (err) {
        if (err) return console.error('❌ Error actualizando admin:', err);
        console.log(`✅ Admin actualizado (${this.changes} fila).`);
      }
    );

  } catch (error) {
    console.error('❌ Error generando hash o actualizando:', error);
  }
})();
