let express = require('express'); // Solicitud de Express
const path = require('path'); //Módulo Path de Express
const fs = require('fs'); //Solicito módulo de archivos

/* *****Objeto literal que contiene datos de los usuarios ***** */
const users = JSON.parse(fs.readFileSync('src/data/users.json', 'utf-8'));

/* *****Objeto literal que contiene datos de los partials head***** */
const partialHead = JSON.parse(fs.readFileSync("src/data/partialHead.json", "utf-8"));

//Configuración express-validator
const { validationResult } = require('express-validator'); //Función de express-validator para validar

/* *****Controlador principal***** */
const userController = {

    login: (req, res) => { //A página login
        res.render('login', { partialHead: partialHead.login });
    },
    processLogin: (req, res) => {

        let resultValidation = validationResult(req); //Resultados de la validación
        if (resultValidation.errors.length > 0) {
            console.log(resultValidation.mapped());
            console.log(req.body);
            return res.render('login', {
                errors: resultValidation.mapped(),
                oldData: req.body
            })
        }
        else {
            res.send('Login correcto');
        }
        /*return res.send({
            body: req.body,
            errors: resultValidation.mapped()
            //file: req.file
        });*/
    },
    register: (req, res) => { //A página register
        res.render('register');
    },
    processRegister: (req, res) => {
        let registerValidation = validationResult(req);
        if (registerValidation.errors.length > 0) {
            console.log(registerValidation.mapped());
            console.log(req.body);
            return res.render('register', {
                errors: registerValidation.mapped(),
                oldData: req.body
            });
        }
        else {
            let user = {
                id: users.length + 1,
                fullName: req.body.fullName,
                email: req.body.email,
                birthday: req.body.birthday,
                address: req.body.address,
                avatar: req.file.filename,
                password: req.body.password
            };
            users.push(user);

            fs.writeFileSync('src/data/users.json', (JSON.stringify(users, null, " ")));
            res.redirect('/');
        }
    }
};

module.exports = userController; // Exportación de controlador principal