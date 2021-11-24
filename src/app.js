const express = require('express'); // Requerimos Express
const app = express(); //Generamos app de express
const host = 3050; //Establezco host a utilizar
app.use(express.urlencoded({ extended: false })); //Middleware global para recibir la info de un formulario
const path = require('path'); // Requerimos módulo Path

//Armamos el enlace público
const publicPath = path.resolve(__dirname, '../public');
app.use(express.static(publicPath));


/* ***Implementación EJS*** */
app.set('views', __dirname + '/views'); // Redireccionamiento de carpeta views (sino no funciona)
app.set('view engine', 'ejs'); // Establezco EJS como motor de plantilla

/****** Configuración para CRUD ******/
app.use(express.urlencoded({ extended: false })); //Se indica a la aplicación que todo lo que recibamos proveniente de un formulario lo capture en forma de objeto literal
app.use(express.json()); //Nos permite convertir el objeto literal de la línea anterior a un formto JSON, si es que así lo queremos

/****** Solicitud Rutas ******/
const mainRoutes = require('./routes/main.js'); /****** Ruta Main ******/
const userRoutes = require('./routes/userRoutes.js');

/* #### USO RUTAS #### */
app.use('/', mainRoutes); //A rutas principales
app.use('/user', userRoutes); //A rutas principales

// ***Corremos el servidor indicado en la variable host***
app.listen(host, () => {
    console.log('Servidor corriendo => http://localhost:' + host + '/');
});