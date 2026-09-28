const express = require('express')
const router = express.Router()
//const conexion = require('../database/db')
const authController = require('../controllers/authController')

//Rutas para las Vistas 'Views'
router.get('/', authController.isauthenticated,(req,res)=>{
    res.render('index', {email:req.email})
})

router.get('/login',(req,res)=>{
    res.render('login',{alert:false})
})
router.get('/register',(req,res)=>{
    res.render('register')
})

router.get('/register2',(req,res)=>{
    res.render('register2')
})

// Ruta para actualizar el nombre (protegida con isauthenticated)
router.post('/actualizar', authController.isauthenticated, authController.updateName);

//Router para los metodos de controllers s
 router.post('/register', authController.register)
 router.post('/login', authController.login)
 router.get('/logout',authController.logout)

// Ruta para ver la lista de usuarios (protegida)
router.get('/users', authController.isauthenticated, authController.listUsers);

// Ruta para actualizar un usuario específico por su ID
router.post('/update-user/:id', authController.isauthenticated, authController.updateUser);

// Ruta para eliminar un usuario por su ID
router.get('/delete-user/:id', authController.isauthenticated, authController.deleteUser);

module.exports= router
