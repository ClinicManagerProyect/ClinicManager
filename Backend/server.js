const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { updatePasswordByEmail,validateUserByEmail ,validateUser,deshabilitarEmpleado, obtenerTodosLosEmpleados, obtenerEmpleadoPorId,registrarEmpleadoCompleto } = require('../data_base/queries');
const app = express();
const PORT = process.env.PORT;
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: ".env" }); 

app.use(express.static(path.join(__dirname, '../frontend')));
app.use(cors());
app.use(express.json());
const SECRET_KEY = process.env.KEY_JSW;


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
                return res.status(500).json({ message: 'Error al registrar datos en la base de datos' });
            }
            res.status(200).json({ message: 'Registro exitoso' });
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
