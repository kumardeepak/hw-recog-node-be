var mongoose = require("../db/mongoose");
var LOG = require('../logger/logger').logger
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    _id: {type: String},
}, { strict: false });
var User = mongoose.model('user', UserSchema);


module.exports = User;