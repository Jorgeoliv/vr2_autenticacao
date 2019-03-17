const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const Schema = mongoose.Schema

var UserSchema = new Schema({
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    token: {type: String, required: false}
})

//pre-ação
//1ºargumento é a ação
UserSchema.pre('save', async function(next){
    var hash = await bcrypt.hash(this.password, 10)
    this.password = hash
    next()
})

UserSchema.methods.isValidPassword = async function (password){
    var user = this
    var compare = await bcrypt.compare(password, user.password)
    return compare
}

//A coleção da base de dados vai ser "users"
var UserModel = mongoose.model('user', UserSchema)

module.exports = UserModel