let express = require('express'); // Solicitud de Express
const path = require('path'); //Módulo Path de Express
const fs = require('fs'); //Solicito módulo de archivos

/* *****Objeto literal que contiene datos para botonera ***** */
const botones = JSON.parse(fs.readFileSync("src/data/botones.json", "utf-8"));

const partialHead = JSON.parse(fs.readFileSync("src/data/partialHead.json", "utf-8"));

/* *****Controlador principal***** */
const mainController = {

    index: function (req, res) { //A página index
        res.render('index', { botones, partialHead: partialHead.index });
    }
};

module.exports = mainController; // Exportación de controlador principal

