const { OPEN_READWRITE } = require("sqlite3");
const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database(
  "db/database.sqlite",
  OPEN_READWRITE,
  (error) => {
    if (error) {
      console.error("Ocurrió un error abriendo la base de datos: ", error);
    } else {
      console.log("✅ Conexión exitosa a la base de datos");
    }
  }
);

module.exports = db;


