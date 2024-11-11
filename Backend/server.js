const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { validateUser, insertPersona, insertUsuario, insertEmpleado, deshabilitarEmpleado, obtenerTodosLosEmpleados, obtenerEmpleadoPorId } = require('../data_base/queries');
const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

const SECRET_KEY = '211100';

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    validateUser(username, password, (err, results) => {
        if (err) {
            console.error('Error en el proceso de login:', err);
            return res.status(500).json({ message: 'Error en el servidor' });
        }

        console.log(results);
        if (results.length > 0) {
            const user = results[0];
            console.log("user:", user);
            const token = jwt.sign({ id: user.id_usuario, role: user.tipo_usuario }, SECRET_KEY, { expiresIn: '1h' });
            console.log("Token:", token);

            res.json({
                success: true,
                user: {
                    username: user.id_usuario,  
                    role: user.tipo_usuario     
                },
                token: token
            });
        } else {
            res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos' });
        }
    });
});

app.post('/registro', async (req, res) => {
    const { persona, usuario, empleado } = req.body;
    console.log("Datos recibidos:", { persona, usuario, empleado });
    try {
   
        insertPersona(persona, (err, personaResults) => {
            if (err) {
                console.error('Error al insertar persona:', err);
                return res.status(500).json({ message: 'Error al insertar persona' });
            }

     
            insertUsuario(usuario, persona.id_persona, (err, usuarioResults) => {
                if (err) {
                    console.error('Error al insertar usuario:', err);
                    return res.status(500).json({ message: 'Error al insertar usuario' });
                }

                insertEmpleado(usuario.id_usuario, empleado, (err, empleadoResults) => {
                    if (err) {
                        console.error('Error al insertar empleado:', err);
                        return res.status(500).json({ message: 'Error al insertar empleado' });
                    }

                    res.status(200).json({ message: 'Registro exitoso' });
                });
            });
        });
    } catch (error) {
        console.error('Error al registrar:', error);
        res.status(500).json({ message: 'Error al registrar datos en la base de datos' });
    }
});

app.put('/deshabilitarEmpleado/:idEmpleado', (req, res) => {
    const { idEmpleado } = req.params;  
    

    deshabilitarEmpleado(idEmpleado, (err, result) => {
        if (err) {
            console.error('Error al deshabilitar empleado:', err);
            return res.status(500).json({ message: 'Error al deshabilitar empleado' });
        }
        
       
        res.status(200).json({ message: 'Empleado deshabilitado exitosamente' });
    });
});
app.get('/empleados', (req, res) => {
    obtenerTodosLosEmpleados((err, empleados) => {
        if (err) {
            console.error('Error al obtener empleados:', err);
            return res.status(500).json({ message: 'Error al obtener empleados' });
        }
        res.status(200).json(empleados);
    });
});


app.get('/empleados/:idEmpleado', (req, res) => {
    const { idEmpleado } = req.params;
    obtenerEmpleadoPorId(idEmpleado, (err, empleado) => {
        if (err) {
            console.error('Error al obtener el empleado:', err);
            return res.status(500).json({ message: 'Error al obtener el empleado' });
        }
        res.status(200).json(empleado);
    });
});


app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
