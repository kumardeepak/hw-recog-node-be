var mongoose = require("../db/mongoose");
var LOG = require('../logger/logger').logger
var Schema = mongoose.Schema;

var SchoolSchema = new Schema({
    _id: {type: String},
}, { strict: false });
var School = mongoose.model('School', SchoolSchema);


School.saveSchools = function(schools, cb){
    School.collection.insertMany(schools,function(err,docs){
        if (err) {
            return cb(err, null);
        } else {
            LOG.debug('%s schools was successfully stored.', JSON.stringify(docs));
            return cb(null, docs);
        }
    })
}

School.updateSchool = function (School, cb) {
    School.collection.findOneAndUpdate({ _id: mongoose.Types.ObjectId(school._id)}, { $set: { school_code: school.school_code, school_name: school.school_name,status: school.status} }, { upsert: false }, function (err, doc) {
        if (err) {
            LOG.error(err)
            cb(err, null)
        }
        LOG.debug(doc)
        cb(null, doc)
    });
}

School.findByCondition = function(condition, cb){
    School.find(condition, function (err, schools) {
        if (err) {
            LOG.error("Unable to find schools due to [%s]", JSON.stringify(err));
            return cb(err, null);
        }
        return cb(null, schools);
    })
}


module.exports = School;