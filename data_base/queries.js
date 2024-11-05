// data_base/queries.js
const connection = require('../data_base/dataBase'); // Asegúrate de que la ruta sea correcta

// Función para verificar usuario y contraseña
const validateUser = (username, password, callback) => {
    const query = 'SELECT * FROM usuario WHERE id_usuario = ? AND contrasena = ?';
    connection.query(query, [username, password], (err, results) => {
        if (err) {
            return callback(err, null);
        }
        callback(null, results);
    });
};

module.exports = {
    validateUser
};
