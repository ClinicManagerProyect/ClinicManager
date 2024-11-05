const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const {validateUser} = require('../data_base/queries');
const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

const SECRET_KEY = 'clave211100';

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


app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
