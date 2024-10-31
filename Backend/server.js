const express = require("express");
const cors = require("cors");
const connection = require("./dataBase");

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());
