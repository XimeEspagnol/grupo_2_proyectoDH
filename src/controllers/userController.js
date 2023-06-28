const path = require('path');
const fs = require('fs');
let userId = JSON.parse(fs.readFileSync(path.resolve('./src/database/users.json')))

const controller = {

    login: (req,res) =>{
       return res.render('login')
    },
    register: (req,res) =>{
       return res.render ('register')
    },

    processRegister: (req, res) =>{        
         let userNuevo = {
             "id": userId.length + 1,
             "nombreCompleto": req.body.nombreCompleto,
             "email": req.body.usuario,
             "contrasenia": req.body.contrasenia,
             "perfilDeUsuario": "comprador",
             "borrado": false
    }

    fs.writeFileSync(path.resolve('./src/database/users.json'), JSON.stringify([...userId, userNuevo], null, 2), "utf-8")
    return res.redirect('/user/'+ userNuevo.id)

   },

    users: (req, res) => {
      userId = JSON.parse(fs.readFileSync(path.resolve('./src/database/users.json')))
      const userFound = userId.find(row=> row.id == req.params.id)
      if (userFound) return res.render('userfound', { users: userFound })
      else return res.send("Para poder ingresar, debe registrarse")
   },
   }


module.exports = controller;