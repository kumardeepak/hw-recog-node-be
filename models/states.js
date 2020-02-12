var mongoose = require("../db/mongoose");
var LOG = require('../logger/logger').logger
var Schema = mongoose.Schema;

var StateSchema = new Schema({
    _id: {type: String},
}, { strict: false });
var State = mongoose.model('state', StateSchema);


State.saveStates = function(states, cb){
    State.collection.insertMany(states,function(err,docs){
        if (err) {
            return cb(err, null);
        } else {
            LOG.debug('%s states was successfully stored.', JSON.stringify(docs));
            return cb(null, docs);
        }
    })
}

State.updateState = function (state, cb) {
    State.collection.findOneAndUpdate({ _id: mongoose.Types.ObjectId(state._id)}, { $set: { state_code: state.state_code, state_name: state.state_name,status: state.status} }, { upsert: false }, function (err, doc) {
        if (err) {
            LOG.error(err)
            cb(err, null)
        }
        LOG.debug(doc)
        cb(null, doc)
    });
}

State.findByCondition = function(condition, cb){
    State.find(condition, function (err, states) {
        if (err) {
            LOG.error("Unable to find States due to [%s]", JSON.stringify(err));
            return cb(err, null);
        }
        return cb(null, states);
    })
}


module.exports = State;