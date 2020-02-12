var mongoose = require("../db/mongoose");
var LOG = require('../logger/logger').logger
var Schema = mongoose.Schema;

var BlockSchema = new Schema({
    _id: {type: String},
}, { strict: false });
var Block = mongoose.model('block', BlockSchema);


Block.saveBlocks = function(blocks, cb){
    Block.collection.insertMany(blocks,function(err,docs){
        if (err) {
            return cb(err, null);
        } else {
            LOG.debug('%s blocks was successfully stored.', JSON.stringify(docs));
            return cb(null, docs);
        }
    })
}

Block.updateBlock = function (Block, cb) {
    Block.collection.findOneAndUpdate({ _id: mongoose.Types.ObjectId(block._id)}, { $set: { block_code: block.block_code, block_name: block.block_name,status: block.status} }, { upsert: false }, function (err, doc) {
        if (err) {
            LOG.error(err)
            cb(err, null)
        }
        LOG.debug(doc)
        cb(null, doc)
    });
}

Block.findByCondition = function(condition, cb){
    Block.find(condition, function (err, blocks) {
        if (err) {
            LOG.error("Unable to find blocks due to [%s]", JSON.stringify(err));
            return cb(err, null);
        }
        return cb(null, blocks);
    })
}


module.exports = Block;