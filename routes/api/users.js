const express = require('express')
const passport = require('passport')
const jwt = require('jsonwebtoken')
const UserModel = require('../../models/user')
const axios = require('axios')
const crypto = require('crypto');
const sha256 = x => crypto.createHash('sha256').update(x, 'utf8').digest('hex');

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

        res.redirect("/users/login")
        
        //return res.jsonp(user)
    })(req, res, next);
})

//Login
router.post('/login', async(req, res, next) => {
    console.log('Eu chegei ao login')
    console.log('lalalala')
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
                    // console.log('O token é: ' + token)
                    // console.dir(token)
                    // console.log('=======================')
                    // console.log('O utilizador é: ')
                    // console.dir(myuser)
                    console.log('FIZ UM UPDATE UPDATE UPDATE UHUHUH')
                    res.redirect('http://localhost:4000/enviaEmail?token='+token)
                    //res.redirect('/api/users/' + user.email)
                })
                .catch(erroToken =>{
                    console.log("ERRO AO INSERIR TOKEN")
                    res.redirect('http://localhost:4000/enviaEmail')
                })

            })
        }
        catch(error) {
            return next(new Error('Erro na autenticação! Tente novamente mais tarde ...'))
        }
    })(req, res, next)
})

router.get('/info', (req, res) => {
    console.log('RECEBEMOS O TOKEN :::::: =>>=>=>=>')
    console.dir(req.query.token)
    UserModel.findOne({token: req.query.token}, {email: 1, _id: 0})
        .then(email => res.jsonp(email))
        .catch(erro => res.status(500).send('Erro na istagem de utilizadores ' + erro))
    
})

module.exports = router