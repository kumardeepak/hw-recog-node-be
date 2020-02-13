var mongoose = require("../db/mongoose");
var LOG = require('../logger/logger').logger
var Schema = mongoose.Schema;

var OcrSchema = new Schema({
    _id: {type: String},
}, { strict: false });
var Ocr = mongoose.model('master_ocr', OcrSchema, 'master_ocr');


module.exports = Ocr;