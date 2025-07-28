const db = require("./conexion"); //importa db


const dbGetAll = function (query) {
    return new Promise((resolve, reject) => {
        db.all(query, (error, records) => {
            if (error) return reject(error); //ocurrio un error
            resolve(records); //termino exitosamente
        });
    });
};


module.exports = {
    dbGetAll, //exporta promesa
};
