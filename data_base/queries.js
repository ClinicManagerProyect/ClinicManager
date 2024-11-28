const connection = require("../data_base/dataBase");

const validateUser = (username, callback) => {
  const query =
    'SELECT id_usuario, tipo_usuario, contrasena FROM usuario WHERE id_usuario = ? AND ESTADO = "A"';
  connection.query(query, [username], (err, results) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, results);
  });
};

const validateUserByEmail = (email, callback) => {
  const query = "SELECT * FROM persona WHERE correo = ?";
  connection.query(query, [email], (err, results) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, results);
  });
};

function updatePasswordByEmail(email, newPassword, callback) {
  const query =
    "UPDATE USUARIO SET CONTRASENA = ? WHERE ID_PERSONA = (SELECT ID_PERSONA FROM PERSONA WHERE CORREO = ?);";
  connection.query(query, [newPassword, email], (err, results) => {
    if (err) {
      return callback(err);
    }
    callback(null, results);
  });
}

const insertPersona = (persona, callback) => {
  const query =
    "INSERT INTO PERSONA (ID_PERSONA, TIPO_IDENTIFICACION, NOMBRES, APELLIDOS, GENERO, CORREO, DIRECCION, TELEFONO) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
  connection.query(
    query,
    [
      persona.id_persona,
      persona.tipo_identificacion,
      persona.nombres,
      persona.apellidos,
      persona.genero,
      persona.correo,
      persona.direccion,
      persona.telefono,
    ],
    (err, results) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, results);
    }
  );
};

const insertUsuario = (usuario, personaId, callback) => {
  const query =
    "INSERT INTO USUARIO (ID_USUARIO, ID_PERSONA, CONTRASENA, TIPO_USUARIO, ESTADO) VALUES (?, ?, ?, ?, ?)";
  connection.query(
    query,
    [
      usuario.id_usuario,
      personaId,
      usuario.contrasena,
      usuario.tipo_usuario,
      usuario.estado,
    ],
    (err, results) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, results);
    }
  );
};

const insertEmpleado = (usuarioId, usuarioEstado, empleado, callback) => {
  const query =
    "INSERT INTO EMPLEADO (ID_USUARIO, ID_EMPLEO, ID_GERENTE, FECHA_CONTRATACION, ESTADO, HORA_ENTRADA, HORA_SALIDA) VALUES (?, ?, ?, ?, ?, ?, ?)";
  connection.query(
    query,
    [
      usuarioId,
      empleado.id_empleo,
      empleado.id_gerente || null,
      empleado.fecha_contratacion,
      usuarioEstado,
      empleado.hora_entrada,
      empleado.hora_salida,
    ],
    (err, results) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, results);
    }
  );
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

        insertEmpleado(
          usuario.id_usuario,
          usuario.estado,
          empleado,
          (err, empleadoResults) => {
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
          }
        );
      });
    });
  });
};

const actualizarP = (persona, callback) => {
  const query =
    "UPDATE PERSONA SET TIPO_IDENTIFICACION = ?, NOMBRES = ?, APELLIDOS = ?, GENERO = ?, CORREO = ?, DIRECCION = ?, TELEFONO = ? WHERE ID_PERSONA = ?";
  connection.query(
    query,
    [
      persona.tipo_identificacion,
      persona.nombres,
      persona.apellidos,
      persona.genero,
      persona.correo,
      persona.direccion,
      persona.telefono,
      persona.id_persona,
    ],
    (err, results) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, results);
    }
  );
};

const actualizarU = (usuario, callback) => {
  const query =
    "UPDATE USUARIO SET TIPO_USUARIO = ?, ESTADO = ? WHERE ID_USUARIO = ?";
  connection.query(
    query,
    [usuario.tipo_usuario, usuario.estado, usuario.id_usuario],
    (err, results) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, results);
    }
  );
};

const actualizarE = (empleado, Idusuario, callback) => {
  const query =
    "UPDATE EMPLEADO SET ID_EMPLEO = ?, ID_GERENTE = ?, FECHA_CONTRATACION = ?, HORA_ENTRADA = ?, HORA_SALIDA = ? WHERE ID_USUARIO = ?";
  connection.query(
    query,
    [
      empleado.id_empleo,
      empleado.id_gerente || null,
      empleado.fecha_contratacion,
      empleado.hora_entrada,
      empleado.hora_salida,
      Idusuario,
    ],
    (err, results) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, results);
    }
  );
};

const actualizarEmpleadoC = (persona, usuario, empleado, callback) => {
  connection.beginTransaction((err) => {
    if (err) {
      return callback(err, null);
    }
    actualizarP(persona, (err, personaResults) => {
      if (err) {
        return connection.rollback(() => {
          callback(err, null);
        });
      }

      actualizarU(usuario, (err, usuarioResults) => {
        if (err) {
          return connection.rollback(() => {
            callback(err, null);
          });
        }

        actualizarE(empleado, usuario.id_usuario, (err, empleadoResults) => {
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
const habilitarEmpleado = (idEmpleado, callback) => {
  connection.beginTransaction((err) => {
    if (err) {
      return callback(err, null);
    }
    const queryUsuario = 'UPDATE USUARIO SET ESTADO = "A" WHERE ID_USUARIO = ?';
    connection.query(queryUsuario, [idEmpleado], (err, results) => {
      if (err) {
        return connection.rollback(() => {
          callback(err, null);
        });
      }
      const queryEmpleado =
        'UPDATE EMPLEADO SET ESTADO = "A" WHERE ID_USUARIO = ?';
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
      const queryEmpleado =
        'UPDATE EMPLEADO SET ESTADO = "N" WHERE ID_USUARIO = ?';
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
  const query =
    'SELECT   P.ID_PERSONA,CONCAT(P.NOMBRES, " ", P.APELLIDOS) AS NOMBRE_COMPLETO,U.ESTADO AS ESTADO_USUARIO,EM.NOMBRE_EMPLEO, U.ID_USUARIO FROM EMPLEADO E JOIN USUARIO U ON E.ID_USUARIO = U.ID_USUARIO JOIN PERSONA P ON U.ID_PERSONA = P.ID_PERSONA JOIN EMPLEO EM ON E.ID_EMPLEO = EM.ID_EMPLEO AND U.ESTADO="A";';
  connection.query(query, (err, results) => {
    if (err) {
      return callback(err);
    }
    callback(null, results);
  });
}
function obtenerTodosLosEmpleadosSG(callback) {
  const query =
    'SELECT P.ID_PERSONA,CONCAT(P.NOMBRES, " ", P.APELLIDOS) AS NOMBRE_COMPLETO,P.GENERO,P.CORREO,P.DIRECCION,P.TELEFONO,U.ESTADO AS ESTADO_USUARIO,EM.NOMBRE_EMPLEO, U.ID_USUARIO FROM EMPLEADO E JOIN USUARIO U ON E.ID_USUARIO = U.ID_USUARIO JOIN PERSONA P ON U.ID_PERSONA = P.ID_PERSONA JOIN EMPLEO EM ON E.ID_EMPLEO = EM.ID_EMPLEO WHERE U.ESTADO="A" AND U.TIPO_USUARIO="EMP";';
  connection.query(query, (err, results) => {
    if (err) {
      return callback(err);
    }
    callback(null, results);
  });
}

function obtenerTodosLosEmpleadosG(id_gerente, callback) {
  const query = `
        SELECT E.ID_USUARIO AS ID_EMPLEADO,
               CONCAT(P.NOMBRES, ' ', P.APELLIDOS) AS NOMBRE_COMPLETO, 
               U.ESTADO AS ESTADO_USUARIO, 
               EM.NOMBRE_EMPLEO AS "AREA ENCARGADA", 
               CONCAT(E.HORA_ENTRADA, ' ', E.HORA_SALIDA) AS HORARIO
        FROM EMPLEADO E
        JOIN USUARIO U ON E.ID_USUARIO = U.ID_USUARIO 
        JOIN PERSONA P ON U.ID_PERSONA = P.ID_PERSONA 
        JOIN EMPLEO EM ON E.ID_EMPLEO = EM.ID_EMPLEO 
        WHERE E.ID_GERENTE = ?
          AND E.ESTADO = 'A';
    `;
  connection.query(query, [id_gerente], (err, results) => {
    if (err) {
      return callback(err);
    }
    callback(null, results);
  });
}

function obtenerEmpleadosDes(callback) {
  const query =
    'SELECT   P.ID_PERSONA,CONCAT(P.NOMBRES, " ", P.APELLIDOS) AS NOMBRE_COMPLETO,U.ESTADO AS ESTADO_USUARIO,EM.NOMBRE_EMPLEO, U.ID_USUARIO FROM EMPLEADO E JOIN USUARIO U ON E.ID_USUARIO = U.ID_USUARIO JOIN PERSONA P ON U.ID_PERSONA = P.ID_PERSONA JOIN EMPLEO EM ON E.ID_EMPLEO = EM.ID_EMPLEO AND U.ESTADO="N";';
  connection.query(query, (err, results) => {
    if (err) {
      return callback(err);
    }
    callback(null, results);
  });
}

function obtenerGerentes(callback) {
  const query =
    `SELECT   
P.ID_PERSONA,
P.GENERO,
P.CORREO,
P.DIRECCION,
P.TELEFONO,
CONCAT(P.NOMBRES, " ", P.APELLIDOS) AS NOMBRE_COMPLETO,
U.ESTADO AS ESTADO_USUARIO,
EM.NOMBRE_EMPLEO, U.ID_USUARIO 
FROM EMPLEADO E JOIN USUARIO U ON E.ID_USUARIO = U.ID_USUARIO 
JOIN PERSONA P ON U.ID_PERSONA = P.ID_PERSONA 
JOIN EMPLEO EM ON E.ID_EMPLEO = EM.ID_EMPLEO 
WHERE U.ESTADO="A" AND U.TIPO_USUARIO="GER"`;

  connection.query(query, (err, results) => {
    if (err) {
      return callback(err);
    }
    callback(null, results);
  });
}

function obtenerEmpleadoEspecifico(idEmpleado, callback) {
  const query = `
        SELECT P.*, U.ID_USUARIO,U.TIPO_USUARIO, E.*, O.nombre_empleo
        FROM PERSONA P 
        JOIN USUARIO U ON P.ID_PERSONA = U.ID_PERSONA 
        JOIN EMPLEADO E ON U.ID_USUARIO = E.ID_USUARIO 
        JOIN EMPLEO O ON E.ID_EMPLEO = O.ID_EMPLEO 
        WHERE U.ID_USUARIO = ?`;

  connection.query(query, [idEmpleado], (err, results) => {
    if (err) {
      return callback(err);
    }
    callback(null, results[0]);
  });
}

const registrarTarea = (
  idTarea,
  idEmpleado,
  idHabitacion,
  nombreTarea,
  descripcion,
  prioridad,
  fechaVencimiento,
  estado,
  callback
) => {
  const query = `
        INSERT INTO TAREA (ID_TAREA, ID_USUARIO, ID_HABITACION, NOMBRE, DESCRIPCION, PRIORIDAD, FECHA_VENCIMIENTO, ESTADO)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

  connection.query(
    query,
    [
      idTarea,
      idEmpleado,
      idHabitacion,
      nombreTarea,
      descripcion,
      prioridad,
      fechaVencimiento,
      estado,
    ],
    (err, results) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, results[0]);
    }
  );
};

function obtenerTarea(idEmpleado, callback) {
  const query = `select * from tarea where id_usuario=?`;

  connection.query(query, [idEmpleado], (err, results) => {
    if (err) {
      return callback(err);
    }

    callback(null, results);
  });
}
function obtenerTareaE(idEmpleado, callback) {
  const query = `select * from tarea where id_usuario=? and estado IN ('ASG','SCM')`;

  connection.query(query, [idEmpleado], (err, results) => {
    if (err) {
      return callback(err);
    }

    callback(null, results);
  });
}

function actualizarTarea(idEmpleado, idTarea, estado, callback) {
  const query = ` update tarea set estado =? where id_USUARIO=? AND ID_TAREA=?`;

  connection.query(query, [estado, idEmpleado, idTarea], (err, results) => {
    if (err) {
      return callback(err);
    }

    callback(null, results);
  });
}

function obtenerTareasC(idEmpleado, callback) {
  const query = `select * from tarea where id_usuario=? and estado='COM'`;

  connection.query(query, [idEmpleado], (err, results) => {
    if (err) {
      return callback(err);
    }

    callback(null, results);
  });
}
function editarTareaG(
  idTarea,
  ID_HABITACION,
  NOMBRE,
  DESCRIPCION,
  PRIORIDAD,
  FECHA_VENCIMIENTO,
  ESTADO,
  callback
) {
  const query = `UPDATE tarea SET ID_HABITACION = ?, NOMBRE = ?, DESCRIPCION = ?, PRIORIDAD = ?, FECHA_VENCIMIENTO = ?, ESTADO = ? WHERE ID_TAREA = ? `;
  connection.query(
    query,
    [
      ID_HABITACION,
      NOMBRE,
      DESCRIPCION,
      PRIORIDAD,
      FECHA_VENCIMIENTO,
      ESTADO,
      idTarea,
    ],
    (err, results) => {
      if (err) {
        return callback(err);
      }

      callback(null, results);
    }
  );
}

function deleteTask( idTarea,callback) {

    const query = `DELETE FROM tarea WHERE ID_TAREA = ?`;
  
    connection.query(query, [idTarea], (err, results) => {
      if (err) {
        return callback(err);
      }
  
      callback(null, results);
    });
  }

  function obtenerEmpleadoTareas( idGerente,callback) {

    const query = `SELECT 
    g.ID_USUARIO AS ID_GERENTE,
    CONCAT(p_g.NOMBRES, ' ', p_g.APELLIDOS) AS NOMBRE_GERENTE,
    e.ID_USUARIO AS ID_EMPLEADO,
    CONCAT(p_e.NOMBRES, ' ', p_e.APELLIDOS) AS NOMBRE_EMPLEADO,
    t.ID_TAREA,
    t.NOMBRE AS NOMBRE_TAREA,
    t.DESCRIPCION AS DESCRIPCION_TAREA,
    t.PRIORIDAD,
    t.ESTADO AS ESTADO_TAREA,
    t.FECHA_VENCIMIENTO,
    h.NOMBRE AS NOMBRE_HABITACION
FROM 
    EMPLEADO g
INNER JOIN 
    EMPLEADO e ON g.ID_USUARIO = e.ID_GERENTE
INNER JOIN 
    USUARIO u_g ON g.ID_USUARIO = u_g.ID_USUARIO
INNER JOIN 
    PERSONA p_g ON u_g.ID_PERSONA = p_g.ID_PERSONA
INNER JOIN 
    USUARIO u_e ON e.ID_USUARIO = u_e.ID_USUARIO
INNER JOIN 
    PERSONA p_e ON u_e.ID_PERSONA = p_e.ID_PERSONA
LEFT JOIN 
    TAREA t ON e.ID_USUARIO = t.ID_USUARIO
LEFT JOIN 
    HABITACION h ON t.ID_HABITACION = h.ID_HABITACION
WHERE 
    g.ID_USUARIO = ? 
AND t.ID_TAREA IS NOT NULL
ORDER BY 
    e.ID_USUARIO, t.FECHA_VENCIMIENTO;`;
  
    connection.query(query, [idGerente], (err, results) => {
      if (err) {
        return callback(err);
      }
  
      callback(null, results);
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
  obtenerTodosLosEmpleadosG,
  validateUserByEmail,
  updatePasswordByEmail,
  obtenerGerentes,
  obtenerEmpleadoEspecifico,
  actualizarEmpleadoC,
  obtenerEmpleadosDes,
  habilitarEmpleado,
  registrarTarea,
  obtenerTarea,
  actualizarTarea,
  obtenerTareasC,
  obtenerTareaE,
  editarTareaG,
  deleteTask,
  obtenerEmpleadoTareas,
  obtenerTodosLosEmpleadosSG
};
