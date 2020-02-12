var School = require('../models/school');
var Cluster = require('../models/cluster');
var Response = require('../models/response')
var APIStatus = require('../errors/apistatus')
var StatusCode = require('../errors/statuscodes').StatusCode
var LOG = require('../logger/logger').logger

var COMPONENT = "school";
const SATUS_ACTIVE = 'ACTIVE'

exports.fetchSchools = function (req, res) {
    let cluster = req.query.cluster
    let condition = { status: SATUS_ACTIVE }
    if (cluster) {
        condition['cluster_code'] = cluster
    }
    School.findByCondition(condition, function (err, schools) {
        if (err) {
            let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_SYSTEM, COMPONENT).getRspStatus()
            return res.status(apistatus.http.status).json(apistatus);
        }
        let response = new Response(StatusCode.SUCCESS, schools).getRsp()
        return res.status(response.http.status).json(response);
    })

}

exports.updateSchools = function (req, res) {
    if (!req.body || !req.body.school || !req.body.school.school_code) {
        let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_MISSING_PARAMETERS, COMPONENT).getRspStatus()
        return res.status(apistatus.http.status).json(apistatus);
    }
    let school = req.body.school
    School.updateSchool(school, function (err, doc) {
        if (err) {
            let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_SYSTEM, COMPONENT).getRspStatus()
            return res.status(apistatus.http.status).json(apistatus);
        }
        let response = new Response(StatusCode.SUCCESS, COMPONENT).getRsp()
        return res.status(response.http.status).json(response);
    })
}

exports.saveSchools = function (req, res) {
    if (!req.body || !req.body.school || !req.body.school.school_code || !req.body.school.school_name || !req.body.school.cluster_code) {
        let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_MISSING_PARAMETERS, COMPONENT).getRspStatus()
        return res.status(apistatus.http.status).json(apistatus);
    }
    let school = req.body.school
    Cluster.findByCondition({ cluster_code: school.cluster_code }, function (err, clusters) {
        if (err || !clusters && clusters.length == 0) {
            let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_CLUSTER_NOTFOUND, COMPONENT).getRspStatus()
            return res.status(apistatus.http.status).json(apistatus);
        }
        School.findByCondition({ school_code: school.school_code, status: SATUS_ACTIVE }, function (err, schooldb) {
            if (schooldb && schooldb.length > 0) {
                let apistatus = new APIStatus(StatusCode.ERR_DATA_EXIST, COMPONENT).getRspStatus()
                return res.status(apistatus.http.status).json(apistatus);
            }
            school.status = SATUS_ACTIVE
            school.created_on = new Date()
            School.saveSchools([school], function (err, doc) {
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