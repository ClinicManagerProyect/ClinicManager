const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: ".env" }); 

const { 
    obtenerGerentes,
    updatePasswordByEmail,
    validateUserByEmail,
    validateUser,
    deshabilitarEmpleado,
    obtenerTodosLosEmpleados,
    obtenerEmpleadoEspecifico,
    registrarEmpleadoCompleto,
    actualizarEmpleadoC,
    obtenerEmpleadosDes,
    habilitarEmpleado,
    obtenerTodosLosEmpleadosG,
    registrarTarea,
    obtenerTarea,
    actualizarTarea,
    obtenerTareasC,
    obtenerTareaE,
    editarTareaG,
    deleteTask,
    obtenerEmpleadoTareas,
    obtenerTodosLosEmpleadosSG
} = require('../data_base/queries');

const app = express();
const PORT = process.env.PORT;
const SECRET_KEY = process.env.KEY_JSW;
const PDFDocument = require('pdfkit');
const fs = require('fs');


app.use(express.static(path.join(__dirname, '../frontend')));
app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    }
});


  app.get('/reset_password', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/reset_password.html'));
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    
    validateUser(username, (err, results) => {
        if (err) {
            console.error('Error en el proceso de login:', err);
            return res.status(500).json({ message: 'Error en el servidor' });
        }

        if (results.length > 0) {
            const user = results[0];
            console.log("Usuario encontrado:", user);
            bcrypt.compare(password, user.contrasena, (err, isMatch) => {
                if (err) {
                    console.error('Error al verificar la contraseña:', err);
                    return res.status(500).json({ message: 'Error en el servidor' });
                }
                if (isMatch) {
                    const token = jwt.sign({ id: user.id_usuario, role: user.tipo_usuario }, SECRET_KEY, { expiresIn: '1h' });
                    console.log("Token generado:", token);

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
        } else {
            res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos' });
        }
    });
});


app.post('/forgot-password', (req, res) => {
    const { email } = req.body;
    console.log('Email recibido:', email);

    
    validateUserByEmail(email, (err, results) => {
        if (err) {
            console.error('Error al verificar el correo:', err);
            return res.status(500).json({ message: 'Error en el servidor' });
        }

        if (results.length > 0) {
            const user = results[0];

            
            if (!user.CORREO) { 
                console.error('Correo del usuario no encontrado:', user);
                return res.status(400).json({ message: 'El usuario no tiene un correo asociado' });
            }

            
            const resetToken = jwt.sign({ email: user.CORREO }, SECRET_KEY, { expiresIn: '1h' });

            
            const resetLink = `http://127.0.0.1:4000/reset_password?token=${resetToken}`;

          
            const mailOptions = {
                from: 'softwareclinicmanager@gmail.com',
                to: user.CORREO, 
                subject: 'Recuperación de contraseña',
                text: `Hola, recientemente solicitaste un cambio de clave, haz clic en el siguiente enlace para recuperar tu contraseña:\n ${resetLink} \ntienes 60 minutos antes que este expire.`
            };

            
            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    console.error('Error al enviar el correo:', err);
                    return res.status(500).json({ message: 'Error al enviar el correo de recuperación' });
                }
                console.log('Correo enviado:', info.response);
                res.status(200).json({ message: 'Correo de recuperación enviado exitosamente' });
            });
        } else {
            res.status(404).json({ message: 'Correo no encontrado' });
        }
    });
});

app.post('/reset-password', (req, res) => {
    const { token, newPassword } = req.body;

    
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            console.error('Error al verificar el token:', err);
            return res.status(400).json({ message: 'Token inválido o expirado' });
        }

        const email = decoded.email;

       
        const hashedPassword = bcrypt.hashSync(newPassword, 10);

        
        updatePasswordByEmail(email, hashedPassword, (err, results) => {
            if (err) {
                console.error('Error al actualizar la contraseña:', err);
                return res.status(500).json({ message: 'Error al actualizar la contraseña' });
            }

            res.status(200).json({ message: 'Contraseña actualizada exitosamente' });
        });
    });
});
app.post('/registro', async (req, res) => {
    const { persona, usuario, empleado } = req.body;
    console.log("Datos recibidos:", { persona, usuario, empleado });

    try {
        const hashedPassword = await bcrypt.hash(usuario.contrasena, 10);
        usuario.contrasena= hashedPassword;
        registrarEmpleadoCompleto(persona, usuario, empleado, (err, result) => {
            if (err) {
                console.error('Error al registrar:', err);
                return res.status(500).json({ message: 'Ya existe alguien con estas credenciales en la base de datos' });
            }
            res.status(200).json({ message: 'Registro exitoso' });
        });
    } catch (error) {
        console.error('Error al registrar:', error);
        res.status(500).json({ message: 'Error al registrar datos en la base de datos' });
    }
});

app.put('/actualizarEmpleado', async (req, res) => {
    const { persona, usuario, empleado } = req.body;
    console.log("Datos recibidos en actualizar empleado:", { persona, usuario, empleado });

    try {

        actualizarEmpleadoC(persona, usuario, empleado, (err, result) => {
            if (err) {
                console.error('Error al actualizar:', err);
                return res.status(500).json({ message: 'Error al actualizar en la BD' });
            }
            res.status(200).json({ message: 'Actualizacion exitosa' });
            
        });
    } catch (error) {
        console.error('Error al actualizar:', error);
        res.status(500).json({ message: 'Error al actualizar datos en la base de datos' });
    }
});
app.put('/habilitarEmpleado/:idEmpleado', (req, res) => {
    const { idEmpleado } = req.params;  
    

        habilitarEmpleado(idEmpleado, (err, result) => {
        if (err) {
            console.error('Error al deshabilitar empleado:', err);
            return res.status(500).json({ message: 'Error al habilitar empleado' });
        }
        
       
        res.status(200).json({ message: 'Empleado habilitado exitosamente' });
    });
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

app.get('/empleadosDes', (req, res) => {
    obtenerEmpleadosDes((err, empleados) => {
        if (err) {
            console.error('Error al obtener empleados:', err);
            return res.status(500).json({ message: 'Error al obtener empleados' });
        }
        res.status(200).json(empleados);
    });
});

app.get('/gerentes', (req, res) => {
    obtenerGerentes((err,gerentes)=>{
        if(err){
            console.error('Error al obtener gerentes:', err);
            return res.status(500).json({ message: 'Error al obtener gerentes' });
        }
        res.status(200).json(gerentes)
    })
  });
  app.get('/verEmpleadosSG', (req, res) => {
    obtenerTodosLosEmpleadosSG((err,empleados)=>{
        if(err){
            console.error('Error al obtener empleados:', err);
            return res.status(500).json({ message: 'Error al obtener empleados' });
        }
        res.status(200).json(empleados)
    })
  });
app.get('/obtenerEmpleado/:idEmpleado', (req, res) => {
    const { idEmpleado } = req.params;
    obtenerEmpleadoEspecifico(idEmpleado, (err, empleado) => {
        if (err) {
            console.error('Error al obtener el empleado:', err);
            return res.status(500).json({ message: 'Error al obtener el empleado' });
        }
        res.status(200).json(empleado);
    });
});

//endpoints gerentes

app.get('/empleadosAsociados/:idGerente', (req, res) => {
    const { idGerente } = req.params;
    obtenerTodosLosEmpleadosG(idGerente,(err, empleados) => {
        if (err) {
            console.error('Error al obtener empleados:', err);
            return res.status(500).json({ message: 'Error al obtener empleados' });
        }
        res.status(200).json(empleados);
    });
});

app.get('/verTarea/:idEmpleado', (req, res) => {
    const { idEmpleado } = req.params;
    obtenerTarea(idEmpleado,(err, tareas) => {
        if (err) {
            console.error('Error al obtener tarea:', err);
            return res.status(500).json({ message: 'Error al obtener tareas' });
        }
        console.log("Tareas obtenidas:", tareas);
        res.status(200).json(tareas);
    });
});
app.get('/verTareaE/:idEmpleado', (req, res) => {
    const { idEmpleado } = req.params;
    obtenerTareaE(idEmpleado,(err, tareas) => {
        if (err) {
            console.error('Error al obtener tarea:', err);
            return res.status(500).json({ message: 'Error al obtener tareas' });
        }
        console.log("Tareas obtenidas:", tareas);
        res.status(200).json(tareas);
    });
});


app.post('/asignarTarea', async (req, res) => {
    const { idEmpleado, nombreTarea, descripcion, prioridad, fechaVencimiento, estado, idHabitacion } = req.body;

    const idTarea = Math.floor(Math.random() * 9000) + 1000; 
    try {
    registrarTarea( idTarea,idEmpleado,idHabitacion, nombreTarea, descripcion, prioridad, fechaVencimiento, estado, (err, result) => {
        if (err) {
            console.error('Error al registrar:', err);
            return res.status(500).json({ message: 'Error al registrar la tarea' });
        }
        res.status(200).json({ message: 'Tarea asignada exitosamente' });
    });
} catch (error) {
    console.error('Error al asignar tarea:', error);
    res.status(500).json({ message: 'Error al asignar tarea en la base de datos' });
}
});

app.put('/actualizarTarea', async (req, res) => {
    const { idEmpleado, idTarea, estado } = req.body;
    console.log("Datos recibidos en actualizar tarea:", {idEmpleado, idTarea, estado});
    try {

        actualizarTarea( idEmpleado, idTarea, estado, (err, result) => {
            if (err) {
                console.error('Error al actualizar:', err);
                return res.status(500).json({ message: 'Error al actualizar tarea en la BD' });
            }
            res.status(200).json({ message: 'Actualizacion exitosa' });
            
        });
    } catch (error) {
        console.error('Error al actualizar:', error);
        res.status(500).json({ message: 'Error al actualizar datos en la base de datos' });
    }
});

app.put('/editarTarea/:idTarea', async (req, res) => {
    
    const idTarea = req.params.idTarea;
    const { ID_HABITACION, NOMBRE, DESCRIPCION, PRIORIDAD, FECHA_VENCIMIENTO, ESTADO } = req.body;

    console.log("Datos recibidos en editar tarea:", {idTarea,ID_HABITACION, NOMBRE, DESCRIPCION, PRIORIDAD, FECHA_VENCIMIENTO, ESTADO});
    try {
        editarTareaG( idTarea,ID_HABITACION, NOMBRE, DESCRIPCION, PRIORIDAD, FECHA_VENCIMIENTO, ESTADO, (err, result) => {
            if (err) {
                console.error('Error al editar:', err);
                return res.status(500).json({ message: 'Error al editar tarea en la BD' });
            }
            res.status(200).json({ message: 'Se edito la tarea exitosamente' });
            
        });
    } catch (error) {
        console.error('Error al editar tarea:', error);
        res.status(500).json({ message: 'Error al editar datos de la tarea  en la base de datos' });
    }
});

app.get('/verTareasCompletas/:idEmpleado', (req, res) => {
    const { idEmpleado } = req.params;
    obtenerTareasC(idEmpleado,(err, tareas) => {
        if (err) {
            console.error('Error al obtener tareas completas:', err);
            return res.status(500).json({ message: 'Error al obtener tareas' });
        }
        console.log("Tareas completas obtenidas:", tareas);
        res.status(200).json(tareas);
    });
});

app.delete('/eliminarTarea/:idTareaD', (req, res) => {
    const idTareaD = req.params.idTareaD;
    console.log("datos recibidos", idTareaD )
    deleteTask(idTareaD,(err, result) => {
        if (err) {
            console.error('Error elimonar tarea:', err);
            return res.status(500).json({ message: 'Error elimonar tarea' });
        }
        console.log("Tarea eliminada exitosamente:");
        res.status(200).json({ message: 'Se elimino la tarea exitosamente' });
    });
});

app.get('/generarInforme/:idGerente', async (req, res) => {
    const { idGerente } = req.params;

   
    obtenerEmpleadoTareas(idGerente, (err, empleadosTareas) => {
        if (err) {
            console.error('Error al obtener datos de los empleados:', err);
            return res.status(500).json({ message: 'Error al obtener datos de los empleados' });
        }

        if (!empleadosTareas || empleadosTareas.length === 0) {
            return res.status(404).json({ message: 'Gerente no encontrado o sin empleados asignados' });
        }

        const doc = new PDFDocument();
        const filePath = `informe_gerente_${idGerente}.pdf`;
        const writeStream = fs.createWriteStream(filePath);

        doc.pipe(writeStream);

        // Título del documento
        doc.fontSize(20).text('Informe de Empleados', { align: 'center' });
        doc.moveDown();

        // Información del gerente
        doc.fontSize(14).text(`ID Gerente: ${idGerente}`);
        doc.text(`Nombre Gerente: ${empleadosTareas[0].NOMBRE_GERENTE}`); // Usamos el nombre del gerente desde los datos
        doc.moveDown();

        // Información de los empleados
        doc.fontSize(16).text('Empleados Asignados:', { underline: true });

        // Agrupar tareas por empleado
        const empleadosAgrupados = empleadosTareas.reduce((acc, empleado) => {
            // Si el empleado no está en el acumulador, lo agregamos
            if (!acc[empleado.ID_EMPLEADO]) {
                acc[empleado.ID_EMPLEADO] = {
                    nombre: empleado.NOMBRE_EMPLEADO,
                    tareas: []
                };
            }
            // Añadir tarea al empleado correspondiente
            acc[empleado.ID_EMPLEADO].tareas.push({
                nombre: empleado.NOMBRE_TAREA,
                descripcion: empleado.DESCRIPCION_TAREA,
                prioridad: empleado.PRIORIDAD,
                estado: empleado.ESTADO_TAREA || 'Sin asignar', // Aseguramos que tenga un estado
                fechaVencimiento: empleado.FECHA_VENCIMIENTO,
                habitacion: empleado.NOMBRE_HABITACION
            });
            return acc;
        }, {});

        // Recorrer los empleados agrupados
        Object.keys(empleadosAgrupados).forEach((idEmpleado, index) => {
            const empleado = empleadosAgrupados[idEmpleado];

            doc.moveDown();
            doc.fontSize(14).text(`Empleado ${index + 1}:`);
            doc.text(`Nombre: ${empleado.nombre}`);
            doc.text(`ID Empleado: ${idEmpleado}`);
            doc.moveDown();

            // Tareas Asignadas al empleado
            doc.fontSize(14).text(`Tareas Asignadas:`);
            empleado.tareas.forEach((tarea, tareaIndex) => {
                doc.moveDown();
                doc.fontSize(12).text(`Tarea ${tareaIndex + 1}:`);
                doc.text(`Nombre: ${tarea.nombre}`);
                doc.text(`Descripción: ${tarea.descripcion}`);
                doc.text(`Prioridad: ${tarea.prioridad}`);
                doc.text(`Estado: ${tarea.estado}`);
                doc.text(`Fecha de Vencimiento: ${tarea.fechaVencimiento}`);
                doc.text(`Habitación: ${tarea.habitacion}`);
            });
        });

        doc.end();

        
        writeStream.on('finish', () => {
            res.download(filePath, (err) => {
                if (err) {
                    console.error('Error al enviar el archivo PDF:', err);
                }

            
                fs.unlinkSync(filePath);
            });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
