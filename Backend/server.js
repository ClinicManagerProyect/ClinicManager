const express = require("express");
const cors = require("cors");
const connection = require("../data_base/dataBase");

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());




app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
  
