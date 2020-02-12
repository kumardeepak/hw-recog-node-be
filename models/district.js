var mongoose = require("../db/mongoose");
var LOG = require('../logger/logger').logger
var Schema = mongoose.Schema;

var DistrictSchema = new Schema({
    _id: {type: String},
}, { strict: false });
var District = mongoose.model('district', DistrictSchema);


District.saveDistricts = function(districts, cb){
    District.collection.insertMany(districts,function(err,docs){
        if (err) {
            return cb(err, null);
        } else {
            LOG.debug('%s districts was successfully stored.', JSON.stringify(docs));
            return cb(null, docs);
        }
    })
}

District.updateDistrict = function (district, cb) {
    District.collection.findOneAndUpdate({ _id: mongoose.Types.ObjectId(district._id)}, { $set: { district_code: district.district_code, district_name: district.district_name,status: district.status} }, { upsert: false }, function (err, doc) {
        if (err) {
            LOG.error(err)
            cb(err, null)
        }
        LOG.debug(doc)
        cb(null, doc)
    });
}

District.findByCondition = function(condition, cb){
    District.find(condition, function (err, districts) {
        if (err) {
            LOG.error("Unable to find districts due to [%s]", JSON.stringify(err));
            return cb(err, null);
        }
        return cb(null, districts);
    })
}


module.exports = District;