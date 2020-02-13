var mongoose = require("../db/mongoose");
var Schema = mongoose.Schema;

var StudentSchema = new Schema({
    _id: {type: String},
}, { strict: false });
var Student = mongoose.model('school_student', StudentSchema, 'school_student');


module.exports = Student;