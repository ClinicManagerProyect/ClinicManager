const express = require("express");
const cors = require("cors");
const {validateUser} = require('../data_base/queries');
const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    validateUser(username, password, (err, results) => {
        if(err){
            console.error('Error en el proceso de login:',err);
            return res.status(500).json({message: 'Error en el servidor'});
        }

        if (results.length > 0) {
            const user = results[0]; 
            res.json({
                success: true,
                user: {
                    username: user.ID_USUARIO,
                    role: user.TIPO_USUARIO 
                }
            });
        } else {
            res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos' });
        }
    });
});


app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
