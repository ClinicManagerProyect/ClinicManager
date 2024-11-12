const express = require('express');
const bodyParser = require('body-parser');
const cors = require("cors");
const app = express();
const PORT = 5000;



app.use(bodyParser.json());
app.use(cors());

const users = [
    { username: 'admin', password: 'admin123', role: 'admin' },
    {username: 'super_admin', password: 'super123', role: 'super admin' },
    { username: 'user', password: 'user123', role: 'user' }
];


app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        res.json({ success: true, user: { username: user.username, role: user.role } });
    } else {
        res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos.' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
