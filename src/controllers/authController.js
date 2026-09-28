const jwt = require('jsonwebtoken')
const bcryptjs = require('bcryptjs')
const conexion = require('../database/db')
const { promisify } = require('util')

// Promesas para Registrar usuario
exports.register = async (req, res) => {
    try {
        const name = req.body.name
        const email = req.body.email
        const password = req.body.password
        
        let passHash = await bcryptjs.hash(password, 8)
        
        conexion.query('INSERT INTO users SET ?', { email: email, name: name, password: passHash }, (error, results) => {
            if (error) { 
                console.log(error) 
            }
            // Después de registrarse, lo mandamos al login para que inicie sesión
            res.redirect('/login')
        })
    } catch (error) {
        console.log(error)
    }
}

// Lógica de Inicio de Sesión
exports.login = async (req, res) => {
    try {
        const email = req.body.email
        const password = req.body.password

        if (!email || !password) {
            res.render('login', {
                alert: true,
                alertTitle: "Advertencia",
                alertMessage: "Ingrese un email y password",
                alertIcon: 'info',
                showConfirmButton: true,
                timer: false,
                ruta: 'login'
            })
        } else {
            conexion.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {
                if (results.length == 0 || ! (await bcryptjs.compare(password, results[0].password))) {
                    res.render('login', {
                        alert: true,
                        alertTitle: "Error",
                        alertMessage: "Usuario y/o Password incorrectos",
                        alertIcon: 'error',
                        showConfirmButton: true,
                        timer: false,
                        ruta: 'login'
                    })
                } else {
                    // Login Correcto
                    const id = results[0].id
                    const token = jwt.sign({ id: id }, process.env.JWT_SECRETO, {
                        expiresIn: process.env.JWT_TIEMPO_EXPIRA
                    })
                    
                    // Cookies
                    const cookiesOptions = {
                        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
                        httpOnly: true
                    }
                    res.cookie('jwt', token, cookiesOptions)
                    
                    // CORRECCIÓN CLAVE: Redirigimos al index (dashboard) tras el éxito
                    return res.redirect('/')
                }
            })
        }
    } catch (error) {
        console.log(error)
    }
}

// Middleware de Autenticación
exports.isauthenticated = async (req, res, next) => {
    if (req.cookies?.jwt) {
        try {
            const decodificada = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRETO)
            conexion.query('SELECT * FROM users WHERE id = ?', [decodificada.id], (error, results) => {
                if (!results || results.length === 0) {
                    return next()
                }
                req.email = results[0] // Almacena los datos del usuario para usarlos en el index
                return next()
            })
        } catch (error) {
            console.log(error)
            return next()
        }
    } else {
        res.redirect('/login')
    }
}

// Actualizar nombre de usuario
exports.updateName = async (req, res) => {
    try {
        const { newName } = req.body;
        // req.email ya tiene los datos del usuario gracias al middleware isauthenticated
        const userId = req.email.id; 

        if (!newName) {
            return res.redirect('/');
        }

        // Actualizamos en la base de datos
        conexion.query('UPDATE users SET name = ? WHERE id = ?', [newName, userId], (error, results) => {
            if (error) {
                console.log(error);
            }
            // Redirigimos de vuelta al dashboard para ver el cambio reflejado
            res.redirect('/');
        });
    } catch (error) {
        console.log(error);
        res.redirect('/');
    }
};

// Listar todos los usuarios registrados
exports.listUsers = (req, res) => {
    conexion.query('SELECT id, name, email FROM users', (error, results) => {
        if (error) {
            console.log(error);
            return res.redirect('/');
        }
        // Renderizamos una vista nueva llamada 'users' pasándole la lista y el usuario activo
        res.render('users', { email: req.email, users: results });
    });
};

// Actualizar usuario desde la lista de administración
exports.updateUser = (req, res) => {
    const id = req.params.id;
    const { name, email } = req.body;
    
    conexion.query('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, id], (error, results) => {
        if (error) {
            console.log(error);
        }
        res.redirect('/users');
    });
};

// Eliminar usuario
exports.deleteUser = (req, res) => {
    const id = req.params.id;
    
    conexion.query('DELETE FROM users WHERE id = ?', [id], (error, results) => {
        if (error) {
            console.log(error);
        }
        res.redirect('/users');
    });
};

// Cerrar Sesión
exports.logout = (req, res) => {
    res.clearCookie('jwt')
    return res.redirect('/login')
}