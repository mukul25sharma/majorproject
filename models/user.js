const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");


const userSchema = new Schema({
 email: {
    type: String,
    required: true
 }
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);
//passport local mongoose automatically add a username or hash and salt field