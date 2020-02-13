var mongoose = require("../db/mongoose");
var LOG = require('../logger/logger').logger
var Schema = mongoose.Schema;

var TeacherSchema = new Schema({
    _id: {type: String},
}, { strict: false });
var Teacher = mongoose.model('teacher', TeacherSchema);


module.exports = Teacher;