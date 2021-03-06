var Teacher = require('../models/teacher');
var BaseModel = require('../models/basemodel');
var School = require('../models/school');
var Response = require('../models/response')
var APIStatus = require('../errors/apistatus')
var StatusCode = require('../errors/statuscodes').StatusCode
var LOG = require('../logger/logger').logger
var ClassDb = require('../models/class')

var COMPONENT = "teacher";
const STATUS_ACTIVE = 'ACTIVE'

exports.fetchTeachers = function (req, res) {
    let school = req.query.school
    let condition = { status: STATUS_ACTIVE }
    if (school) {
        condition['school_code'] = school
    }
    BaseModel.findByCondition(Teacher, condition, function (err, teachers) {
        if (err) {
            let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_SYSTEM, COMPONENT).getRspStatus()
            return res.status(apistatus.http.status).json(apistatus);
        }
        let response = new Response(StatusCode.SUCCESS, teachers).getRsp()
        return res.status(response.http.status).json(response);
    })

}

exports.updateTeachers = function (req, res) {
    if (!req.body || !req.body.teacher || !req.body.teacher.teacher_code || !req.body.teacher._id) {
        let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_MISSING_PARAMETERS, COMPONENT).getRspStatus()
        return res.status(apistatus.http.status).json(apistatus);
    }
    let teacher = req.body.teacher
    let teacher_obj_update = { teacher_code: teacher.teacher_code, teacher_name: teacher.teacher_name, statue: teacher.status, class_code: teacher.class_code }
    BaseModel.updateData(Teacher, teacher_obj_update, teacher._id, function (err, doc) {
        if (err) {
            let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_SYSTEM, COMPONENT).getRspStatus()
            return res.status(apistatus.http.status).json(apistatus);
        }
        let response = new Response(StatusCode.SUCCESS, COMPONENT).getRsp()
        return res.status(response.http.status).json(response);
    })
}

exports.saveTeachers = function (req, res) {
    if (!req.body || !req.body.teacher || !req.body.teacher.teacher_code || !req.body.teacher.teacher_name || !req.body.teacher.school_code || !req.body.teacher.class_code) {
        let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_MISSING_PARAMETERS, COMPONENT).getRspStatus()
        return res.status(apistatus.http.status).json(apistatus);
    }
    let teacher = req.body.teacher
    BaseModel.findByCondition(School, { school_code: teacher.school_code }, function (err, schools) {
        if (err || !schools || schools.length == 0) {
            let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_SCHOOL_NOTFOUND, COMPONENT).getRspStatus()
            return res.status(apistatus.http.status).json(apistatus);
        }
            BaseModel.findByCondition(ClassDb, { class_code: { "$in": teacher.class_code }}, function (err, classes) {
            if (err || !classes || classes.length == 0) {
                let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_CLASS_NOTFOUND, COMPONENT).getRspStatus()
                return res.status(apistatus.http.status).json(apistatus);
            }

            BaseModel.findByCondition(Teacher, { teacher_code: teacher.teacher_code, status: STATUS_ACTIVE }, function (err, teacherdb) {
                if (teacherdb && teacherdb.length > 0) {
                    let apistatus = new APIStatus(StatusCode.ERR_DATA_EXIST, COMPONENT).getRspStatus()
                    return res.status(apistatus.http.status).json(apistatus);
                }
                teacher.status = STATUS_ACTIVE
                teacher.created_on = new Date()
                BaseModel.saveData(Teacher, [teacher], function (err, doc) {
                    if (err) {
                        let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_SYSTEM, COMPONENT).getRspStatus()
                        return res.status(apistatus.http.status).json(apistatus);
                    }
                    let response = new Response(StatusCode.SUCCESS, COMPONENT).getRsp()
                    return res.status(response.http.status).json(response);
                })
            })
        })

    })
}