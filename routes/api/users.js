const express = require('express')
const passport = require('passport')
const jwt = require('jsonwebtoken')
const UserModel = require('../../models/user')
const axios = require('axios')
const crypto = require('crypto');
const sha256 = x => crypto.createHash('sha256').update(x, 'utf8').digest('hex');

const fs = require('fs')

const router = express.Router()

//Registo de um utilizador
// router.post('/', passport.authenticate('registo', {session: false,
//     successRedirect: '/users/login',
//     failureRedirect: '/users'    
// }))

router.post('/registo', function(req, res, next) {
    console.log("Entrei no post de /api/users")
    
    passport.authenticate('registo', function(err, user, info){

        if (err) 
            return next(new Error("Utilizador já se encontra registado!"))

        if (!user)
            return res.jsonp(new Error("Erro no registo do utilizador! Tente novamente mais tarde ..."))
        
        console.log("Body no post de /api/users " + JSON.stringify(req.body))
        console.log("Passport já atuou")
        console.log("User : " + user)

        res.redirect("/servicoautenticacao/users/login")
        
        //return res.jsonp(user)
    })(req, res, next);
})

//Login
router.post('/login', async(req, res, next) => {
    console.log('Eu chegei ao login')
    passport.authenticate('login', async(err, user, info) => {
        console.log("AQUIII")
        try{
            if(err || !user){
                if(err)
                    return next(new Error('Erro na autenticação! Tente novamente mais tarde ...'))
                else
                    return next(new Error('Utilizador inexistente ...'))
            }
            req.login(user, {session: false}, async (error) => {
                if(error) return next(new Error('Erro no login! Tente novamente mais tarde ...'))
                //vou usar isto como payload
                var myuser = {_id: user._id, email: user.email}
                var token = jwt.sign({user: myuser}, 'dweb2018')
                req.session.token = token

                token = sha256(token)

                UserModel.updateOne({email: user.email}, {$set: {token: token}})
                .then(_ =>{
                    console.log('FIZ UM UPDATE UPDATE UPDATE UHUHUH')
                   res.redirect('http://' + req.hostname + ':80/servicoemail/enviaEmail?token='+token)
                })
                .catch(erroToken =>{
                    console.log("ERRO AO INSERIR TOKEN")
                    res.redirect('http://' + req.hostname + ':80/servicoemail/enviaEmail')
                })

            })
        }
        catch(error) {
            return next(new Error('Erro na autenticação! Tente novamente mais tarde ...'))
        }
    })(req, res, next)
})

router.post('/logout', async(req, res, next) => {
    if(req.body.email && req.body.token && req.body.token != ""){
        // UserModel.findOne({email: req.body.email, token: req.body.token})
        //         .then(user =>{
                    UserModel.updateOne({email: req.body.email, token: req.body.token}, {$set: {token: ""}})
                    .then(dados =>{
                        console.log('FIZ UM LOGOUT: ')
                        console.dir(dados)
                        res.jsonp("Logout feito com sucesso")
                    })
                    .catch(erroToken =>{
                        console.log("ERRO AO FAZER LOGOUT")
                        res.jsonp("Erro ao fazer Logout")
                    })
                // })
                // .catch()
    }
})

router.get('/info', (req, res) => {
    
    if(req.query.token && req.query.token != ""){
        console.log('RECEBEMOS O TOKEN :::::: =>>=>=>=>')
        console.dir(req.query.token)
        UserModel.findOne({token: req.query.token}, {email: 1, _id: 0})
            .then(email => res.jsonp(email))
            .catch(erro => res.status(500).send('Erro na istagem de utilizadores ' + erro))
    }
    else{
        res.jsonp(null);
    }
    
})

module.exports = router