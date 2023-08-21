const path = require('path');
const fs = require('fs');
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
//let userId = JSON.parse(fs.readFileSync(path.resolve('./src/database/users.json')));
let db = require('../database/models');

const userController = {

    login: (req, res) => {
        return res.render('login')
    },
    processLogin: (req, res) => {
        const usuario = db.Users.findOne({
            where: {
                email: req.body.loginEmail
            }
        });
        if (usuario) {
            if (bcrypt.compareSync(req.body.loginPassword, usuario.contrasenia)) {
                //delete usuario.contrasenia
                req.session.usuarioLogueado = usuario.email
                req.session.fotoPerfil = usuario.fotoPerfil
                req.session.nombre = usuario.nombre
                req.session.apellido = usuario.apellido
                if (req.body.cookie) res.cookie('recordame', req.body.loginEmail, { maxAge: 10006060 })
                return res.redirect('/user/perfil')
            } else {
                return res.render('login', {
                    errors: {
                        datosMal: {
                            msg: 'Datos incorrectos'
                        }
                    }
                })
            }
        } else {
            return res.render('login', {
                errors: {
                    datosMal: {
                        msg: 'Datos incorrectos'
                    }
                }
            })
        }
    },
    register: (req, res) => {
        let userExists = { msg: "" }
        return res.render('register', { userExists: userExists })
    },

    processRegister: (req, res) => {
        const rdoValidacion = validationResult(req)
        let userExists = { msg: "" }
        if (rdoValidacion.errors.length > 0) return res.render('register', { errors: rdoValidacion.mapped(), oldData: req.body, userExists: userExists })
    },
    create: async function (req, res) {
        try {
            console.log(req.body.email)
            const usuarioEncontrado = db.Users.findOne({
                where: {
                    email: req.body.usuario
                }
            })
            if (usuarioEncontrado == undefined) {
                const usuarioCreado = await db.users.create({
                    nombre: req.body.nombre,
                    apellido: req.body.apellido,
                    email: req.body.usuario,
                    fotoPerfil: req.body.fotoPerfil,
                    contrasenia: req.body.contrasenia
                })
                res.redirect('/users')
            }
        } catch (error) {
            console.log(error);
        }


        const userFound = db.Users.findOne({
            where: {
                email: req.body.usuario
            }
        });
        if (!userFound) {
            let fotoPerfilNueva = "default-user.jpg"

            if (req.file) {
                if (req.body.fotoRegistro != "") fotoPerfilNueva = req.file.filename
            }
            let userNuevo = {
                "id": req.body.id.length + 1,
                "nombre": req.body.nombre,
                "apellido": req.body.apellido,
                "email": req.body.usuario,
                "fotoPerfil": fotoPerfilNueva,
                "contrasenia": bcrypt.hashSync(req.body.contrasenia, 10),
                "perfilDeUsuario": "comprador",
                "borrado": false
            }

            req.session.usuarioLogueado = userNuevo.email
            return res.redirect('/user/perfil')

        } else {
            let userExists = { msg: "mail ya existente" }
            return res.render('register', { userExists: userExists })
        }
    },



    users: async function (req, res) {
        try {
            const usuarioCreado = await db.users.create({
                nombre: req.body.nombre,
                apellido: req.body.apellido,
                email: req.body.email,
                fotoPerfil: req.body.fotoPerfil,
                contrasenia: req.body.contrasenia
            })
            res.redirect('/users')
        } catch (error) {
            console.log(error);


            const userFound = db.Users.findOne({
                where: {
                    email: req.session.usuarioLogueado
                }
            });
            if (userFound) return res.render('userfound', { users: userFound })
            else return res.render("login")
        }
    },


    logout: (req, res) => {
        req.session.destroy()
        res.clearCookie("recordame")
        return res.redirect('/')
    }

}


module.exports = userController;


