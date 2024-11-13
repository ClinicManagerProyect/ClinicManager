const connection = require('../data_base/dataBase'); 

const validateUser = (username, callback) => {
   
    const query = 'SELECT id_usuario, tipo_usuario, contrasena FROM usuario WHERE id_usuario = ? AND ESTADO = "A"';
    connection.query(query, [username], (err, results) => {
        if (err) {
            return callback(err, null);
        }
        callback(null, results);
    });
};

const insertPersona = (persona, callback) => {
    const query = 'INSERT INTO PERSONA (ID_PERSONA, TIPO_IDENTIFICACION, NOMBRES, APELLIDOS, GENERO, CORREO, DIRECCION, TELEFONO) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    connection.query(query, [
        persona.id_persona,
        persona.tipo_identificacion,
        persona.nombres,
        persona.apellidos,
        persona.genero,
        persona.correo,
        persona.direccion,
        persona.telefono
    ], (err, results) => {
        if (err) {
            return callback(err, null);
        }
        callback(null, results);
    });
};

const insertUsuario = (usuario, personaId, callback) => {
    const query = 'INSERT INTO USUARIO (ID_USUARIO, ID_PERSONA, CONTRASENA, TIPO_USUARIO, ESTADO) VALUES (?, ?, ?, ?, ?)';
    connection.query(query, [
        usuario.id_usuario,
        personaId, 
        usuario.contrasena,
        usuario.tipo_usuario,
        usuario.estado
    ], (err, results) => {
        if (err) {
            return callback(err, null);
        }
        callback(null, results);
    });
};

const insertEmpleado = (usuarioId, usuarioEstado,empleado, callback) => {
    const query = 'INSERT INTO EMPLEADO (ID_USUARIO, ID_EMPLEO, ID_GERENTE, FECHA_CONTRATACION, ESTADO, HORA_ENTRADA, HORA_SALIDA) VALUES (?, ?, ?, ?, ?, ?, ?)';
    connection.query(query, [
        usuarioId,  
        empleado.id_empleo,
        empleado.id_gerente || null,
        empleado.fecha_contratacion,
        usuarioEstado,
        empleado.hora_entrada,
        empleado.hora_salida
    ], (err, results) => {
        if (err) {
            return callback(err, null);
        }
        callback(null, results);
    });
};

const registrarEmpleadoCompleto = (persona, usuario, empleado, callback) => {
    connection.beginTransaction((err) => {
        if (err) {
            return callback(err, null);
        }
        insertPersona(persona, (err, personaResults) => {
            if (err) {
                return connection.rollback(() => {
                    callback(err, null);
                });
            }

    
            insertUsuario(usuario, persona.id_persona, (err, usuarioResults) => {
                if (err) {
                    return connection.rollback(() => {
                        callback(err, null);
                    });
                }

                
                insertEmpleado(usuario.id_usuario, usuario.estado,empleado, (err, empleadoResults) => {
                    if (err) {
                        return connection.rollback(() => {
                            callback(err, null);
                        });
                    }

                    
                    connection.commit((err) => {
                        if (err) {
                            return connection.rollback(() => {
                                callback(err, null);
                            });
                        }
                        callback(null, empleadoResults);
                    });
                });
            });
        });
    });
};

const deshabilitarEmpleado = (idEmpleado, callback) => {
    connection.beginTransaction((err) => {
        if (err) {
            return callback(err, null);
        }
        const queryUsuario = 'UPDATE USUARIO SET ESTADO = "N" WHERE ID_USUARIO = ?';
        connection.query(queryUsuario, [idEmpleado], (err, results) => {
            if (err) {
                return connection.rollback(() => {
                    callback(err, null);
                });
            }
            const queryEmpleado = 'UPDATE EMPLEADO SET ESTADO = "N" WHERE ID_USUARIO = ?';
            connection.query(queryEmpleado, [idEmpleado], (err, results) => {
                if (err) {
                    return connection.rollback(() => {
                        callback(err, null);
                    });
                }

                connection.commit((err) => {
                    if (err) {
                        return connection.rollback(() => {
                            callback(err, null);
                        });
                    }
                    callback(null, results);
                });
            });
        });
    });
};

function obtenerTodosLosEmpleados(callback) {
    const query = 'SELECT   P.ID_PERSONA,CONCAT(P.NOMBRES, " ", P.APELLIDOS) AS NOMBRE_COMPLETO,U.ESTADO AS ESTADO_USUARIO,EM.NOMBRE_EMPLEO, U.ID_USUARIO FROM EMPLEADO E JOIN USUARIO U ON E.ID_USUARIO = U.ID_USUARIO JOIN PERSONA P ON U.ID_PERSONA = P.ID_PERSONA JOIN EMPLEO EM ON E.ID_EMPLEO = EM.ID_EMPLEO AND U.ESTADO="A";';
    connection.query(query, (err, results) => {
        if (err) {
            return callback(err);
        }
        callback(null, results);
    });
}

function obtenerEmpleadoPorId(idEmpleado, callback) {
    const query = 'SELECT * FROM empleado WHERE id_usuario = ? AND estado="A"';
    connection.query(query, [idEmpleado], (err, results) => {
        if (err) {
            return callback(err);
        }
        callback(null, results[0]);
    });
}

module.exports = {
    validateUser,
    insertPersona,
    insertUsuario,
    insertEmpleado,
    registrarEmpleadoCompleto, 
    deshabilitarEmpleado,
    obtenerTodosLosEmpleados,
    obtenerEmpleadoPorId
};
