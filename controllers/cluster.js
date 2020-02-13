var Cluster = require('../models/cluster');
var Block = require('../models/block');
var Response = require('../models/response')
var APIStatus = require('../errors/apistatus')
var StatusCode = require('../errors/statuscodes').StatusCode
var LOG = require('../logger/logger').logger

var COMPONENT = "cluster";
const STAUS_ACTIVE = 'ACTIVE'

exports.fetchClusters = function (req, res) {
    let block = req.query.block
    let condition = { status: STAUS_ACTIVE }
    if (block) {
        condition['block_code'] = block
    }
    Cluster.findByCondition(condition, function (err, clusters) {
        if (err) {
            let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_SYSTEM, COMPONENT).getRspStatus()
            return res.status(apistatus.http.status).json(apistatus);
        }
        let response = new Response(StatusCode.SUCCESS, clusters).getRsp()
        return res.status(response.http.status).json(response);
    })

}

exports.updateClusters = function (req, res) {
    if (!req.body || !req.body.cluster || !req.body.cluster.cluster_code) {
        let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_MISSING_PARAMETERS, COMPONENT).getRspStatus()
        return res.status(apistatus.http.status).json(apistatus);
    }
    let cluster = req.body.cluster
    Cluster.updateCluster(cluster, function (err, doc) {
        if (err) {
            let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_SYSTEM, COMPONENT).getRspStatus()
            return res.status(apistatus.http.status).json(apistatus);
        }
        let response = new Response(StatusCode.SUCCESS, COMPONENT).getRsp()
        return res.status(response.http.status).json(response);
    })
}

exports.saveClusters = function (req, res) {
    if (!req.body || !req.body.cluster || !req.body.cluster.cluster_code || !req.body.cluster.cluster_name || !req.body.cluster.block_code) {
        let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_MISSING_PARAMETERS, COMPONENT).getRspStatus()
        return res.status(apistatus.http.status).json(apistatus);
    }
    let cluster = req.body.cluster
    Block.findByCondition({ block_code: cluster.block_code }, function (err, blocks) {
        if (err || !blocks && blocks.length == 0) {
            let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_BLOCK_NOTFOUND, COMPONENT).getRspStatus()
            return res.status(apistatus.http.status).json(apistatus);
        }
        Cluster.findByCondition({ cluster_code: cluster.cluster_code, status: STAUS_ACTIVE }, function (err, clusterdb) {
            if (clusterdb && clusterdb.length > 0) {
                let apistatus = new APIStatus(StatusCode.ERR_DATA_EXIST, COMPONENT).getRspStatus()
                return res.status(apistatus.http.status).json(apistatus);
            }
            cluster.status = STAUS_ACTIVE
            cluster.created_on = new Date()
            Cluster.saveClusters([cluster], function (err, doc) {
                if (err) {
                    let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_SYSTEM, COMPONENT).getRspStatus()
                    return res.status(apistatus.http.status).json(apistatus);
                }
                let response = new Response(StatusCode.SUCCESS, COMPONENT).getRsp()
                return res.status(response.http.status).json(response);
            })
        })
    })
}