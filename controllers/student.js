var Student = require('../models/student');
var BaseModel = require('../models/basemodel');
var School = require('../models/school');
var ClassDb = require('../models/class')
var Response = require('../models/response')
var APIStatus = require('../errors/apistatus')
var StatusCode = require('../errors/statuscodes').StatusCode
var LOG = require('../logger/logger').logger

var COMPONENT = "student";
const STATUS_ACTIVE = 'ACTIVE'

exports.fetchStudents = function (req, res) {
    let school = req.query.school
    let condition = { status: STATUS_ACTIVE }
    if (school) {
        condition['school_code'] = school
    }
    BaseModel.findByCondition(Student, condition, function (err, students) {
        if (err) {
            let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_SYSTEM, COMPONENT).getRspStatus()
            return res.status(apistatus.http.status).json(apistatus);
        }
        let response = new Response(StatusCode.SUCCESS, students).getRsp()
        return res.status(response.http.status).json(response);
    })

}

exports.updateStudents = function (req, res) {
    if (!req.body || !req.body.student || !req.body.student.student_code) {
        let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_MISSING_PARAMETERS, COMPONENT).getRspStatus()
        return res.status(apistatus.http.status).json(apistatus);
    }
    let student = req.body.student
    let student_obj_update = { student_code: student.student_code, student_name: student.student_name, statue: student.status, class_code: student.class_code }
    BaseModel.updateData(Student, student_obj_update, student._id, function (err, doc) {
        if (err) {
            let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_SYSTEM, COMPONENT).getRspStatus()
            return res.status(apistatus.http.status).json(apistatus);
        }
        let response = new Response(StatusCode.SUCCESS, COMPONENT).getRsp()
        return res.status(response.http.status).json(response);
    })
}

exports.saveStudents = function (req, res) {
    if (!req.body || !req.body.student || !req.body.student.student_code || !req.body.student.student_name || !req.body.student.school_code || !req.body.student.class_code) {
        let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_MISSING_PARAMETERS, COMPONENT).getRspStatus()
        return res.status(apistatus.http.status).json(apistatus);
    }
    let student = req.body.student
    BaseModel.findByCondition(School, { school_code: student.school_code }, function (err, schools) {
        if (err || !schools || schools.length == 0) {
            let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_SCHOOL_NOTFOUND, COMPONENT).getRspStatus()
            return res.status(apistatus.http.status).json(apistatus);
        }

        BaseModel.findByCondition(ClassDb, { class_code: student.class_code }, function (err, classes) {
            if (err || !classes || classes.length == 0) {
                console.log(err)
                let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_CLASS_NOTFOUND, COMPONENT).getRspStatus()
                return res.status(apistatus.http.status).json(apistatus);
            }
            // BaseModel.findByCondition(Student, { student_code: student.student_code, status: STATUS_ACTIVE }, function (err, studentdb) {
            // if (studentdb && studentdb.length > 0) {
            //     let apistatus = new APIStatus(StatusCode.ERR_DATA_EXIST, COMPONENT).getRspStatus()
            //     return res.status(apistatus.http.status).json(apistatus);
            // }
            LOG.info('----------Inserting Student---------------')
            student.status = STATUS_ACTIVE
            student.created_on = new Date()
            BaseModel.saveData(Student, [student], function (err, doc) {
                if (err) {
                    let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_SYSTEM, COMPONENT).getRspStatus()
                    return res.status(apistatus.http.status).json(apistatus);
                }
                LOG.info('----------Inserted Student---------------')

                let response = new Response(StatusCode.SUCCESS, COMPONENT).getRsp()
                return res.status(response.http.status).json(response);
            })
            // })
        })

    })
}