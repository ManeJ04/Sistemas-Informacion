const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

const app = express();

// 1. CONFIGURAR LAS VARIABLES DE ENTORNO (Debe ir antes de requerir BD o Rutas)
dotenv.config({path: path.join(__dirname, 'env/.env')});

// 2. CONFIGURAR CARPETA DE VIEWS 
app.set('views', path.join(__dirname, 'views'));

// 3. CONFIGURAR EL MOTOR DE PLANTILLAS EJS
app.set('view engine', 'ejs');

// 4. CONFIGURAR CARPETA PUBLIC
app.use(express.static(path.join(__dirname, 'public')));

// 5. CONFIGURACION DE FORMULARIOS
app.use(express.urlencoded({extended: true}));
app.use(express.json());

// 6. CONFIGURAR PARA TRABAJAR CON COOKIES (Descomentar cuando lo necesites)
app.use(cookieParser());

// 7. RUTAS
app.use('/', require('./routes/routes'));

app.use(function(req,res,next){
    if(!req.user)
        res.header('Cache-control','private, no-cache, no-store, must-revalidate');
    next()
});

// 8. CONFIGURAR SERVIDOR
app.listen(3001, () => {
    console.log('Servidor activo en puerto', 3001);
});
