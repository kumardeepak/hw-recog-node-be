var mongoose = require("../db/mongoose");
var LOG = require('../logger/logger').logger
var Schema = mongoose.Schema;

var ClassSchema = new Schema({
    _id: {type: String},
}, { strict: false });
var Class = mongoose.model('class', ClassSchema);


module.exports = Class;