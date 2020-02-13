var mongoose = require("../db/mongoose");
var Schema = mongoose.Schema;

var ExamSchema = new Schema({
    _id: {type: String},
}, { strict: false });
var Exam = mongoose.model('school_exam', ExamSchema, 'school_exam');


module.exports = Exam;