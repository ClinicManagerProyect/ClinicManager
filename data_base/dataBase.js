const mysql = require('mysql2')


const connection = mysql.createConnection({

    host:'localhost',
    user:'root',
    password:'211100',
    database:'clinicmanager'
});


connection.connect(err => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
        return;
    }
    console.log('Conectado a la base de datos MySQL');
});

module.exports = connection;