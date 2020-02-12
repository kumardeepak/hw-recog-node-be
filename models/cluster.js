var mongoose = require("../db/mongoose");
var LOG = require('../logger/logger').logger
var Schema = mongoose.Schema;

var ClusterSchema = new Schema({
    _id: {type: String},
}, { strict: false });
var Cluster = mongoose.model('cluster', ClusterSchema);


Cluster.saveClusters = function(clusters, cb){
    Cluster.collection.insertMany(clusters,function(err,docs){
        if (err) {
            return cb(err, null);
        } else {
            LOG.debug('%s clusters was successfully stored.', JSON.stringify(docs));
            return cb(null, docs);
        }
    })
}

Cluster.updateCluster = function (cluster, cb) {
    Cluster.collection.findOneAndUpdate({ _id: mongoose.Types.ObjectId(cluster._id)}, { $set: { cluster_code: cluster.cluster_code, cluster_name: cluster.cluster_name,status: cluster.status} }, { upsert: false }, function (err, doc) {
        if (err) {
            LOG.error(err)
            cb(err, null)
        }
        LOG.debug(doc)
        cb(null, doc)
    });
}

Cluster.findByCondition = function(condition, cb){
    Cluster.find(condition, function (err, clusters) {
        if (err) {
            LOG.error("Unable to find clusters due to [%s]", JSON.stringify(err));
            return cb(err, null);
        }
        return cb(null, clusters);
    })
}


module.exports = Cluster;