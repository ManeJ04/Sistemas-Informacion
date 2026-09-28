const mysql = require('mysql2');

const conexion = mysql.createConnection({
    host: '127.0.0.1',    // A veces localhost en Mac con Docker falla, 127.0.0.1 es más seguro
    user: 'root',
    password: 'clave',
    database: 'login'
});

conexion.connect((error) => {
    if(error){
        console.log('Error de Conexion con BD: ' + error);
        return;
    }
    console.log('Base de datos Conectada');
});

module.exports = conexion;