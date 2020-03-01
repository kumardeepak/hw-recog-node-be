var mongoose = require("../db/mongoose");
var LOG = require('../logger/logger').logger
var Schema = mongoose.Schema;

var OcrSchema = new Schema({
    _id: {type: String},
}, { strict: false });
var OcrData = mongoose.model('ocrdata', OcrSchema, 'ocrdata');


module.exports = OcrData;