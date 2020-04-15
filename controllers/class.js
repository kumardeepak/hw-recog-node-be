var ClassDB = require('../models/class')
var BaseModel = require('../models/basemodel');
var School = require('../models/school');
var Response = require('../models/response')
var APIStatus = require('../errors/apistatus')
var StatusCode = require('../errors/statuscodes').StatusCode
var LOG = require('../logger/logger').logger

var COMPONENT = "class";
const STATUS_ACTIVE = 'ACTIVE'

exports.fetchClasses = function (req, res) {
    let reqClass = req.query.class

    let condition = { status: STATUS_ACTIVE }
    if (reqClass) {
        condition['class_code'] = reqClass
    }
    BaseModel.findByCondition(ClassDB, condition, function (err, classes) {
        if (err) {
            let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_SYSTEM, COMPONENT).getRspStatus()
            return res.status(apistatus.http.status).json(apistatus);
        }
        let response = new Response(StatusCode.SUCCESS, classes).getRsp()
        return res.status(response.http.status).json(response);
    })

}

exports.updateClasses = function (req, res) {
    if (!req.body || !req.body.class || !req.body.class.class_code || !req.body.class._id) {
        let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_MISSING_PARAMETERS, COMPONENT).getRspStatus()
        return res.status(apistatus.http.status).json(apistatus);
    }
    let reqClass = req.body.class

    let class_obj_update = {class_code: reqClass.class_code, class_name: reqClass.class_name, school_code: reqClass.school_code, statue: reqClass.status}

    BaseModel.updateData(ClassDB, class_obj_update, reqClass._id, function (err, doc) {
        if (err) {
            let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_SYSTEM, COMPONENT).getRspStatus()
            return res.status(apistatus.http.status).json(apistatus);
        }
        let response = new Response(StatusCode.SUCCESS, COMPONENT).getRsp()
        return res.status(response.http.status).json(response);
    })
}

exports.saveClasses = function (req, res) {
    if (!req.body || !req.body.class || !req.body.class.class_code || !req.body.class.class_name || !req.body.class.school_code) {
        let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_MISSING_PARAMETERS, COMPONENT).getRspStatus()
        return res.status(apistatus.http.status).json(apistatus);
    }
    let reqClass = req.body.class

    BaseModel.findByCondition(School, { school_code: reqClass.school_code }, function (err, schools) {
        if (err || !schools || schools.length == 0) {
            let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_SCHOOL_NOTFOUND, COMPONENT).getRspStatus()
            return res.status(apistatus.http.status).json(apistatus);
        }
        BaseModel.findByCondition(ClassDB, { class_code: reqClass.class_code, status: STATUS_ACTIVE }, function (err, classdb) {
            if (classdb && classdb.length > 0) {
                let apistatus = new APIStatus(StatusCode.ERR_DATA_EXIST, COMPONENT).getRspStatus()
                return res.status(apistatus.http.status).json(apistatus);
            }
            reqClass.status = STATUS_ACTIVE
            reqClass.created_on = new Date()
            BaseModel.saveData(ClassDB, [reqClass], function (err, doc) {
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