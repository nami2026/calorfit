//iniciamos express
const express = require('express');
const app = express();

//2 - seteamos urlencoded para capturar datos del formulario
app.use(express.urlencoded({extended:false}))
app.use(express.json())

//3 - invocamos a dotenv
const dotenv = require('dotenv')
dotenv.config({path: './env/.env'})

//4 - el direcotrio public
app.use('/resources', express.static('public'))
app.use('/resources', express.static(__dirname + '/public'))


//5 - Establecer el motor de plantillas
app.set('view engine', 'ejs')

//6 - Invocamos a bcryptjs
const bcryptjs = require('bcryptjs');

//7 - Invocamos a bcryptjs
const session = require('express-session');
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}))

//8 - invocamos el módulo de la conexión
const connection = require('./database/db');

//console.log(__dirname);
//9 - register
app.post('/register', async (req, res) => {
    const user = req.body.user;
    const name = req.body.name;
    const rol = req.body.rol;
    const pass = req.body.pass;

    let passwordHash = await bcryptjs.hash(pass, 8);
    connection.query('INSERT INTO users SET ?', {user: user, name: name, rol: rol, pass: passwordHash}, async(error, results) => {
        if (error) {
            console.log(error);
        } else {
            res.render('register', {
                alert: true,
                alertTitle: "Registration",
                alertMessage: "¡Successful registration!",
                alertIcon: 'success',
                showConfirmButton: false,
                timer: 1500,
                ruta: ''
            });
        }
    })
})

//10 - auth
app.post('/auth', async(req, res) => {
    const user = req.body.user;
    const pass = req.body.pass;

    let passwordHash = await bcryptjs.hash(pass, 8);
    if (user && pass) {
        connection.query('SELECT * FROM users WHERE user = ?', [user], async(error, results) => {
            if (results.length == 0 || !(await bcryptjs.compare(pass, results[0].pass))) {
                res.render('login', {
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "¡Usuario y/o password incorrectos!",
                    alertIcon: 'error',
                    showConfirmButton: true,
                    timer: 3000,
                    ruta: 'login'
                })
            }else {
                req.session.loggedin = true
                req.session.name = results[0].name
                res.render('login', {
                    alert: true,
                    alertTitle: "Conexión exitosa",
                    alertMessage: "¡LOGIN CORRECTO!",
                    alertIcon: 'success',
                    showConfirmButton: false,
                    timer: 1500,
                    ruta: ''
                })
            }
        })
    } else {
        res.render('login', {
            alert: true,
            alertTitle: "Advertencia",
            alertMessage: "¡Por favor ingrese un usuario y/o password!",
            alertIcon: 'warning',
            showConfirmButton: false,
            timer: 3000,
            ruta: 'login'
        })
    }
})

//11 - auth pages
app.get('/', (req, res) => {
    if (req.session.loggedin) {
        res.render('index', {
            login: true,
            name: req.session.name
        });
    } else {
        res.render('index', {
            login: false,
            name: 'Debes iniciar sesión'
        })
    }
})

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/')
    });
})

app.get('/', (req, res) => {
    res.render('index', {msg: 'Este es un mensaje desde node'})
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.get('/register', (req, res) => {
    res.render('register')
})

app.listen(3000, (req, res) => {
    console.log('Server running in http://localhost:3000');
})