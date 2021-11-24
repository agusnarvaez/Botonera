let express = require('express'); // Solicitud de Express
let router = express.Router(); //Módulo Router de Express
const path = require('path');

/* *****Controlador de user***** */
let userController = require('../controllers/userController.js');

// ***Requerimiento de Multer, necesario para la recolección de archivos***
const multer = require('multer');
/* ***Configuración multer*** */
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/images');
    },
    filename: (req, file, cb) => {
        let fileName = Date.now() + path.extname(file.originalname) /*'${Date.now()}_img${path.extname(file.filename)}'*/;
        cb(null, fileName);
    }
});
const uploadFile = multer({ storage });

/* ***Configuración express-validator *** */
/* ***Sirve para validar correctamente los campos *** */
const { body } = require('express-validator'); //Se le aplica a body el paquete, se puede llamar check
const validateRegister = [ //Array de validaciones
    body('fullName').notEmpty().withMessage('Tienes que escribir un nombre'),
    body('email').notEmpty().withMessage('Tienes que escribir un mail').bail().isEmail().withMessage('Debes escribir un formato de correo válido'),
    body('birthday').notEmpty().withMessage('Debes ingresar una fecha'),
    body('address').notEmpty().withMessage('Tienes que agregar un domicilio'),
    body('avatar').custom((value, { req }) => {
        let file = req.file;
        let acceptedExtensions = ['.jpg', '.png', '.gif'];

        if (!file) {
            throw new Error('Tienes que subir una imagen');
        }
        else {
            let fileExtension = path.extname(file.originalname);
            if (!acceptedExtensions.includes(fileExtension)) {
                throw new Error("Las extenciones de archivo permitidas son " + acceptedExtensions.join(', '));
            }
        }
        return true;
    }),
    body('password').notEmpty().withMessage('Tienes que escribir una contraseña')
];
const validateLogin = [
    body('fullName').notEmpty().withMessage('Tienes que escribir un nombre'),
    body('email').notEmpty().withMessage('Tienes que escribir un mail').bail().isEmail().withMessage('Debes escribir un formato de correo válido'),
    body('password').notEmpty().withMessage('Tienes que escribir una contraseña')
];



/* *****Login***** */
router.get('/login', userController.login); // A página login
router.post('/login', validateLogin, userController.processLogin); // Ingreso de datos de login


/* *****Register***** */
router.get('/register', userController.register); // A página register
router.post('/register', uploadFile.single('avatar'), validateRegister, userController.processRegister); // Ingreso de datos de register

//Perfil de usuario
//router.get('/profile/:userId', userController.profile);

module.exports = router; // Exportación ruteo