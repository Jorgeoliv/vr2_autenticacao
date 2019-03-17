const passport = require('passport')
const localStrategy = require('passport-local').Strategy
const UserModel = require('../models/user')

// Registo de um utilizador
passport.use('registo', new localStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async (email, password, done) => {
    console.log("EMAIL")
    console.dir(email)

    console.log("PASS")
    console.dir(password)

    try{
        var user = await UserModel.create({email, password})
        return done(null, user)
    }
    catch(error){
        console.log('Aconteceu um erro: ' + error)
        return done(error)
    }
}))

//Login de Utilizadores
passport.use('login', new localStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async (email, password, done) => {
    console.log("Tou auqi no auth")
    try{
        var user = await UserModel.findOne({email})
        if(!user) 
            return done(null, false, {message: 'O utilizador não existe'})

        let valid = await user.isValidPassword(password)
        if(!valid)
            return done(null, false, {message: 'Password inválida!'})
        else
            return done(null, user, {message: 'Login feito com sucesso'})
    }
    catch(error){
        console.log('Aconteceu um erro: ' + error)
        return done(error)
    }
}))

//Autenticacao com JWT
const JWTStrategy = require('passport-jwt').Strategy
const ExtractJWT = require('passport-jwt').ExtractJwt

var extractFromSession = function(req){
    var token = null
    if(req && req.session)
        token = req.session.token
    return token
}

passport.use(new JWTStrategy({
    secretOrKey: 'dweb2018',
    //isto vai ser um middleware a intercetar os pedidos, e temos de lhe dizer onde é que está o token
    jwtFromRequest: ExtractJWT.fromExtractors([extractFromSession])
}, async(token, done) => {
    try{
        done(null, token.user)
    }
    catch(error){
        console.log('Deu erro na autenticacao com jwt ' + error)
        return done(error)
    }
}))
