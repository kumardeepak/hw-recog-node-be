var Exam = require('../models/exam');
var BaseModel = require('../models/basemodel');
var School = require('../models/school');
var Response = require('../models/response')
var APIStatus = require('../errors/apistatus')
var StatusCode = require('../errors/statuscodes').StatusCode
var LOG = require('../logger/logger').logger

var COMPONENT = "exam";
const SATUS_ACTIVE = 'ACTIVE'

exports.fetchExams = function (req, res) {
    let school = req.query.school
    let exam_date = req.query.exam_date
    let condition = { status: SATUS_ACTIVE }
    if (school) {
        condition['school_code'] = school
    }
    if(exam_date){
        condition['exam_date'] = exam_date
    }
    BaseModel.findByCondition(Exam, condition, function (err, exams) {
        if (err) {
            let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_SYSTEM, COMPONENT).getRspStatus()
            return res.status(apistatus.http.status).json(apistatus);
        }
        let response = new Response(StatusCode.SUCCESS, exams).getRsp()
        return res.status(response.http.status).json(response);
    })

}

exports.updateExams = function (req, res) {
    if (!req.body || !req.body.exam || !req.body.exam.exam_code) {
        let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_MISSING_PARAMETERS, COMPONENT).getRspStatus()
        return res.status(apistatus.http.status).json(apistatus);
    }
    let exam = req.body.exam
    let exam_obj_update = {exam_code: exam.exam_code, exam_name: exam.exam_name, exam_date: exam.exam_date,statue: exam.status}
    BaseModel.updateData(Exam, exam_obj_update, exam._id, function (err, doc) {
        if (err) {
            let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_SYSTEM, COMPONENT).getRspStatus()
            return res.status(apistatus.http.status).json(apistatus);
        }
        let response = new Response(StatusCode.SUCCESS, COMPONENT).getRsp()
        return res.status(response.http.status).json(response);
    })
}

exports.saveExams = function (req, res) {
    if (!req.body || !req.body.exam || !req.body.exam.exam_code || !req.body.exam.exam_name || !req.body.exam.school_code || !req.body.exam.exam_date) {
        let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_MISSING_PARAMETERS, COMPONENT).getRspStatus()
        return res.status(apistatus.http.status).json(apistatus);
    }
    let exam = req.body.exam
    BaseModel.findByCondition(School, { school_code: exam.school_code }, function (err, schools) {
        if (err || !schools && schools.length == 0) {
            let apistatus = new APIStatus(StatusCode.ERR_GLOBAL_SCHOOL_NOTFOUND, COMPONENT).getRspStatus()
            return res.status(apistatus.http.status).json(apistatus);
        }
        BaseModel.findByCondition(Exam, { exam_code: exam.exam_code, status: SATUS_ACTIVE }, function (err, examdb) {
            if (examdb && examdb.length > 0) {
                let apistatus = new APIStatus(StatusCode.ERR_DATA_EXIST, COMPONENT).getRspStatus()
                return res.status(apistatus.http.status).json(apistatus);
            }
            exam.status = SATUS_ACTIVE
            exam.created_on = new Date()
            BaseModel.saveData(Exam, [exam], function (err, doc) {
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